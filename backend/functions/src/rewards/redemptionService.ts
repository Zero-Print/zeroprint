import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {SecurityHelpers} from "../lib/securityHelpers";
import {logAudit, logUserActivity} from "../lib/auditService";
import {Reward, Redemption, Voucher, FraudDetectionResult, UserRedemptionPattern} from "../types";
import {WalletService} from "../wallet/walletService";

const walletService = new WalletService();

// Fraud detection helpers
async function checkDuplicateRedemption(userId: string, rewardId: string): Promise<{ isDuplicate: boolean; message: string }> {
  try {
    // Check for recent redemptions of the same reward by the same user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const duplicateQuery = await db.collection("redemptions")
      .where("userId", "==", userId)
      .where("rewardId", "==", rewardId)
      .where("createdAt", ">=", oneHourAgo.toISOString())
      .limit(1)
      .get();

    const isDuplicate = !duplicateQuery.empty;
    return {
      isDuplicate,
      message: isDuplicate ? "Duplicate redemption detected" : "No duplicates found",
    };
  } catch (error) {
    console.error("Error checking for duplicate redemption:", error);
    // In case of error, we'll allow the redemption to proceed but log it
    return {isDuplicate: false, message: "Error checking duplicates, but proceeding"};
  }
}

async function checkFraudIndicators(userId: string, rewardId: string): Promise<FraudDetectionResult> {
  try {
    // Get user redemption pattern data
    // In a real implementation, this would come from a database
    // For now, we'll use mock data
    const mockUserPatterns: Record<string, UserRedemptionPattern> = {
      "user1": {
        userId: "user1",
        dailyRedemptions: 2,
        weeklyRedemptions: 10,
        monthlyRedemptions: 30,
        totalRedemptions: 100,
        lastRedemptionDate: new Date().toISOString(),
      },
      "user2": {
        userId: "user2",
        dailyRedemptions: 1,
        weeklyRedemptions: 5,
        monthlyRedemptions: 15,
        totalRedemptions: 50,
        lastRedemptionDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      },
    };

    const userPattern = mockUserPatterns[userId] || {
      userId,
      dailyRedemptions: 0,
      weeklyRedemptions: 0,
      monthlyRedemptions: 0,
      totalRedemptions: 0,
      lastRedemptionDate: new Date(0).toISOString(),
    };

    const riskFactors: string[] = [];
    let riskScore = 0;

    // Check daily redemption limit (example: 5 per day)
    if (userPattern.dailyRedemptions >= 5) {
      riskFactors.push("Exceeded daily redemption limit");
      riskScore += 30;
    }

    // Check weekly redemption limit (example: 20 per week)
    if (userPattern.weeklyRedemptions >= 20) {
      riskFactors.push("Exceeded weekly redemption limit");
      riskScore += 20;
    }

    // Check monthly redemption limit (example: 50 per month)
    if (userPattern.monthlyRedemptions >= 50) {
      riskFactors.push("Exceeded monthly redemption limit");
      riskScore += 15;
    }

    // Check for suspicious timing (multiple redemptions in short time)
    const timeSinceLastRedemption = Date.now() - new Date(userPattern.lastRedemptionDate).getTime();
    if (timeSinceLastRedemption < 5 * 60 * 1000) { // Less than 5 minutes
      riskFactors.push("Multiple redemptions in short time period");
      riskScore += 25;
    }

    // Determine recommended action based on risk score
    let recommendedAction: "allow" | "review" | "block" = "allow";
    if (riskScore >= 50) {
      recommendedAction = "block";
    } else if (riskScore >= 20) {
      recommendedAction = "review";
    }

    return {
      isFraudulent: riskScore >= 40,
      riskScore,
      reasons: riskFactors,
      recommendedAction,
    };
  } catch (error) {
    console.error("Error checking fraud indicators:", error);
    // In case of error, we'll allow the redemption to proceed but log it
    return {
      isFraudulent: false,
      riskScore: 0,
      reasons: ["Error in fraud detection system"],
      recommendedAction: "allow",
    };
  }
}

