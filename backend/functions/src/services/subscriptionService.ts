/**
 * Subscription Service - isolates Firestore operations for subscription management
 */

import {BaseService} from "./baseService";
import {SubscriptionPlan, Subscription} from "../types";
import {validateRequiredFields} from "../lib/validators";

export class SubscriptionService extends BaseService {
  async getPlans(): Promise<SubscriptionPlan[]> {
    return this.executeWithMetrics(
      async () => {
        const plans = await this.db
          .collection("subscriptionPlans")
          .where("isActive", "==", true)
          .get();

        return plans.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as SubscriptionPlan
        );
      },
      "subscription_get_plans",
      {},
      "subscriptions"
    );
  }

  async checkout(userId: string, planId: string): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, planId}, ["userId", "planId"]);

        // Get plan details
        const planDoc = await this.db.collection("subscriptionPlans").doc(planId).get();
        if (!planDoc.exists) {
          throw new Error("Subscription plan not found");
        }

        const plan = this.convertFromFirestore(planDoc.data()) as SubscriptionPlan;

        // Create Razorpay order (mock)
        const orderId = `order_${Date.now()}`;

        return {
          orderId,
          amount: plan.price,
          currency: plan.currency,
          planId,
          planName: plan.name,
        };
      },
      "subscription_checkout",
      {userId, planId},
      "subscriptions"
    );
  }

  async cancel(userId: string, subscriptionId: string): Promise<Subscription> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, subscriptionId}, ["userId", "subscriptionId"]);

        // Get subscription
        const subDoc = await this.db.collection("subscriptions").doc(subscriptionId).get();
        if (!subDoc.exists) {
          throw new Error("Subscription not found");
        }

        const subscription = this.convertFromFirestore(subDoc.data()) as Subscription;

        // Update subscription status
        const updatedSubscription: Subscription = {
          ...subscription,
          status: "cancelled",
          updatedAt: new Date().toISOString(),
        };

        await this.db.collection("subscriptions").doc(subscriptionId).set(
          this.sanitizeForFirestore(updatedSubscription)
        );

        // Log activity
        await this.logActivity(
          userId,
          "subscriptionCancelled",
          {subscriptionId},
          "subscriptions"
        );

        return updatedSubscription;
      },
      "subscription_cancel",
      {userId, subscriptionId},
      "subscriptions"
    );
  }

  async getStatus(userId: string): Promise<Subscription | null> {
    return this.executeWithMetrics(
      async () => {
        const subscriptions = await this.db
          .collection("subscriptions")
          .where("userId", "==", userId)
          .where("status", "==", "active")
          .limit(1)
          .get();

        if (subscriptions.empty) {
          return null;
        }

        return this.convertFromFirestore(subscriptions.docs[0].data()) as Subscription;
      },
      "subscription_get_status",
      {userId},
      "subscriptions"
    );
  }
}
