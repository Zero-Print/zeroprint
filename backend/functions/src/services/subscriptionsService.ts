/**
 * Subscriptions Service
 * Handles subscription plans, Razorpay checkout, and webhook processing
 */

import {BaseService} from "./baseService";
import {SubscriptionPlan, Subscription, Payment} from "../types/shared";
import {validateRequiredFields} from "../lib/validators";
import {webhookSecurity} from "../lib/webhookSecurity";
import Razorpay from "razorpay";

export class SubscriptionsService extends BaseService {
  private razorpay: Razorpay;

  constructor() {
    super();
    // Only initialize Razorpay if credentials are provided
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    } else {
      console.warn("Razorpay credentials not provided. Payment features will be disabled.");
      this.razorpay = null as any;
    }
  }

  /**
   * Get subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return this.executeWithMetrics(
      async () => {
        const snapshot = await this.db
          .collection("subscriptionPlans")
          .where("isActive", "==", true)
          .orderBy("price")
          .get();

        return snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as SubscriptionPlan
        );
      },
      "subscriptions_get_plans",
      {},
      "subscriptions"
    );
  }

  /**
   * Get user's subscription status
   */
  async getSubscriptionStatus(userId: string): Promise<Subscription | null> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId}, ["userId"]);

        const snapshot = await this.db
          .collection("subscriptions")
          .where("userId", "==", userId)
          .where("status", "in", ["active", "pending"])
          .orderBy("createdAt", "desc")
          .limit(1)
          .get();

        if (snapshot.empty) {
          return null;
        }

        return this.convertFromFirestore(snapshot.docs[0].data()) as Subscription;
      },
      "subscriptions_get_status",
      {userId},
      "subscriptions"
    );
  }

  /**
   * Create subscription checkout
   */
  async createCheckoutOrder(
    userId: string,
    planId: string,
    userEmail: string,
    userName: string
  ): Promise<{ orderId: string; amount: number; currency: string; keyId: string; order: any }> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, planId, userEmail, userName},
          ["userId", "planId", "userEmail", "userName"]);

        // Get plan details
        const planDoc = await this.db.collection("subscriptionPlans").doc(planId).get();
        if (!planDoc.exists || !planDoc.data()?.isActive) {
          throw new Error("Subscription plan not found or inactive");
        }

        const plan = this.convertFromFirestore(planDoc.data()) as SubscriptionPlan;

        // Create Razorpay order
        const amountInPaise = plan.price * 100; // Razorpay expects amount in paise

        if (!this.razorpay) {
          throw new Error("Payment service not configured. Please contact support.");
        }

        const order = await this.razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `receipt_${userId}_${Date.now()}`,
          notes: {
            userId,
            planId,
            planName: plan.name,
          },
        });

        // Create pending subscription record
        const subscription: Subscription = {
          id: this.db.collection("subscriptions").doc().id,
          userId,
          planId,
          planName: plan.name,
          amount: plan.price,
          currency: "INR",
          status: "pending",
          autoRenew: true,
          razorpayOrderId: order.id,
          razorpayPaymentId: null,
          // razorpaySignature: null, // This property doesn't exist in Subscription interface
          startDate: null,
          endDate: null,
          metadata: {
            order,
            userEmail,
            userName,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save subscription
        await this.db.collection("subscriptions").doc(subscription.id).set(
          this.sanitizeForFirestore(subscription)
        );

        // Log audit trail
        await this.logAudit(
          "subscriptionCheckoutInitiated",
          userId,
          userId,
          {planId, orderId: order.id},
          subscription,
          "SubscriptionsService:createCheckoutOrder"
        );

        // Log activity
        await this.logActivity(
          userId,
          "subscriptionCheckoutInitiated",
          {planName: plan.name, orderId: order.id},
          "subscriptions"
        );

        return {
          orderId: order.id,
          amount: typeof order.amount === "string" ? parseInt(order.amount) : order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID || "",
          order,
        };
      },
      "subscriptions_create_checkout",
      {userId, planId, userEmail, userName},
      "subscriptions"
    );
  }

  /**
   * Handle Razorpay webhook
   */
  async handleRazorpayWebhook(payload: any, signature: string): Promise<void> {
    return this.executeWithMetrics(
      async () => {
        // Verify webhook signature
        const isValid = webhookSecurity.verifyRazorpayWebhook(payload, signature, process.env.RAZORPAY_WEBHOOK_SECRET || "");
        if (!isValid) {
          throw new Error("Invalid webhook signature");
        }

        const event = payload.event;
        const paymentEntity = payload.payload.payment?.entity;
        const orderEntity = payload.payload.order?.entity;

        if (event === "payment.captured") {
          await this.handlePaymentCaptured(paymentEntity, orderEntity);
        } else if (event === "payment.failed") {
          await this.handlePaymentFailed(paymentEntity, orderEntity);
        } else if (event === "order.paid") {
          await this.handleOrderPaid(orderEntity);
        }

        // Log webhook event
        await this.logActivity(
          "system",
          "razorpayWebhookReceived",
          {event, paymentId: paymentEntity?.id, orderId: orderEntity?.id},
          "subscriptions"
        );
      },
      "subscriptions_handle_webhook",
      {event: payload.event},
      "subscriptions"
    );
  }

  /**
   * Handle payment captured
   */
  private async handlePaymentCaptured(paymentEntity: any, orderEntity: any): Promise<void> {
    const orderId = orderEntity.id;

    // Find subscription by order ID
    const subscriptionSnapshot = await this.db
      .collection("subscriptions")
      .where("razorpayOrderId", "==", orderId)
      .limit(1)
      .get();

    if (subscriptionSnapshot.empty) {
      throw new Error("Subscription not found for order");
    }

    const subscriptionDoc = subscriptionSnapshot.docs[0];
    const subscription = this.convertFromFirestore(subscriptionDoc.data()) as Subscription;

    // Update subscription status
    const updatedSubscription: Subscription = {
      ...subscription,
      status: "active",
      razorpayPaymentId: paymentEntity.id,
      razorpaySignature: paymentEntity.signature,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      updatedAt: new Date().toISOString(),
    };

    await subscriptionDoc.ref.update(this.sanitizeForFirestore(updatedSubscription));

    // Create payment record
    const payment: Payment = {
      id: this.db.collection("payments").doc().id,
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amount: subscription.amount,
      currency: subscription.currency,
      status: "completed",
      paymentMethod: "razorpay",
      razorpayPaymentId: paymentEntity.id,
      razorpayOrderId: orderId,
      metadata: {
        paymentEntity,
        orderEntity,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.db.collection("payments").doc(payment.id).set(
      this.sanitizeForFirestore(payment)
    );

    // Log audit trail
    await this.logAudit(
      "subscriptionActivated",
      subscription.userId,
      subscription.userId,
      subscription,
      updatedSubscription,
      "SubscriptionsService:handlePaymentCaptured"
    );

    // Log activity
    await this.logActivity(
      subscription.userId,
      "subscriptionActivated",
      {planName: subscription.planName, amount: subscription.amount},
      "subscriptions"
    );
  }

  /**
   * Handle payment failed
   */
  private async handlePaymentFailed(paymentEntity: any, orderEntity: any): Promise<void> {
    const orderId = orderEntity.id;

    // Find subscription by order ID
    const subscriptionSnapshot = await this.db
      .collection("subscriptions")
      .where("razorpayOrderId", "==", orderId)
      .limit(1)
      .get();

    if (subscriptionSnapshot.empty) {
      throw new Error("Subscription not found for order");
    }

    const subscriptionDoc = subscriptionSnapshot.docs[0];
    const subscription = this.convertFromFirestore(subscriptionDoc.data()) as Subscription;

    // Update subscription status
    const updatedSubscription: Subscription = {
      ...subscription,
      status: "cancelled",
      razorpayPaymentId: paymentEntity.id,
      updatedAt: new Date().toISOString(),
    };

    await subscriptionDoc.ref.update(this.sanitizeForFirestore(updatedSubscription));

    // Log audit trail
    await this.logAudit(
      "subscriptionFailed",
      subscription.userId,
      subscription.userId,
      subscription,
      updatedSubscription,
      "SubscriptionsService:handlePaymentFailed"
    );

    // Log activity
    await this.logActivity(
      subscription.userId,
      "subscriptionFailed",
      {planName: subscription.planName, reason: "Payment failed"},
      "subscriptions"
    );
  }

  /**
   * Handle order paid
   */
  private async handleOrderPaid(orderEntity: any): Promise<void> {
    const orderId = orderEntity.id;

    // Find subscription by order ID
    const subscriptionSnapshot = await this.db
      .collection("subscriptions")
      .where("razorpayOrderId", "==", orderId)
      .limit(1)
      .get();

    if (subscriptionSnapshot.empty) {
      throw new Error("Subscription not found for order");
    }

    const subscriptionDoc = subscriptionSnapshot.docs[0];
    const subscription = this.convertFromFirestore(subscriptionDoc.data()) as Subscription;

    // Update subscription status if not already active
    if (subscription.status === "pending") {
      const updatedSubscription: Subscription = {
        ...subscription,
        status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        updatedAt: new Date().toISOString(),
      };

      await subscriptionDoc.ref.update(this.sanitizeForFirestore(updatedSubscription));

      // Log audit trail
      await this.logAudit(
        "subscriptionActivated",
        subscription.userId,
        subscription.userId,
        subscription,
        updatedSubscription,
        "SubscriptionsService:handleOrderPaid"
      );
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    userId: string,
    subscriptionId: string,
    reason?: string
  ): Promise<Subscription> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, subscriptionId}, ["userId", "subscriptionId"]);

        const subscriptionDoc = await this.db.collection("subscriptions").doc(subscriptionId).get();

        if (!subscriptionDoc.exists) {
          throw new Error("Subscription not found");
        }

        const subscription = this.convertFromFirestore(subscriptionDoc.data()) as Subscription;

        if (subscription.userId !== userId) {
          throw new Error("Unauthorized to cancel this subscription");
        }

        if (subscription.status !== "active") {
          throw new Error("Only active subscriptions can be cancelled");
        }

        // Update subscription status
        const updatedSubscription: Subscription = {
          ...subscription,
          status: "cancelled",
          endDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await subscriptionDoc.ref.update(this.sanitizeForFirestore(updatedSubscription));

        // Log audit trail
        await this.logAudit(
          "subscriptionCancelled",
          userId,
          userId,
          subscription,
          updatedSubscription,
          "SubscriptionsService:cancelSubscription"
        );

        // Log activity
        await this.logActivity(
          userId,
          "subscriptionCancelled",
          {planName: subscription.planName, reason},
          "subscriptions"
        );

        return updatedSubscription;
      },
      "subscriptions_cancel",
      {userId, subscriptionId, reason},
      "subscriptions"
    );
  }

  /**
   * Get subscription analytics (admin only)
   */
  async getSubscriptionAnalytics(): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        const [activeSubscriptions, totalSubscriptions, monthlyRevenue] = await Promise.all([
          this.db.collection("subscriptions").where("status", "==", "active").get(),
          this.db.collection("subscriptions").get(),
          this.db.collection("payments").where("status", "==", "completed").get(),
        ]);

        const activeCount = activeSubscriptions.size;
        const totalCount = totalSubscriptions.size;
        const revenue = monthlyRevenue.docs.reduce((sum, doc) => {
          const payment = doc.data() as Payment;
          return sum + payment.amount;
        }, 0);

        // Calculate conversion rate
        const conversionRate = totalCount > 0 ? (activeCount / totalCount) * 100 : 0;

        // Get plan breakdown
        const planBreakdown = await this.getPlanBreakdown();

        return {
          activeSubscriptions: activeCount,
          totalSubscriptions: totalCount,
          conversionRate: Math.round(conversionRate * 100) / 100,
          monthlyRevenue: revenue,
          planBreakdown,
        };
      },
      "subscriptions_get_analytics",
      {},
      "subscriptions"
    );
  }

  /**
   * Get plan breakdown
   */
  private async getPlanBreakdown(): Promise<any> {
    const plans = await this.getSubscriptionPlans();
    const breakdown = [];

    for (const plan of plans) {
      const count = await this.db
        .collection("subscriptions")
        .where("planId", "==", plan.id)
        .where("status", "==", "active")
        .get();

      breakdown.push({
        planId: plan.id,
        planName: plan.name,
        count: count.size,
        revenue: count.size * plan.price,
      });
    }

    return breakdown;
  }
}

export const subscriptionsService = new SubscriptionsService();