async function checkRedemptionCaps(userId: string, coinsToSpend: number): Promise<{ withinLimits: boolean; message: string }> {
  try {
    // Get user pattern data
    const mockUserPatterns: Record<string, UserRedemptionPattern> = {
      "user1": {
        userId: "user1",
        dailyRedemptions: 2,
        weeklyRedemptions: 10,
        monthlyRedemptions: 30,
        totalRedemptions: 100,
        lastRedemptionDate: new Date().toISOString(),
      },
      "user2": {
        userId: "user2",
        dailyRedemptions: 1,
        weeklyRedemptions: 5,
        monthlyRedemptions: 15,
        totalRedemptions: 50,
        lastRedemptionDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      },
    };

    const userPattern = mockUserPatterns[userId] || {
      userId,
      dailyRedemptions: 0,
      weeklyRedemptions: 0,
      monthlyRedemptions: 0,
      totalRedemptions: 0,
      lastRedemptionDate: new Date(0).toISOString(),
    };

    // Check daily cap (example: 5000 coins per day)
    const DAILY_CAP = 5000;
    if (userPattern.dailyRedemptions * 1000 + coinsToSpend > DAILY_CAP) { // Assuming avg 1000 coins per redemption
      return {
        withinLimits: false,
        message: `Would exceed daily coin cap. Current: ${userPattern.dailyRedemptions * 1000}, Attempting to spend: ${coinsToSpend}`,
      };
    }

    // Check monthly cap (example: 50000 coins per month)
    const MONTHLY_CAP = 50000;
    if (userPattern.monthlyRedemptions * 1000 + coinsToSpend > MONTHLY_CAP) { // Assuming avg 1000 coins per redemption
      return {
        withinLimits: false,
        message: `Would exceed monthly coin cap. Current: ${userPattern.monthlyRedemptions * 1000}, Attempting to spend: ${coinsToSpend}`,
      };
    }

    return {
      withinLimits: true,
      message: "Within redemption limits",
    };
  } catch (error) {
    console.error("Error checking redemption caps:", error);
    // In case of error, we'll allow the redemption to proceed but log it
    return {
      withinLimits: true,
      message: "Error checking caps, but proceeding",
    };
  }
}

async function assignVoucherToRedemption(rewardId: string, userId: string, redemptionId: string): Promise<{ success: boolean; voucherCode?: string; message: string }> {
  try {
    // Find an unused voucher for this reward
    const voucherQuery = await db.collection("vouchers")
      .where("rewardId", "==", rewardId)
      .where("isRedeemed", "==", false)
      .limit(1)
      .get();

    if (voucherQuery.empty) {
      return {
        success: false,
        message: "No available vouchers for this reward",
      };
    }

    const voucherDoc = voucherQuery.docs[0];
    const voucher = voucherDoc.data() as Voucher;

    // Update voucher as redeemed
    const updatedVoucher: Partial<Voucher> = {
      isRedeemed: true,
      redeemedBy: userId,
      redeemedAt: new Date().toISOString(),
    };

    await db.collection("vouchers").doc(voucher.voucherId).update(updatedVoucher);

    return {
      success: true,
      voucherCode: voucher.code,
      message: "Voucher assigned successfully",
    };
  } catch (error) {
    console.error("Error assigning voucher:", error);
    return {
      success: false,
      message: "Failed to assign voucher",
    };
  }
}

/**
 * Redeem coins for a reward
 */
