import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";
import {db} from "./firebase";
import {User, Game, SubscriptionPlanData} from "../types";

// Daily and monthly limits
export const DAILY_EARN_LIMIT = 500;
export const MONTHLY_REDEEM_LIMIT = 1000;

// Security validation functions
export class SecurityHelpers {
  /**
   * Validate that user exists and is active
   */
  static async validateUser(userId: string): Promise<User> {
    try {
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError("not-found", "User not found");
      }

      const user = userDoc.data() as User;
      if (!user.isActive) {
        throw new functions.https.HttpsError("permission-denied", "User account is inactive");
      }

      return user;
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError("internal", "Failed to validate user");
    }
  }

  /**
   * Validate that game exists and is active
   */
  static async validateGame(gameId: string): Promise<Game> {
    try {
      const gameDoc = await db.collection("games").doc(gameId).get();
      if (!gameDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Game not found");
      }

      const game = gameDoc.data() as Game;
      if (!game.isActive) {
        throw new functions.https.HttpsError("permission-denied", "Game is not active");
      }

      return game;
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError("internal", "Failed to validate game");
    }
  }

  /**
   * Validate subscription plan
   */
  static async validatePlan(planId: string): Promise<SubscriptionPlanData> {
    try {
      const planDoc = await db.collection("subscriptionPlans").doc(planId).get();
      if (!planDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Subscription plan not found");
      }

      const plan = planDoc.data() as SubscriptionPlanData;
      if (!plan.isActive) {
        throw new functions.https.HttpsError("permission-denied", "Subscription plan is not active");
      }

      return plan;
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError("internal", "Failed to validate plan");
    }
  }

  /**
   * Check daily earning cap for user
   */
  static async checkDailyEarnCap(userId: string, coinsToEarn: number): Promise<boolean> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const startOfDay = new Date(`${today}T00:00:00.000Z`);
      const endOfDay = new Date(`${today}T23:59:59.999Z`);

      const earningsQuery = await db.collection("auditLogs")
        .where("userId", "==", userId)
        .where("timestamp", ">=", startOfDay.toISOString())
        .where("timestamp", "<=", endOfDay.toISOString())
        .get();

      let dailyEarnings = 0;
      const earningActions = new Set([
        "earnCoins",
        "logCarbonAction",
        "logMoodCheckin",
        "logAnimalAction",
      ]);

      earningsQuery.docs.forEach((doc) => {
        const data = doc.data();
        if (!earningActions.has(data.action)) {
          return;
        }

        const coinsFromAction = data.details?.coins ?? data.details?.coinsAwarded ?? 0;
        if (typeof coinsFromAction === "number") {
          dailyEarnings += coinsFromAction;
        }
      });

      return (dailyEarnings + coinsToEarn) <= DAILY_EARN_LIMIT;
    } catch (error) {
      console.error("Error checking daily earn cap:", error);
      return false;
    }
  }

  /**
   * Check monthly redeem cap for user
   */
  static async checkMonthlyRedeemCap(userId: string, coinsToRedeem: number): Promise<boolean> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const redemptionsQuery = await db.collection("auditLogs")
        .where("userId", "==", userId)
        .where("action", "==", "redeemCoins")
        .where("timestamp", ">=", startOfMonth.toISOString())
        .where("timestamp", "<=", endOfMonth.toISOString())
        .get();

      let monthlyRedemptions = 0;
      redemptionsQuery.docs.forEach((doc) => {
        const data = doc.data();
        if (data.details && data.details.amount) {
          monthlyRedemptions += data.details.amount;
        }
      });

      return (monthlyRedemptions + coinsToRedeem) <= MONTHLY_REDEEM_LIMIT;
    } catch (error) {
      console.error("Error checking monthly redeem cap:", error);
      return false;
    }
  }

  /**
   * Validate authentication context (v2 only)
   */
  static validateAuth(request: CallableRequest<any>): string {
    const auth = request.auth;
    if (!auth) {
      throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
    }
    return auth.uid;
  }

  /**
   * Validate input parameters
   */
  static validateRequired(params: Record<string, any>, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (params[field] === undefined || params[field] === null) {
        throw new functions.https.HttpsError("invalid-argument", `Missing required field: ${field}`);
      }
    }
  }

  /**
   * Validate numeric values
   */
  static validateNumeric(value: any, fieldName: string, min?: number, max?: number): number {
    if (typeof value !== "number" || isNaN(value)) {
      throw new functions.https.HttpsError("invalid-argument", `${fieldName} must be a valid number`);
    }

    if (min !== undefined && value < min) {
      throw new functions.https.HttpsError("invalid-argument", `${fieldName} must be at least ${min}`);
    }

    if (max !== undefined && value > max) {
      throw new functions.https.HttpsError("invalid-argument", `${fieldName} must be at most ${max}`);
    }

    return value;
  }

  /**
   * Generate unique ID with prefix
   */
  static generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate subscription plan
   */
  static async validateSubscriptionPlan(planId: string) {
    const validPlans = {
      "basic": {name: "Basic", price: 999, features: ["basic_features"]},
      "premium": {name: "Premium", price: 1999, features: ["premium_features"]},
      "enterprise": {name: "Enterprise", price: 4999, features: ["enterprise_features"]},
    };

    const plan = validPlans[planId as keyof typeof validPlans];

    if (!plan) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid subscription plan");
    }

    return plan;
  }

  /**
   * Create standardized response
   */
  static createResponse(status: "success" | "error", message: string, data?: any) {
    return {
      status,
      message,
      data: data || null,
      timestamp: new Date().toISOString(),
    };
  }
}
