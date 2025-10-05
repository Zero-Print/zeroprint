/**
 * Wallet Service - isolates Firestore operations for wallet management
 */

import {BaseService} from "./baseService";
import {Wallet, WalletTransaction} from "../types";
import {validateRequiredFields} from "../lib/validators";
import {capsAndLimits} from "../lib/capsAndLimits";
import {fraudDetection} from "../lib/fraudDetection";
import {FieldValue, Timestamp} from "firebase-admin/firestore";

export class WalletService extends BaseService {
  /**
   * Get user's wallet balance
   */
  async getBalance(userId: string): Promise<Wallet> {
    return this.executeWithMetrics(
      async () => {
        const walletDoc = await this.db.collection("wallets").doc(userId).get();

        if (!walletDoc.exists) {
          // Create wallet if it doesn't exist
          const newWallet: Wallet = {
            walletId: userId,
            id: userId,
            entityId: userId,
            userId: userId,
            inrBalance: 0,
            healCoins: 0,
            totalEarned: 0,
            totalRedeemed: 0,
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
          };

          await this.db.collection("wallets").doc(userId).set(
            this.sanitizeForFirestore(newWallet)
          );

          return newWallet;
        }

        return this.convertFromFirestore(walletDoc.data()) as Wallet;
      },
      "wallet_get_balance",
      {userId},
      "wallet"
    );
  }