export async function redeemCoins(
  request: CallableRequest<{
    rewardId: string;
  }>
) {
  try {
    // Validate authentication
    const authUserId = SecurityHelpers.validateAuth(request);

    // Validate required parameters
    SecurityHelpers.validateRequired(request.data, ["rewardId"]);

    const {rewardId} = request.data;

    // Security check: Check for duplicate redemptions
    const duplicateCheck = await checkDuplicateRedemption(authUserId, rewardId);
    if (duplicateCheck.isDuplicate) {
      throw new functions.https.HttpsError("failed-precondition", "Duplicate redemption detected. Please try again later.");
    }

    // Security check: Fraud detection
    const fraudCheck = await checkFraudIndicators(authUserId, rewardId);
    if (fraudCheck.isFraudulent) {
      // Log the fraudulent attempt
      await logAudit(
        "FRAUD_DETECTED",
        authUserId,
        rewardId,
        {},
        {
          rewardId,
          fraudReasons: fraudCheck.reasons,
          riskScore: fraudCheck.riskScore,
        },
        "RedemptionService"
      );

      throw new functions.https.HttpsError("permission-denied", "Redemption blocked due to security concerns.");
    }

    // Get reward details
    const rewardRef = db.collection("rewards").doc(rewardId);
    const rewardDoc = await rewardRef.get();

    if (!rewardDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Reward not found");
    }

    const reward = rewardDoc.data() as Reward;

    // Check if reward is active
    if (!reward.isActive) {
      throw new functions.https.HttpsError("failed-precondition", "Reward is not active");
    }

    // Check if reward is in stock
    if (reward.stock <= 0) {
      throw new functions.https.HttpsError("failed-precondition", "Reward is out of stock");
    }

    // Security check: Redemption caps
    const capCheck = await checkRedemptionCaps(authUserId, reward.coinCost);
    if (!capCheck.withinLimits) {
      throw new functions.https.HttpsError("resource-exhausted", capCheck.message);
    }

    // Check wallet balance
    const wallet = await walletService.getWallet(authUserId);
    if (!wallet) {
      throw new functions.https.HttpsError("not-found", "Wallet not found");
    }

    if (wallet.healCoins < reward.coinCost) {
      throw new functions.https.HttpsError("failed-precondition", `Insufficient balance. You need ${reward.coinCost - wallet.healCoins} more HealCoins.`);
    }

    // Execute transaction
    const result = await db.runTransaction(async (transaction) => {
      // Deduct coins from wallet
      const walletRef = db.collection("wallets").doc(authUserId);
      const updatedWallet = {
        ...wallet,
        healCoins: wallet.healCoins - reward.coinCost,
        lastUpdated: new Date().toISOString(),
      };
      transaction.update(walletRef, updatedWallet);

      // Create redemption document
      const redemptionId = `red_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const redemption: Redemption = {
        redemptionId,
        userId: authUserId,
        rewardId,
        rewardName: reward.title,
        cost: reward.coinCost,
        quantity: 1,
        coinsSpent: reward.coinCost,
        status: "success",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        processedBy: "system",
        processedAt: new Date().toISOString(),
      };

      // For voucher rewards, assign a voucher code
      let voucherCode: string | undefined;
      if (reward.type === "voucher") {
        const voucherResult = await assignVoucherToRedemption(rewardId, authUserId, redemptionId);
        if (voucherResult.success) {
          voucherCode = voucherResult.voucherCode;
          redemption.voucherCode = voucherCode;
        } else {
          // If we can't assign a voucher, mark redemption as failed
          redemption.status = "failed";
          redemption.metadata = {
            failureReason: "No available vouchers",
          };
        }
      }

      transaction.set(db.collection("redemptions").doc(redemptionId), redemption);

      // Update reward stock
      const updatedReward = {
        ...reward,
        stock: reward.stock - 1,
      };
      transaction.update(rewardRef, updatedReward);

      return {
        redemption,
        updatedWallet,
        updatedReward,
      };
    });

    // Add audit log entry
    await logAudit(
      "REWARD_REDEEMED",
      authUserId,
      result.redemption.redemptionId,
      {},
      {
        rewardId,
        rewardTitle: reward.title,
        coinsSpent: reward.coinCost,
        redemptionId: result.redemption.redemptionId,
        voucherCode: result.redemption.voucherCode,
        fraudCheck: {
          isFraudulent: fraudCheck.isFraudulent,
          riskScore: fraudCheck.riskScore,
          reasons: fraudCheck.reasons,
        },
      },
      "RedemptionService"
    );

    // Add activity log entry
    await logUserActivity(
      authUserId,
      "REWARD_REDEEMED",
      {
        rewardId,
        rewardTitle: reward.title,
        coinsSpent: reward.coinCost,
        voucherCode: result.redemption.voucherCode,
      },
      "rewards"
    );

    // TODO: Send notification to user

    return SecurityHelpers.createResponse("success", "Reward redeemed successfully", {
      redemptionId: result.redemption.redemptionId,
      voucherCode: result.redemption.voucherCode,
      rewardTitle: reward.title,
    });
  } catch (error) {
    console.error("Error in redeemCoins:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to redeem reward");
  }
}

/**
 * Get user redemptions
 */
export async function getUserRedemptions(
  request: CallableRequest<undefined>
) {
  try {
    // Validate authentication
    const authUserId = SecurityHelpers.validateAuth(request);

    // Get user redemptions
    const snapshot = await db
      .collection("redemptions")
      .where("userId", "==", authUserId)
      .orderBy("createdAt", "desc")
      .get();

    const redemptions = snapshot.docs.map((doc: any) => {
      const data = doc.data() as Redemption;
      // Add reward title for display purposes
      return {
        ...data,
        rewardTitle: `Reward ${data.rewardId}`, // In a real implementation, you would join with rewards collection
      };
    });

    // Log user activity
    await logUserActivity(
      authUserId,
      "REDEMPTIONS_VIEWED",
      {},
      "rewards"
    );

    return SecurityHelpers.createResponse("success", "Redemptions retrieved successfully", {
      redemptions,
    });
  } catch (error) {
    console.error("Error in getUserRedemptions:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to retrieve redemptions");
  }
}

/**
 * Get all redemptions (admin only)
 */
export async function getAllRedemptions(
  request: CallableRequest<{
    filters?: {
      userId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    };
    limit?: number;
    offset?: number;
  }>
) {
  try {
    // Validate authentication
    const authUserId = SecurityHelpers.validateAuth(request);

    // Validate admin role - in a real implementation, you would check for admin role
    await SecurityHelpers.validateUser(authUserId);

    const {filters = {}, limit = 100, offset = 0} = request.data || {};

    // Build query
    let query: any = db.collection("redemptions").orderBy("createdAt", "desc");

    // Apply filters
    if (filters.userId) {
      query = query.where("userId", "==", filters.userId);
    }

    if (filters.status) {
      query = query.where("status", "==", filters.status);
    }

    if (filters.startDate) {
      query = query.where("createdAt", ">=", filters.startDate);
    }

    if (filters.endDate) {
      query = query.where("createdAt", "<=", filters.endDate);
    }

    // Apply pagination
    const snapshot = await query.limit(limit).offset(offset).get();

    const redemptions = snapshot.docs.map((doc: any) => {
      const data = doc.data() as Redemption;
      // Add user name and reward title for display purposes
      return {
        ...data,
        userName: `User ${data.userId.slice(-4)}`,
        rewardTitle: `Reward ${data.rewardId}`,
      };
    });

    // Log user activity
    await logUserActivity(
      authUserId,
      "ALL_REDEMPTIONS_VIEWED",
      {
        filters,
      },
      "rewards"
    );

    return SecurityHelpers.createResponse("success", "Redemptions retrieved successfully", {
      redemptions,
    });
  } catch (error) {
    console.error("Error in getAllRedemptions:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to retrieve redemptions");
  }
}
