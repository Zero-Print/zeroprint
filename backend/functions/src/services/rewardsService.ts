/**
 * Rewards Service
 * Handles rewards marketplace, redemption, and stock management
 */

import {BaseService} from "./baseService";
import {Reward, Redemption} from "../types/shared";
import {validateRequiredFields} from "../lib/validators";
import {capsAndLimits} from "../lib/capsAndLimits";
import {fraudDetection} from "../lib/fraudDetection";
import {walletService} from "./walletService";
import {FieldValue, Timestamp} from "firebase-admin/firestore";

const DAILY_REDEEM_CAP = 10000; // 10000 coins per day
const MONTHLY_REDEEM_CAP = 100000; // 100000 coins per month

export class RewardsService extends BaseService {
  /**
   * Get available rewards
   */
  async getRewards(): Promise<Reward[]> {
    return this.executeWithMetrics(
      async () => {
        const snapshot = await this.db
          .collection("rewards")
          .where("isActive", "==", true)
          .orderBy("name")
          .get();

        return snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as Reward
        );
      },
      "rewards_get_all",
      {},
      "rewards"
    );
  }

  /**
   * Get reward by ID
   */
  async getReward(rewardId: string): Promise<Reward> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({rewardId}, ["rewardId"]);

        const rewardDoc = await this.db.collection("rewards").doc(rewardId).get();

        if (!rewardDoc.exists) {
          throw new Error("Reward not found");
        }

        const reward = this.convertFromFirestore(rewardDoc.data()) as Reward;

        if (!reward.isActive) {
          throw new Error("Reward is not active");
        }

        return reward;
      },
      "rewards_get_by_id",
      {rewardId},
      "rewards"
    );
  }

  /**
   * Redeem reward
   */
  async redeemReward(
    userId: string,
    rewardId: string,
    quantity: number = 1
  ): Promise<Redemption> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, rewardId, quantity}, ["userId", "rewardId", "quantity"]);

        if (quantity <= 0) {
          throw new Error("Quantity must be positive");
        }

        // Get reward details
        const reward = await this.getReward(rewardId);
        const totalCost = reward.cost * quantity;

        // Check stock availability
        if (reward.stock !== null && reward.stock < quantity) {
          throw new Error("Insufficient stock");
        }

        // Check monthly redemption cap
        const monthlyCap = await capsAndLimits.getMonthlyRedeemed(userId);
        if (monthlyCap + totalCost > MONTHLY_REDEEM_CAP) {
          throw new Error(`Monthly redemption cap exceeded. Max: ${MONTHLY_REDEEM_CAP} coins per month`);
        }

        // Check daily redemption cap
        const dailyCap = await capsAndLimits.getDailyRedeemed(userId);
        if (dailyCap + totalCost > DAILY_REDEEM_CAP) {
          throw new Error(`Daily redemption cap exceeded. Max: ${DAILY_REDEEM_CAP} coins per day`);
        }

        // Check for duplicate redemption (fraud prevention)
        const isDuplicate = await fraudDetection.checkDuplicateRedemption(userId, rewardId, quantity);
        if (isDuplicate) {
          throw new Error("Duplicate redemption detected");
        }

        // Redeem coins from wallet
        await walletService.redeemCoins(userId, totalCost, rewardId, {quantity});

        // Create redemption record
        const redemption: Redemption = {
          id: this.db.collection("redemptions").doc().id,
          userId,
          rewardId,
          rewardName: reward.name,
          cost: totalCost,
          quantity,
          status: "success",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: `Redeemed ${quantity} x ${reward.name}`,
        };

        // Save redemption
        await this.db.collection("redemptions").doc(redemption.id).set(
          this.sanitizeForFirestore(redemption)
        );

        // Update reward stock
        if (reward.stock !== null) {
          await this.db.collection("rewards").doc(rewardId).update({
            stock: FieldValue.increment(-quantity),
            updatedAt: Timestamp.fromDate(new Date()),
          });
        }

        // Log audit trail
        await this.logAudit(
          "rewardRedeemed",
          userId,
          userId,
          {rewardId, quantity, cost: totalCost},
          redemption,
          "RewardsService:redeemReward"
        );

        // Log activity
        await this.logActivity(
          userId,
          "rewardRedeemed",
          {rewardName: reward.name, quantity, cost: totalCost},
          "rewards"
        );

        return redemption;
      },
      "rewards_redeem",
      {userId, rewardId, quantity},
      "rewards"
    );
  }

  /**
   * Get user's redemption history
   */
  async getRedemptions(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Redemption[]; pagination: any }> {
    return this.executeWithMetrics(
      async () => {
        const offset = (page - 1) * limit;

        const query = this.db
          .collection("redemptions")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .limit(limit)
          .offset(offset);

        const snapshot = await query.get();
        const redemptions = snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as Redemption
        );

        // Get total count for pagination
        const totalSnapshot = await this.db
          .collection("redemptions")
          .where("userId", "==", userId)
          .get();

        const total = totalSnapshot.size;

        return {
          data: redemptions,
          pagination: {
            page,
            limit,
            total,
            hasNext: offset + limit < total,
            hasPrev: page > 1,
          },
        };
      },
      "rewards_get_redemptions",
      {userId, page, limit},
      "rewards"
    );
  }

  /**
   * Get all redemptions (admin only)
   */
  async getAllRedemptions(
    page: number = 1,
    limit: number = 50,
    filters?: any
  ): Promise<{ data: Redemption[]; pagination: any }> {
    return this.executeWithMetrics(
      async () => {
        const offset = (page - 1) * limit;

        let query = this.db.collection("redemptions").orderBy("createdAt", "desc");

        // Apply filters
        if (filters?.userId) {
          query = query.where("userId", "==", filters.userId);
        }

        if (filters?.status) {
          query = query.where("status", "==", filters.status);
        }

        if (filters?.rewardId) {
          query = query.where("rewardId", "==", filters.rewardId);
        }

        if (filters?.startDate) {
          query = query.where("createdAt", ">=", new Date(filters.startDate));
        }

        if (filters?.endDate) {
          query = query.where("createdAt", "<=", new Date(filters.endDate));
        }

        const snapshot = await query.limit(limit).offset(offset).get();
        const redemptions = snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as Redemption
        );

        // Get total count for pagination
        const totalSnapshot = await query.get();
        const total = totalSnapshot.size;

        return {
          data: redemptions,
          pagination: {
            page,
            limit,
            total,
            hasNext: offset + limit < total,
            hasPrev: page > 1,
          },
        };
      },
      "rewards_get_all_redemptions",
      {page, limit, filters},
      "rewards"
    );
  }

  /**
   * Update redemption status (admin only)
   */
  async updateRedemptionStatus(
    redemptionId: string,
    status: string,
    notes?: string
  ): Promise<Redemption> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({redemptionId, status}, ["redemptionId", "status"]);

        const redemptionDoc = await this.db.collection("redemptions").doc(redemptionId).get();

        if (!redemptionDoc.exists) {
          throw new Error("Redemption not found");
        }

        const existingRedemption = this.convertFromFirestore(redemptionDoc.data()) as Redemption;

        const updatedRedemption: Redemption = {
          ...existingRedemption,
          status: status as "pending" | "success" | "failed",
          notes: notes ? `${existingRedemption.notes}\n${notes}` : existingRedemption.notes,
          updatedAt: new Date().toISOString(),
        };

        await redemptionDoc.ref.update(this.sanitizeForFirestore(updatedRedemption));

        // If status changes to failed or cancelled, consider refunding coins
        if (status === "failed" || status === "cancelled") {
          await walletService.creditCoins(
            existingRedemption.userId,
            existingRedemption.cost,
            "Redemption Refund",
            redemptionId
          );
        }

        // Log audit trail
        await this.logAudit(
          "redemptionStatusUpdated",
          "admin",
          existingRedemption.userId,
          existingRedemption,
          updatedRedemption,
          "RewardsService:updateRedemptionStatus"
        );

        return updatedRedemption;
      },
      "rewards_update_redemption_status",
      {redemptionId, status, notes},
      "rewards"
    );
  }

  /**
   * Get rewards analytics (admin only)
   */
  async getRewardsAnalytics(): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        const [rewardsSnapshot, redemptionsSnapshot] = await Promise.all([
          this.db.collection("rewards").get(),
          this.db.collection("redemptions").get(),
        ]);

        const totalRewards = rewardsSnapshot.size;
        const totalRedemptions = redemptionsSnapshot.size;

        // Calculate total redeemed value
        const totalRedeemedValue = redemptionsSnapshot.docs.reduce((sum, doc) => {
          const redemption = doc.data() as Redemption;
          return sum + redemption.cost;
        }, 0);

        // Get top redeemed rewards
        const topRewardsMap = new Map<string, { count: number; value: number }>();
        redemptionsSnapshot.docs.forEach((doc) => {
          const redemption = doc.data() as Redemption;
          const current = topRewardsMap.get(redemption.rewardName) || {count: 0, value: 0};
          topRewardsMap.set(redemption.rewardName, {
            count: current.count + redemption.quantity,
            value: current.value + redemption.cost,
          });
        });

        const topRewards = Array.from(topRewardsMap.entries())
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 5)
          .map(([name, data]) => ({name, count: data.count, value: data.value}));

        // Get redemption trends (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentRedemptions = redemptionsSnapshot.docs.filter((doc) => {
          const redemption = doc.data() as Redemption;
          return new Date(redemption.createdAt) >= thirtyDaysAgo;
        });

        const dailyRedemptions = new Map<string, number>();
        recentRedemptions.forEach((doc) => {
          const redemption = doc.data() as Redemption;
          const date = new Date(redemption.createdAt).toISOString().split("T")[0];
          dailyRedemptions.set(date, (dailyRedemptions.get(date) || 0) + 1);
        });

        const redemptionTrends = Array.from(dailyRedemptions.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, count]) => ({date, count}));

        return {
          totalRewards,
          totalRedemptions,
          totalRedeemedValue,
          topRewards,
          redemptionTrends,
        };
      },
      "rewards_get_analytics",
      {},
      "rewards"
    );
  }

  /**
   * Export redemptions (admin only)
   */
  async exportRedemptions(format: string, filters?: any): Promise<string> {
    return this.executeWithMetrics(
      async () => {
        const {data: redemptions} = await this.getAllRedemptions(1, 1000, filters);

        if (format === "csv") {
          return this.convertToCSV(redemptions);
        } else if (format === "json") {
          return JSON.stringify(redemptions, null, 2);
        } else {
          throw new Error("Unsupported export format");
        }
      },
      "rewards_export_redemptions",
      {format, filters},
      "rewards"
    );
  }

  /**
   * Convert redemptions to CSV
   */
  private convertToCSV(redemptions: Redemption[]): string {
    if (redemptions.length === 0) return "";

    const headers = [
      "ID",
      "User ID",
      "Reward ID",
      "Reward Name",
      "Cost",
      "Quantity",
      "Status",
      "Created At",
      "Updated At",
      "Notes",
    ];

    const rows = redemptions.map((redemption) => [
      redemption.id,
      redemption.userId,
      redemption.rewardId,
      redemption.rewardName,
      redemption.cost,
      redemption.quantity,
      redemption.status,
      new Date(redemption.createdAt).toISOString(),
      new Date(redemption.updatedAt).toISOString(),
      redemption.notes || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    return csvContent;
  }
}

export const rewardsService = new RewardsService();
