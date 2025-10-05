import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

/**
 * Validates if a transaction is within the user's daily and monthly caps
 *
 * @param userId The user ID to check caps for
 * @param amount The amount of the current transaction
 * @param dailyLimit The maximum daily limit
 * @param monthlyLimit The maximum monthly limit
 * @returns Object with validation result and reason if invalid
 */
export async function validateCapsAndLimits(
  userId: string,
  amount: number,
  dailyLimit: number,
  monthlyLimit: number
): Promise<{ valid: boolean; reason?: string }> {
  const db = admin.firestore();
  const userLimitsRef = db.collection("userLimits").doc(userId);

  try {
    // Get current user limits data
    const userLimitsDoc = await userLimitsRef.get();

    const now = new Date();

    // If user doesn't exist yet, create a new record
    if (!userLimitsDoc.exists) {
      await userLimitsRef.set({
        dailyUsage: amount,
        monthlyUsage: amount,
        lastUpdated: now.toISOString(),
      });
      return {valid: true};
    }

    const userData = userLimitsDoc.data();
    if (!userData) {
      await userLimitsRef.set({
        dailyUsage: amount,
        monthlyUsage: amount,
        lastUpdated: now.toISOString(),
      });
      return {valid: true};
    }
    const lastUpdated = new Date(userData.lastUpdated);
    let {dailyUsage, monthlyUsage} = userData;

    // Reset daily usage if it's a new day
    if (lastUpdated.getDate() !== now.getDate() ||
        lastUpdated.getMonth() !== now.getMonth() ||
        lastUpdated.getFullYear() !== now.getFullYear()) {
      dailyUsage = 0;
    }

    // Reset monthly usage if it's a new month
    if (lastUpdated.getMonth() !== now.getMonth() ||
        lastUpdated.getFullYear() !== now.getFullYear()) {
      monthlyUsage = 0;
    }

    // Check if transaction would exceed daily limit
    if (dailyUsage + amount > dailyLimit) {
      return {
        valid: false,
        reason: `Transaction would exceed daily limit of ${dailyLimit}`,
      };
    }

    // Check if transaction would exceed monthly limit
    if (monthlyUsage + amount > monthlyLimit) {
      return {
        valid: false,
        reason: `Transaction would exceed monthly limit of ${monthlyLimit}`,
      };
    }

    // Update usage values
    await userLimitsRef.update({
      dailyUsage: dailyUsage + amount,
      monthlyUsage: monthlyUsage + amount,
      lastUpdated: now.toISOString(),
    });

    return {valid: true};
  } catch (error) {
    functions.logger.error("Error validating caps and limits", error);
    // In case of error, default to rejecting the transaction for safety
    return {
      valid: false,
      reason: "Error validating transaction limits",
    };
  }
}

// Get daily earned amount for a user
export async function getDailyEarned(userId: string): Promise<number> {
  const db = admin.firestore();
  const userLimitsRef = db.collection("userLimits").doc(userId);

  try {
    const userLimitsDoc = await userLimitsRef.get();
    if (!userLimitsDoc.exists) {
      return 0;
    }

    const userData = userLimitsDoc.data();
    if (!userData) {
      return 0;
    }

    const now = new Date();
    const lastUpdated = new Date(userData.lastUpdated);

    // Reset daily usage if it's a new day
    if (lastUpdated.getDate() !== now.getDate() ||
        lastUpdated.getMonth() !== now.getMonth() ||
        lastUpdated.getFullYear() !== now.getFullYear()) {
      return 0;
    }

    return userData.dailyUsage || 0;
  } catch (error) {
    functions.logger.error("Error getting daily earned amount", error);
    return 0;
  }
}

// Get daily redeemed amount for a user
export async function getDailyRedeemed(userId: string): Promise<number> {
  const db = admin.firestore();
  const userLimitsRef = db.collection("userLimits").doc(userId);

  try {
    const userLimitsDoc = await userLimitsRef.get();
    if (!userLimitsDoc.exists) {
      return 0;
    }

    const userData = userLimitsDoc.data();
    if (!userData) {
      return 0;
    }

    const now = new Date();
    const lastUpdated = new Date(userData.lastUpdated);

    // Reset daily usage if it's a new day
    if (lastUpdated.getDate() !== now.getDate() ||
        lastUpdated.getMonth() !== now.getMonth() ||
        lastUpdated.getFullYear() !== now.getFullYear()) {
      return 0;
    }

    return userData.dailyRedeemed || 0;
  } catch (error) {
    functions.logger.error("Error getting daily redeemed amount", error);
    return 0;
  }
}

// Get monthly redeemed amount for a user
export async function getMonthlyRedeemed(userId: string): Promise<number> {
  const db = admin.firestore();
  const userLimitsRef = db.collection("userLimits").doc(userId);

  try {
    const userLimitsDoc = await userLimitsRef.get();
    if (!userLimitsDoc.exists) {
      return 0;
    }

    const userData = userLimitsDoc.data();
    if (!userData) {
      return 0;
    }

    const now = new Date();
    const lastUpdated = new Date(userData.lastUpdated);

    // Reset monthly usage if it's a new month
    if (lastUpdated.getMonth() !== now.getMonth() ||
        lastUpdated.getFullYear() !== now.getFullYear()) {
      return 0;
    }

    return userData.monthlyRedeemed || 0;
  } catch (error) {
    functions.logger.error("Error getting monthly redeemed amount", error);
    return 0;
  }
}

// Constants
export const DAILY_EARN_CAP = 1000;
export const MONTHLY_REDEEM_CAP = 10000;

// Export caps and limits utilities
export const capsAndLimits = {
  validateCapsAndLimits,
  getDailyEarned,
  getDailyRedeemed,
  getMonthlyRedeemed,
  DAILY_EARN_CAP,
  MONTHLY_REDEEM_CAP,
};
