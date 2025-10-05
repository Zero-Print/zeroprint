
import {onCall, onRequest} from "firebase-functions/v2/https";
import {setGlobalOptions} from "firebase-functions/v2";
// Auth validation helpers - simplified for now
const validateUser = async (request: any) => {
  if (!request.auth?.uid) {
    throw new Error("Unauthorized: No user authenticated");
  }
  return request.auth;
};

const validateAdmin = async (request: any) => {
  if (!request.auth?.uid) {
    throw new Error("Unauthorized: No user authenticated");
  }
  // Simple admin check - in production, this would check admin roles
  if (!request.auth.token?.admin && !request.auth.token?.email?.includes("admin")) {
    throw new Error("Unauthorized: Admin access required");
  }
  return request.auth;
};
import {SubscriptionService} from "./subscriptionService";
import {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  CancelSubscriptionRequest,
  RazorpayWebhookPayload,
} from "../types/shared/subscriptions";
import crypto from "crypto";
import {logErrorEvent} from "../lib/errorService";
import {logUserActivity} from "../lib/activityService";
import {logAuditEvent} from "../lib/auditService";
import {firestore} from "firebase-admin";
import {createSubscriptionSchema, cancelSubscriptionSchema} from "../lib/schemas";
import {ok, err} from "../lib/apiResponse";

// Set global options
setGlobalOptions({
  region: "asia-south1",
  maxInstances: 10,
});

const db = firestore();

/**
 * Get all available subscription plans
 */
export const getSubscriptionPlans = onCall(
  {cors: true},
  async (request) => {
    try {
      const plans = SubscriptionService.getAllPlans();
      return ok(plans);
    } catch (error) {
      console.error("Error getting subscription plans:", error);
      return err(error instanceof Error ? error.message : "Failed to get subscription plans");
    }
  }
);

/**
 * Get user's current subscription
 */
export const getUserSubscription = onCall(
  {cors: true},
  async (request) => {
    try {
      // Validate user authentication
      const user = await validateUser(request);

      const subscription = await SubscriptionService.getUserSubscription(user.uid);

      return ok(subscription);
    } catch (error) {
      console.error("Error getting user subscription:", error);
      return err(error instanceof Error ? error.message : "Failed to get subscription");
    }
  }
);

/**
 * Create a new subscription
 */
export const createSubscription = onCall<CreateSubscriptionRequest>(
  {cors: true},
  async (request) => {
    try {
      // Validate user authentication
      const user = await validateUser(request);
      const {planId, autoRenewal = true} = createSubscriptionSchema.parse(request.data);

      const result = await SubscriptionService.createSubscription(
        user.uid,
        planId,
        autoRenewal
      );

      return ok<CreateSubscriptionResponse>({
        success: true,
        subscriptionId: result.subscriptionId,
        razorpayOrder: {
          id: result.razorpayOrder.id,
          currency: result.razorpayOrder.currency,
          amount: result.razorpayOrder.amount,
        },
      } as any);
    } catch (error) {
      console.error("Error creating subscription:", error);
      return err(error instanceof Error ? error.message : "Failed to create subscription");
    }
  }
);

/**
 * Cancel subscription
 */
export const cancelSubscription = onCall<CancelSubscriptionRequest>(
  {cors: true},
  async (request) => {
    try {
      // Validate user authentication
      const user = await validateUser(request);
      const {subscriptionId, reason} = cancelSubscriptionSchema.parse(request.data);

      await SubscriptionService.cancelSubscription(user.uid, subscriptionId, reason);

      return ok({message: "Subscription cancelled successfully"});
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      return err(error instanceof Error ? error.message : "Failed to cancel subscription");
    }
  }
);

/**
 * Process Razorpay payment webhook
 */
export const processPaymentWebhook = onRequest(
  {cors: true},
  async (request, response) => {
    try {
      if (request.method !== "POST") {
        response.status(405).json({error: "Method not allowed"});
        return;
      }

      const webhookSignature = request.headers["x-razorpay-signature"] as string;
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

      if (!webhookSecret) {
        throw new Error("Webhook secret not configured");
      }

      // Verify webhook signature
      const body = JSON.stringify(request.body);
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      if (!crypto.timingSafeEqual(
        Uint8Array.from(Buffer.from(webhookSignature)),
        Uint8Array.from(Buffer.from(expectedSignature))
      )) {
        await logErrorEvent(
          "subscription",
          "invalid_webhook_signature",
          "Razorpay webhook signature validation failed",
          undefined,
          undefined,
          "high"
        );
        response.status(401).json({error: "Invalid signature"});
        return;
      }

      const payload = request.body as RazorpayWebhookPayload;

      switch (payload.event) {
      case "payment.captured":
        await handlePaymentCaptured(payload);
        break;
      case "payment.failed":
        await handlePaymentFailed(payload);
        break;
      case "subscription.charged":
        await handleSubscriptionCharged(payload);
        break;
      case "subscription.cancelled":
        await handleSubscriptionCancelled(payload);
        break;
      default:
        console.log(`Unhandled webhook event: ${payload.event}`);
      }

      response.status(200).json({status: "ok"});
    } catch (error) {
      console.error("Error processing webhook:", error);

      await logErrorEvent(
        "subscription",
        "webhook_processing_failed",
        error instanceof Error ? error.message : "Unknown webhook error",
        error instanceof Error ? error : undefined,
        undefined,
        "high"
      );

      response.status(500).json({
        error: error instanceof Error ? error.message : "Webhook processing failed",
      });
    }
  }
);

