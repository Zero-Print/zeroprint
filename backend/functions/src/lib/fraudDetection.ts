import * as admin from "firebase-admin";

/**
 * Detects suspicious activity based on user actions and transaction data
 *
 * @param userId The user ID
 * @param action The action being performed (e.g., 'earn_coins', 'redeem_coins', 'user_login')
 * @param data Additional data about the action
 * @returns Object indicating if activity is suspicious and reason if applicable
 */
export async function detectSuspiciousActivity(
  userId: string,
  action: string,
  data: Record<string, any>
): Promise<{ isSuspicious: boolean; reason?: string }> {
  const db = admin.firestore();

  // Check for rapid successive transactions
  if (action === "earn_coins" || action === "redeem_coins") {
    const recentTransactions = await db.collection("transactions")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    // If more than 5 transactions in the last minute, flag as suspicious
    const oneMinuteAgo = Date.now() - 60 * 1000;
    const recentCount = recentTransactions.docs.filter((doc) => {
      const timestamp = doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp);
      return timestamp.getTime() > oneMinuteAgo;
    }).length;

    if (recentCount >= 5) {
      return {
        isSuspicious: true,
        reason: "Rapid successive transactions detected",
      };
    }
  }

  // Check for unusual transaction amounts
  if (action === "earn_coins") {
    // Get user's average transaction amount
    const userTransactions = await db.collection("transactions")
      .where("userId", "==", userId)
      .where("type", "==", "credit")
      .limit(20)
      .get();

    if (userTransactions.size > 0) {
      const amounts = userTransactions.docs.map((doc) => doc.data().amount || 0);
      const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      const stdDev = Math.sqrt(
        amounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / amounts.length
      );

      // If current transaction is more than 3 standard deviations from average, flag as suspicious
      if (data.coins > average + 3 * stdDev && data.coins > 50) {
        return {
          isSuspicious: true,
          reason: "Unusual transaction amount detected",
        };
      }
    }
  }

  // Check for multiple device logins
  if (action === "user_login") {
    const recentLogins = await db.collection("userLogins")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(5)
      .get();

    // If login from a new device and user has recent logins from different devices
    if (recentLogins.size > 0) {
      const devices = new Set(recentLogins.docs.map((doc) => doc.data().deviceId));
      if (devices.size >= 3 && !devices.has(data.deviceId)) {
        return {
          isSuspicious: true,
          reason: "Multiple device logins detected",
        };
      }
    }
  }

  // Check for geographic anomalies
  if (action === "user_login" && data.ipAddress) {
    const recentLogins = await db.collection("userLogins")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (recentLogins.size > 0) {
      const lastLogin = recentLogins.docs[0].data();

      // In a real implementation, we would use IP geolocation to check distance
      // For this example, we'll just check if the IP is different
      if (lastLogin.ipAddress && lastLogin.ipAddress !== data.ipAddress) {
        // Check time between logins
        const lastLoginTime = lastLogin.timestamp?.toDate?.() || new Date(lastLogin.timestamp);
        const currentTime = new Date();
        const hoursBetween = (currentTime.getTime() - lastLoginTime.getTime()) / (1000 * 60 * 60);

        // If less than 1 hour between logins from different IPs, flag as suspicious
        if (hoursBetween < 1) {
          return {
            isSuspicious: true,
            reason: "Geographic anomaly detected",
          };
        }
      }
    }
  }

  // No suspicious activity detected
  return {isSuspicious: false};
}

// Check for duplicate redemption
export async function checkDuplicateRedemption(
  userId: string,
  rewardId: string,
  quantity: number
): Promise<boolean> {
  const db = admin.firestore();

  try {
    const recentRedemptions = await db.collection("redemptions")
      .where("userId", "==", userId)
      .where("rewardId", "==", rewardId)
      .where("status", "==", "success")
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    // Check if user has redeemed the same reward recently
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentCount = recentRedemptions.docs.filter((doc) => {
      const createdAt = new Date(doc.data().createdAt).getTime();
      return createdAt > oneHourAgo;
    }).length;

    return recentCount > 0;
  } catch (error) {
    console.error("Error checking duplicate redemption:", error);
    return false;
  }
}

// Check for duplicate carbon action
export async function checkDuplicateCarbonAction(
  userId: string,
  action: string,
  co2Saved: number
): Promise<boolean> {
  const db = admin.firestore();

  try {
    const recentActions = await db.collection("carbonLogs")
      .where("userId", "==", userId)
      .where("action", "==", action)
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    // Check if user has logged the same action recently
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentCount = recentActions.docs.filter((doc) => {
      const createdAt = new Date(doc.data().createdAt).getTime();
      return createdAt > oneHourAgo;
    }).length;

    return recentCount > 0;
  } catch (error) {
    console.error("Error checking duplicate carbon action:", error);
    return false;
  }
}

// Check for duplicate earning
export async function checkDuplicateEarning(
  userId: string,
  gameId: string,
  coins: number
): Promise<boolean> {
  const db = admin.firestore();

  try {
    const recentEarnings = await db.collection("walletTransactions")
      .where("walletId", "==", userId)
      .where("type", "==", "earn")
      .where("source", "==", gameId)
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    // Check if user has earned from the same game recently
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentCount = recentEarnings.docs.filter((doc) => {
      const createdAt = new Date(doc.data().createdAt).getTime();
      return createdAt > oneHourAgo;
    }).length;

    return recentCount > 0;
  } catch (error) {
    console.error("Error checking duplicate earning:", error);
    return false;
  }
}

// Check for duplicate game submission
export async function checkDuplicateGameSubmission(
  userId: string,
  gameId: string,
  score: number,
  playTime: number
): Promise<boolean> {
  const db = admin.firestore();

  try {
    const recentSubmissions = await db.collection("gameScores")
      .where("userId", "==", userId)
      .where("gameId", "==", gameId)
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    // Check if user has submitted the same game recently
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentCount = recentSubmissions.docs.filter((doc) => {
      const createdAt = new Date(doc.data().createdAt).getTime();
      return createdAt > oneHourAgo;
    }).length;

    return recentCount > 0;
  } catch (error) {
    console.error("Error checking duplicate game submission:", error);
    return false;
  }
}

// Export fraud detection utilities
export const fraudDetection = {
  detectSuspiciousActivity,
  checkDuplicateRedemption,
  checkDuplicateCarbonAction,
  checkDuplicateEarning,
  checkDuplicateGameSubmission,
};