  /**
   * Credit coins to user's wallet
   */
  async creditCoins(userId: string, amount: number, source: string, description: string): Promise<Wallet> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, amount, source, description}, ["userId", "amount", "source", "description"]);

        if (amount <= 0) {
          throw new Error("Amount must be positive");
        }

        const walletRef = this.db.collection("wallets").doc(userId);
        const walletDoc = await walletRef.get();

        if (!walletDoc.exists) {
          throw new Error("Wallet not found");
        }

        const wallet = this.convertFromFirestore(walletDoc.data()) as Wallet;

        // Update wallet balance
        const updatedWallet: Wallet = {
          ...wallet,
          healCoins: wallet.healCoins + amount,
          totalEarned: wallet.totalEarned + amount,
          lastTransactionAt: new Date().toISOString(),
        };

        // Create transaction record
        const transaction: WalletTransaction = {
          id: this.db.collection("walletTransactions").doc().id,
          walletId: userId,
          type: "earn",
          amount,
          source,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          auditLogId: this.db.collection("auditLogs").doc().id,
        };

        // Save transaction
        await this.db.collection("walletTransactions").doc(transaction.id).set(transaction);

        // Update wallet
        await walletRef.update({
          healCoins: updatedWallet.healCoins,
          totalEarned: updatedWallet.totalEarned,
          lastTransactionAt: updatedWallet.lastTransactionAt,
          updatedAt: new Date().toISOString(),
        });

        return updatedWallet;
      },
      "creditCoins",
      {userId, amount, source, description},
      "wallet"
    );
  }

  /**
   * Get user's transaction history
   */
  async getTransactions(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: WalletTransaction[]; pagination: any }> {
    return this.executeWithMetrics(
      async () => {
        const offset = (page - 1) * limit;

        const query = this.db
          .collection("walletTransactions")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .limit(limit)
          .offset(offset);

        const snapshot = await query.get();
        const transactions = snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as WalletTransaction
        );

        // Get total count for pagination
        const totalSnapshot = await this.db
          .collection("walletTransactions")
          .where("userId", "==", userId)
          .get();

        const total = totalSnapshot.size;

        return {
          data: transactions,
          pagination: {
            page,
            limit,
            total,
            hasNext: offset + limit < total,
            hasPrev: page > 1,
          },
        };
      },
      "wallet_get_transactions",
      {userId, page, limit},
      "wallet"
    );
  }

  /**
   * Earn coins (from games, trackers, etc.)
   */
  async earnCoins(userId: string, gameId: string, coins: number): Promise<Wallet> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, gameId, coins}, ["userId", "gameId", "coins"]);

        // Check daily earning cap
        const dailyEarned = await capsAndLimits.getDailyEarned(userId);
        if (dailyEarned + coins > capsAndLimits.DAILY_EARN_CAP) {
          throw new Error(`Daily earning cap exceeded. Max: ${capsAndLimits.DAILY_EARN_CAP}`);
        }

        // Check for duplicate earning (fraud prevention)
        const isDuplicate = await fraudDetection.checkDuplicateEarning(userId, gameId, coins);
        if (isDuplicate) {
          throw new Error("Duplicate earning detected");
        }

        // Get current wallet
        const wallet = await this.getBalance(userId);
        const before = {...wallet};

        // Update wallet
        const updatedWallet: Wallet = {
          ...wallet,
          healCoins: wallet.healCoins + coins,
          totalEarned: wallet.totalEarned + coins,
          lastTransactionAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Create transaction record
        const transaction: WalletTransaction = {
          id: this.db.collection("walletTransactions").doc().id,
          walletId: userId,
          type: "earn",
          amount: coins,
          source: `game:${gameId}`,
          description: `Earned ${coins} HealCoins from game`,
          metadata: {gameId},
          auditLogId: "", // Will be set by audit log
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Batch update
        const batch = this.db.batch();
        batch.set(this.db.collection("wallets").doc(userId), this.sanitizeForFirestore(updatedWallet));
        batch.set(this.db.collection("walletTransactions").doc(transaction.id), this.sanitizeForFirestore(transaction));

        await batch.commit();

        // Log audit trail
        await this.logAudit(
          "walletUpdate",
          userId,
          userId,
          before,
          updatedWallet,
          "WalletService:earnCoins"
        );

        // Log activity
        await this.logActivity(
          userId,
          "coinsEarned",
          {gameId, coins, newBalance: updatedWallet.healCoins},
          "wallet"
        );

        return updatedWallet;
      },
      "wallet_earn_coins",
      {userId, gameId, coins},
      "wallet"
    );
  }

  /**
   * Redeem coins (for rewards or cash)
   */
  async redeemCoins(userId: string, redeemAmount: number, rewardId?: string, metadata?: any): Promise<Wallet> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId}, ["userId"]);

        if (!redeemAmount && !rewardId) {
          throw new Error("Either redeemAmount or rewardId must be provided");
        }

        // Get current wallet
        const wallet = await this.getBalance(userId);
        const before = {...wallet};

        // Determine redemption amount
        // let amount = redeemAmount; // This variable is not used
        if (rewardId) {
          // Get reward details
          const rewardDoc = await this.db.collection("rewards").doc(rewardId).get();
          if (!rewardDoc.exists) {
            throw new Error("Reward not found");
          }

          const reward = rewardDoc.data() as any;
          redeemAmount = reward.healCoinsCost;

          // Check stock availability
          if (reward.stock <= 0) {
            throw new Error("Reward out of stock");
          }
        }

        if (!redeemAmount || redeemAmount <= 0) {
          throw new Error("Invalid redemption amount");
        }

        // Check sufficient balance
        if (wallet.healCoins < redeemAmount) {
          throw new Error("Insufficient HealCoins balance");
        }

        // Check monthly redemption cap
        const monthlyRedeemed = await capsAndLimits.getMonthlyRedeemed(userId);
        if (monthlyRedeemed + redeemAmount > capsAndLimits.MONTHLY_REDEEM_CAP) {
          throw new Error(`Monthly redemption cap exceeded. Max: ${capsAndLimits.MONTHLY_REDEEM_CAP}`);
        }

        // Update wallet
        const updatedWallet: Wallet = {
          ...wallet,
          healCoins: wallet.healCoins - redeemAmount,
          totalRedeemed: wallet.totalRedeemed + redeemAmount,
          lastTransactionAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Create transaction record
        const transaction: WalletTransaction = {
          id: this.db.collection("walletTransactions").doc().id,
          walletId: userId,
          type: "redeem",
          amount: redeemAmount,
          source: rewardId ? `reward:${rewardId}` : "cash",
          description: rewardId ? `Redeemed reward for ${redeemAmount} HealCoins` : `Redeemed ${redeemAmount} HealCoins for cash`,
          metadata: {rewardId, amount: redeemAmount},
          auditLogId: "", // Will be set by audit log
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Batch update
        const batch = this.db.batch();
        batch.set(this.db.collection("wallets").doc(userId), this.sanitizeForFirestore(updatedWallet));
        batch.set(this.db.collection("walletTransactions").doc(transaction.id), this.sanitizeForFirestore(transaction));

        // Update reward stock if applicable
        if (rewardId) {
          const rewardRef = this.db.collection("rewards").doc(rewardId);
          batch.update(rewardRef, {
            stock: FieldValue.increment(-1),
            updatedAt: Timestamp.fromDate(new Date()),
          });
        }

        await batch.commit();

        // Log audit trail
        await this.logAudit(
          "walletUpdate",
          userId,
          userId,
          before,
          updatedWallet,
          "WalletService:redeemCoins"
        );

        // Log activity
        await this.logActivity(
          userId,
          "coinsRedeemed",
          {amount: redeemAmount, rewardId, newBalance: updatedWallet.healCoins},
          "wallet"
        );

        return updatedWallet;
      },
      "wallet_redeem_coins",
      {userId, redeemAmount, rewardId},
      "wallet"
    );
  }
}

export const walletService = new WalletService();