/**
 * Get subscription analytics (Admin only)
 */
export const getSubscriptionAnalytics = onCall(
  {cors: true},
  async (request) => {
    try {
      // Validate admin authentication
      await validateAdmin(request);

      const analytics = await SubscriptionService.getSubscriptionAnalytics();
      return ok(analytics);
    } catch (error) {
      console.error("Error getting subscription analytics:", error);
      return err(error instanceof Error ? error.message : "Failed to get analytics");
    }
  }
);

/**
 * Handle successful payment capture
 */
async function handlePaymentCaptured(payload: RazorpayWebhookPayload): Promise<void> {
  try {
    const payment = payload.payload.payment?.entity;
    if (!payment) return;

    const notes = payment.notes || {};
    const subscriptionId = notes.subscriptionId;

    if (subscriptionId) {
      await SubscriptionService.activateSubscription(subscriptionId, {
        razorpayPaymentId: payment.id,
        razorpaySignature: payment.signature || "",
      });
    }
  } catch (error) {
    console.error("Error handling payment captured:", error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payload: RazorpayWebhookPayload): Promise<void> {
  try {
    const rzPay = payload.payload.payment?.entity;
    if (!rzPay) return;

    const notes = rzPay.notes || {};
    const subscriptionId = notes.subscriptionId;

    let userId: string | undefined = notes.userId;
    let failingPaymentDocId: string | undefined;

    if (subscriptionId) {
      // Update payment document to failed
      const paymentsQuery = await db.collection("payments")
        .where("subscriptionId", "==", subscriptionId)
        .where("status", "==", "pending")
        .limit(1)
        .get();

      if (!paymentsQuery.empty) {
        const payDoc = paymentsQuery.docs[0];
        failingPaymentDocId = payDoc.id;
        await payDoc.ref.update({
          status: "failed",
          razorpayPaymentId: rzPay.id,
          failureReason: rzPay.error_description || "unknown",
          updatedAt: new Date().toISOString(),
        });
      }

      // Fetch subscription for userId fallback
      const subSnap = await db.collection("subscriptions").doc(subscriptionId).get();
      if (subSnap.exists) {
        const sub = subSnap.data() as any;
        userId = userId || sub.userId;
      }

      // Mark subscription as failed/expired
      await SubscriptionService.expireSubscription(subscriptionId);
    }

    // Log the failure (error + audit + activity)
    await logErrorEvent(
      "subscription",
      "payment_failed",
      `Payment failed for subscription ${subscriptionId}`,
      undefined,
      userId,
      "high"
    );

    if (userId && subscriptionId) {
      await logAuditEvent(
        "payment_failed",
        userId,
        failingPaymentDocId || rzPay.id,
        {},
        {
          subscriptionId,
          orderId: rzPay.order_id,
          paymentId: rzPay.id,
          reason: rzPay.error_description,
        },
        "subscription"
      );

      await logUserActivity({
        userId,
        action: "subscription_payment_failed",
        details: {
          subscriptionId,
          paymentId: rzPay.id,
          orderId: rzPay.order_id,
        },
      });
    }
  } catch (error) {
    console.error("Error handling payment failed:", error);
    throw error;
  }
}

/**
 * Handle subscription charged (renewal)
 */
async function handleSubscriptionCharged(payload: RazorpayWebhookPayload): Promise<void> {
  try {
    const subscription = payload.payload.subscription?.entity;
    if (!subscription) return;

    const subscriptionId = subscription.notes?.subscriptionId;
    if (subscriptionId) {
      await SubscriptionService.renewSubscription(subscriptionId);
    }
  } catch (error) {
    console.error("Error handling subscription charged:", error);
    throw error;
  }
}

/**
 * Handle subscription cancelled
 */
async function handleSubscriptionCancelled(payload: RazorpayWebhookPayload): Promise<void> {
  try {
    const subscription = payload.payload.subscription?.entity;
    if (!subscription) return;

    const subscriptionId = subscription.notes?.subscriptionId;
    if (subscriptionId) {
      await SubscriptionService.expireSubscription(subscriptionId);
    }
  } catch (error) {
    console.error("Error handling subscription cancelled:", error);
    throw error;
  }
}
