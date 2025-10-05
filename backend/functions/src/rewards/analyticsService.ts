import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {SecurityHelpers} from "../lib/securityHelpers";
import {logUserActivity} from "../lib/auditService";
import {Reward, Redemption} from "../types";

// Analytics data interfaces
interface RedemptionStats {
  totalRedemptions: number;
  successfulRedemptions: number;
  failedRedemptions: number;
  pendingRedemptions: number;
  successRate: number;
  failureRate: number;
}

interface RewardPerformance {
  rewardId: string;
  rewardTitle: string;
  totalRedemptions: number;
  totalCoinsSpent: number;
  avgCoinsPerRedemption: number;
  stockOutCount: number;
}

interface DailyRedemptionTrend {
  date: string;
  redemptions: number;
  coinsSpent: number;
}

interface AnalyticsData {
  redemptionStats: RedemptionStats;
  topRewards: RewardPerformance[];
  dailyTrends: DailyRedemptionTrend[];
  stockOutAlerts: { rewardId: string; rewardTitle: string; stock: number }[];
  failureAlerts: { hour: string; failureRate: number }[];
}

/**
 * Get analytics data (admin only)
 */
export async function getAnalyticsData(
  request: CallableRequest<{
    startDate?: string;
    endDate?: string;
  }>
) {
  try {
    // Validate authentication
    const authUserId = SecurityHelpers.validateAuth(request);

    // Validate admin role
    await SecurityHelpers.validateUser(authUserId);

    const {startDate, endDate} = request.data || {};

    // Build query for redemptions
    let redemptionQuery: any = db.collection("redemptions");

    if (startDate) {
      redemptionQuery = redemptionQuery.where("createdAt", ">=", startDate);
    }

    if (endDate) {
      redemptionQuery = redemptionQuery.where("createdAt", "<=", endDate);
    }

    // Get all redemptions
    const redemptionSnapshot = await redemptionQuery.get();
    const redemptions = redemptionSnapshot.docs.map((doc: any) => doc.data() as Redemption);

    // Get all rewards
    const rewardSnapshot = await db.collection("rewards").get();
    const rewards = rewardSnapshot.docs.map((doc: any) => doc.data() as Reward);

    // Calculate redemption statistics
    const totalRedemptions = redemptions.length;
    const successfulRedemptions = redemptions.filter((r: Redemption) => r.status === "success").length;
    const failedRedemptions = redemptions.filter((r: Redemption) => r.status === "failed").length;
    const pendingRedemptions = redemptions.filter((r: Redemption) => r.status === "pending").length;

    const successRate = totalRedemptions > 0 ? (successfulRedemptions / totalRedemptions) * 100 : 0;
    const failureRate = totalRedemptions > 0 ? (failedRedemptions / totalRedemptions) * 100 : 0;

    const redemptionStats: RedemptionStats = {
      totalRedemptions,
      successfulRedemptions,
      failedRedemptions,
      pendingRedemptions,
      successRate,
      failureRate,
    };

    // Calculate reward performance
    const rewardMap = new Map<string, RewardPerformance>();

    // Initialize with all rewards
    rewards.forEach((reward) => {
      rewardMap.set(reward.rewardId, {
        rewardId: reward.rewardId,
        rewardTitle: reward.title,
        totalRedemptions: 0,
        totalCoinsSpent: 0,
        avgCoinsPerRedemption: 0,
        stockOutCount: reward.stock <= 0 ? 1 : 0,
      });
    });

    // Process redemptions
    redemptions.forEach((redemption: Redemption) => {
      const rewardPerf = rewardMap.get(redemption.rewardId);
      if (rewardPerf) {
        rewardPerf.totalRedemptions += 1;
        rewardPerf.totalCoinsSpent += redemption.coinsSpent;
        rewardPerf.avgCoinsPerRedemption = rewardPerf.totalRedemptions > 0 ?
          rewardPerf.totalCoinsSpent / rewardPerf.totalRedemptions :
          0;
      }
    });

    const topRewards = Array.from(rewardMap.values());

    // Calculate daily trends
    const trendMap = new Map<string, { redemptions: number; coinsSpent: number }>();

    redemptions.forEach((redemption: Redemption) => {
      const date = redemption.createdAt.split("T")[0]; // YYYY-MM-DD
      const trend = trendMap.get(date) || {redemptions: 0, coinsSpent: 0};
      trend.redemptions += 1;
      trend.coinsSpent += redemption.coinsSpent;
      trendMap.set(date, trend);
    });

    const dailyTrends = Array.from(trendMap.entries())
      .map(([date, data]) => ({
        date,
        redemptions: data.redemptions,
        coinsSpent: data.coinsSpent,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get stock out alerts
    const stockOutAlerts = rewards
      .filter((reward) => reward.stock <= 5) // Alert if stock is 5 or less
      .map((reward) => ({
        rewardId: reward.rewardId,
        rewardTitle: reward.title,
        stock: reward.stock,
      }));

    // Get failure alerts (10%+ failure rate in last hour)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Filter redemptions from last hour
    const recentRedemptions = redemptions.filter((r: Redemption) =>
      new Date(r.createdAt) >= oneHourAgo && new Date(r.createdAt) <= now
    );

    let failureAlerts: { hour: string; failureRate: number }[] = [];

    if (recentRedemptions.length > 0) {
      const failedCount = recentRedemptions.filter((r: Redemption) => r.status === "failed").length;
      const failureRate = (failedCount / recentRedemptions.length) * 100;

      // Alert if failure rate is 10% or higher
      if (failureRate >= 10) {
        const hour = now.getHours().toString().padStart(2, "0") + ":00";
        failureAlerts = [{hour, failureRate}];
      }
    }

    const analyticsData: AnalyticsData = {
      redemptionStats,
      topRewards,
      dailyTrends,
      stockOutAlerts,
      failureAlerts,
    };

    // Log user activity
    await logUserActivity(
      authUserId,
      "ANALYTICS_VIEWED",
      {},
      "rewards"
    );

    return SecurityHelpers.createResponse("success", "Analytics data retrieved successfully", {
      analyticsData,
    });
  } catch (error) {
    console.error("Error in getAnalyticsData:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to retrieve analytics data");
  }
}

/**
 * Get total coins redeemed
 */
export async function getTotalCoinsRedeemed(
  request: CallableRequest<{
    startDate?: string;
    endDate?: string;
  }>
) {
  try {
    // Validate authentication
    const authUserId = SecurityHelpers.validateAuth(request);

    // Validate admin role
    await SecurityHelpers.validateUser(authUserId);

    const {startDate, endDate} = request.data || {};

    // Build query
    let query: any = db.collection("redemptions").where("status", "==", "success");

    if (startDate) {
      query = query.where("createdAt", ">=", startDate);
    }

    if (endDate) {
      query = query.where("createdAt", "<=", endDate);
    }

    // Get redemptions
    const snapshot = await query.get();
    const redemptions = snapshot.docs.map((doc: any) => doc.data() as Redemption);

    // Calculate total coins
    const totalCoins = redemptions
      .filter((r: Redemption) => r.status === "success")
      .reduce((total: number, redemption: Redemption) => total + redemption.coinsSpent, 0);

    // Log user activity
    await logUserActivity(
      authUserId,
      "TOTAL_COINS_REDEEMED_VIEWED",
      {},
      "rewards"
    );

    return SecurityHelpers.createResponse("success", "Total coins redeemed calculated successfully", {
      totalCoins,
    });
  } catch (error) {
    console.error("Error in getTotalCoinsRedeemed:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to calculate total coins redeemed");
  }
}

/**
 * Get redemption trends for a specific period
 */
export async function getRedemptionTrends(
  request: CallableRequest<{
    startDate: string;
    endDate: string;
  }>
) {
  try {
    // Validate authentication
    const authUserId = SecurityHelpers.validateAuth(request);

    // Validate admin role
    await SecurityHelpers.validateUser(authUserId);

    // Validate required parameters
    SecurityHelpers.validateRequired(request.data, ["startDate", "endDate"]);

    const {startDate, endDate} = request.data;

    // Get redemptions for the period
    const snapshot = await db
      .collection("redemptions")
      .where("createdAt", ">=", startDate)
      .where("createdAt", "<=", endDate)
      .get();

    const redemptions = snapshot.docs.map((doc: any) => doc.data() as Redemption);

    // Calculate trends
    const trendMap = new Map<string, { redemptions: number; coins: number }>();

    redemptions.forEach((redemption: Redemption) => {
      const date = redemption.createdAt.split("T")[0]; // YYYY-MM-DD
      const trend = trendMap.get(date) || {redemptions: 0, coins: 0};
      trend.redemptions += 1;
      trend.coins += redemption.coinsSpent;
      trendMap.set(date, trend);
    });

    const trends = Array.from(trendMap.entries())
      .map(([date, data]) => ({
        date,
        redemptions: data.redemptions,
        coins: data.coins,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Log user activity
    await logUserActivity(
      authUserId,
      "REDEMPTION_TRENDS_VIEWED",
      {
        startDate,
        endDate,
      },
      "rewards"
    );

    return SecurityHelpers.createResponse("success", "Redemption trends retrieved successfully", {
      trends,
    });
  } catch (error) {
    console.error("Error in getRedemptionTrends:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to retrieve redemption trends");
  }
}
