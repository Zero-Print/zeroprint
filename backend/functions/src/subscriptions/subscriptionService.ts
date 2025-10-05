/**
 * Subscription Service
 * Handles subscription business logic and Razorpay integration
 */

import {db} from "../lib/firebase";
import Razorpay from "razorpay";
import {
  Subscription,
  Payment,
  SubscriptionPlan,
  SUBSCRIPTION_PLANS,
  PlanId,
} from "../types/shared/subscriptions";
import {logAuditEvent} from "../lib/auditService";
import {logUserActivity} from "../lib/activityService";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
});

// db is already imported from ../lib/firebase

export class SubscriptionService {
  /**
   * Get subscription plan by ID
   */
  static getPlan(planId: PlanId): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find((plan) => plan.planId === planId) || null;
  }

  /**
   * Get all available plans
   */
  static getAllPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  /**
   * Get user's active subscription
   */
  static async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const snapshot = await db.collection("subscriptions")
        .where("userId", "==", userId)
        .where("status", "==", "active")
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data() as Subscription;
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      throw new Error("Failed to fetch subscription");
    }
  }

  /**
   * Create a new subscription order
   */
  static async createSubscription(
    userId: string,
    planId: PlanId,
    autoRenewal: boolean = true
  ): Promise<{
    subscriptionId: string;
    razorpayOrder: any;
    payment: Payment;
  }> {
    try {
      // Get plan details
      const plan = this.getPlan(planId);
      if (!plan) {
        throw new Error(`Invalid plan: ${planId}`);
      }

      // Check if user already has an active subscription
      const existingSubscription = await this.getUserSubscription(userId);
      if (existingSubscription) {
        throw new Error("User already has an active subscription");
      }

      // Generate IDs
      const subscriptionId = `sub_${Date.now()}_${userId.slice(-4)}`;
      const paymentId = `pay_${Date.now()}_${userId.slice(-4)}`;

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: plan.price * 100, // Amount in paise
        currency: plan.currency,
        receipt: paymentId,
        notes: {
          userId,
          planId,
          subscriptionId,
          type: "subscription",
        },
      });

      // Create pending subscription
      const subscription: Subscription = {
        subscriptionId,
        userId,
        planId,
        status: "pending",
        startDate: new Date().toISOString(),
        renewalDate: this.calculateRenewalDate(plan.interval),
        autoRenewal,
        razorpaySubscriptionId: razorpayOrder.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create pending payment
      const payment: Payment = {
        paymentId,
        userId,
        planId,
        subscriptionId,
        amount: plan.price,
        currency: plan.currency,
        status: "pending",
        razorpayOrderId: razorpayOrder.id,
        type: "subscription",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      await db.collection("subscriptions").doc(subscriptionId).set(subscription);
      await db.collection("payments").doc(paymentId).set(payment);

      // Log audit and activity
      await logAuditEvent(
        "subscription_initiated",
        userId,
        subscriptionId,
        {},
        {
          planId,
          amount: plan.price,
          razorpayOrderId: razorpayOrder.id,
        },
        "subscription"
      );

      await logUserActivity({
        userId,
        action: "subscription_initiated",
        category: "payment",
        details: {
          planId,
          planName: plan.name,
          amount: plan.price,
        },
      });

      return {
        subscriptionId,
        razorpayOrder,
        payment,
      };
    } catch (error) {
      console.error("Error creating subscription:", error);

      // Log error
      await logUserActivity({
        userId,
        action: "subscription_creation_failed",
        category: "error",
        details: {
          planId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  }

  /**
   * Activate subscription after successful payment
   */
  static async activateSubscription(
    subscriptionId: string,
    paymentDetails: {
      razorpayPaymentId: string;
      razorpaySignature: string;
    }
  ): Promise<void> {
    try {
      const subscriptionRef = db.collection("subscriptions").doc(subscriptionId);
      const subscription = await subscriptionRef.get();

      if (!subscription.exists) {
        throw new Error("Subscription not found");
      }

      const subscriptionData = subscription.data() as Subscription;
      const plan = this.getPlan(subscriptionData.planId);

      if (!plan) {
        throw new Error("Invalid plan");
      }

      // Update subscription status
      await subscriptionRef.update({
        status: "active",
        updatedAt: new Date().toISOString(),
      });

      // Update payment status
      const paymentQuery = await db.collection("payments")
        .where("subscriptionId", "==", subscriptionId)
        .where("status", "==", "pending")
        .limit(1)
        .get();

      if (!paymentQuery.empty) {
        const paymentDoc = paymentQuery.docs[0];
        await paymentDoc.ref.update({
          status: "success",
          razorpayPaymentId: paymentDetails.razorpayPaymentId,
          razorpaySignature: paymentDetails.razorpaySignature,
          updatedAt: new Date().toISOString(),
        });
      }

      // Add promo coins to wallet if applicable
      if (plan.promoCoins && plan.promoCoins > 0) {
        await this.addPromoCoinsToWallet(subscriptionData.userId, plan.promoCoins);
      }

      // Log audit and activity
      await logAuditEvent(
        "subscription_activated",
        subscriptionData.userId,
        subscriptionId,
        {},
        {
          planId: subscriptionData.planId,
          razorpayPaymentId: paymentDetails.razorpayPaymentId,
          amount: plan.price,
          promoCoins: plan.promoCoins,
        },
        "subscription"
      );

      await logUserActivity({
        userId: subscriptionData.userId,
        action: "subscription_activated",
        category: "payment",
        details: {
          planId: subscriptionData.planId,
          planName: plan.name,
          amount: plan.price,
          renewalDate: subscriptionData.renewalDate,
        },
      });
    } catch (error) {
      console.error("Error activating subscription:", error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    userId: string,
    subscriptionId: string,
    reason?: string
  ): Promise<void> {
    try {
      const subscriptionRef = db.collection("subscriptions").doc(subscriptionId);
      const subscription = await subscriptionRef.get();

      if (!subscription.exists) {
        throw new Error("Subscription not found");
      }

      const subscriptionData = subscription.data() as Subscription;

      // Verify ownership
      if (subscriptionData.userId !== userId) {
        throw new Error("Unauthorized: Cannot cancel another user's subscription");
      }

      // Update subscription status
      await subscriptionRef.update({
        status: "cancelled",
        endDate: new Date().toISOString(),
        autoRenewal: false,
        updatedAt: new Date().toISOString(),
        ...(reason && {cancelReason: reason}),
      });

      // Log audit and activity
      await logAuditEvent(
        "subscription_cancelled",
        userId,
        subscriptionId,
        {},
        {
          planId: subscriptionData.planId,
          reason,
          originalRenewalDate: subscriptionData.renewalDate,
        },
        "subscription"
      );

      await logUserActivity({
        userId,
        action: "subscription_cancelled",
        category: "payment",
        details: {
          planId: subscriptionData.planId,
          reason: reason || "User requested",
        },
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw error;
    }
  }

  /**
   * Process subscription renewal
   */
  static async renewSubscription(subscriptionId: string): Promise<void> {
    try {
      const subscriptionRef = db.collection("subscriptions").doc(subscriptionId);
      const subscription = await subscriptionRef.get();

      if (!subscription.exists) {
        throw new Error("Subscription not found");
      }

      const subscriptionData = subscription.data() as Subscription;
      const plan = this.getPlan(subscriptionData.planId);

      if (!plan) {
        throw new Error("Invalid plan");
      }

      // Calculate new renewal date
      const newRenewalDate = this.calculateRenewalDate(plan.interval, subscriptionData.renewalDate);

      // Update subscription
      await subscriptionRef.update({
        renewalDate: newRenewalDate,
        updatedAt: new Date().toISOString(),
      });

      // Log audit and activity
      await logAuditEvent(
        "subscription_renewed",
        subscriptionData.userId,
        subscriptionId,
        {},
        {
          planId: subscriptionData.planId,
          previousRenewalDate: subscriptionData.renewalDate,
          newRenewalDate,
          amount: plan.price,
        },
        "subscription"
      );

      await logUserActivity({
        userId: subscriptionData.userId,
        action: "subscription_renewed",
        category: "payment",
        details: {
          planId: subscriptionData.planId,
          planName: plan.name,
          renewalDate: newRenewalDate,
        },
      });
    } catch (error) {
      console.error("Error renewing subscription:", error);
      throw error;
    }
  }

  /**
   * Mark subscription as expired
   */
  static async expireSubscription(subscriptionId: string): Promise<void> {
    try {
      const subscriptionRef = db.collection("subscriptions").doc(subscriptionId);
      const subscription = await subscriptionRef.get();

      if (!subscription.exists) {
        return; // Already handled
      }

      const subscriptionData = subscription.data() as Subscription;

      await subscriptionRef.update({
        status: "expired",
        endDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Log audit and activity
      await logAuditEvent(
        "subscription_expired",
        subscriptionData.userId,
        subscriptionId,
        {},
        {
          planId: subscriptionData.planId,
          expiredAt: new Date().toISOString(),
        },
        "subscription"
      );

      await logUserActivity({
        userId: subscriptionData.userId,
        action: "subscription_expired",
        category: "payment",
        details: {
          planId: subscriptionData.planId,
        },
      });
    } catch (error) {
      console.error("Error expiring subscription:", error);
      throw error;
    }
  }

  /**
   * Add promo coins to user wallet
   */
  private static async addPromoCoinsToWallet(userId: string, coins: number): Promise<void> {
    try {
      const walletRef = db.collection("wallets").doc(userId);
      const wallet = await walletRef.get();

      if (wallet.exists) {
        const walletData = wallet.data();
        await walletRef.update({
          balance: (walletData?.balance || 0) + coins,
          totalEarned: (walletData?.totalEarned || 0) + coins,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        // Create new wallet
        await walletRef.set({
          userId,
          balance: coins,
          totalEarned: coins,
          totalSpent: 0,
          lastUpdated: new Date().toISOString(),
        });
      }

      // Log the coin addition
      await logUserActivity({
        userId,
        action: "promo_coins_added",
        category: "wallet",
        details: {
          coins,
          source: "subscription_promo",
        },
      });
    } catch (error) {
      console.error("Error adding promo coins:", error);
      // Don't throw error as subscription activation should still succeed
    }
  }

  /**
   * Calculate renewal date based on interval
   */
  private static calculateRenewalDate(
    interval: "month" | "year",
    fromDate?: string
  ): string {
    const baseDate = fromDate ? new Date(fromDate) : new Date();

    if (interval === "month") {
      baseDate.setMonth(baseDate.getMonth() + 1);
    } else if (interval === "year") {
      baseDate.setFullYear(baseDate.getFullYear() + 1);
    }

    return baseDate.toISOString();
  }

  /**
   * Get subscription analytics
   */
  static async getSubscriptionAnalytics(): Promise<{
    totalActive: number;
    totalExpired: number;
    totalCancelled: number;
    revenueThisMonth: number;
    planDistribution: Record<PlanId, number>;
  }> {
    try {
      const subscriptions = await db.collection("subscriptions").get();
      const payments = await db.collection("payments")
        .where("status", "==", "success")
        .where("createdAt", ">=", this.getStartOfMonth())
        .get();

      const analytics = {
        totalActive: 0,
        totalExpired: 0,
        totalCancelled: 0,
        revenueThisMonth: 0,
        planDistribution: {
          citizen: 0,
          school: 0,
          msme: 0,
        } as Record<PlanId, number>,
      };

      // Process subscriptions
      subscriptions.forEach((doc) => {
        const subscription = doc.data() as Subscription;

        switch (subscription.status) {
        case "active":
          analytics.totalActive++;
          break;
        case "expired":
          analytics.totalExpired++;
          break;
        case "cancelled":
          analytics.totalCancelled++;
          break;
        }

        if (subscription.status === "active") {
          analytics.planDistribution[subscription.planId]++;
        }
      });

      // Process payments for revenue
      payments.forEach((doc) => {
        const payment = doc.data() as Payment;
        analytics.revenueThisMonth += payment.amount;
      });

      return analytics;
    } catch (error) {
      console.error("Error getting subscription analytics:", error);
      throw error;
    }
  }

  private static getStartOfMonth(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }
}
