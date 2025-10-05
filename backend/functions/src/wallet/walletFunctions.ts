import * as functions from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {SecurityHelpers, DAILY_EARN_LIMIT, MONTHLY_REDEEM_LIMIT} from "../lib/securityHelpers";
import {logAudit, logUserActivity} from "../lib/auditService";
import {Wallet} from "../types";

// Use types from central types file
export type EarnCoinsData = {
  userId: string;
  gameId: string;
  coins: number;
};

export type RedeemCoinsData = {
  userId: string;
  amount: number;
  rewardId?: string;
};

/**
 * Secure function to earn coins with validation and caps
 */
export const earnCoins = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<EarnCoinsData>) => {
    try {
      // Validate authentication
      const authUserId = SecurityHelpers.validateAuth(request);

      // Validate required parameters
      SecurityHelpers.validateRequired(request.data, ["userId", "gameId", "coins"]);

      const {userId, gameId, coins} = request.data;

      // Ensure authenticated user matches the userId
      if (authUserId !== userId) {
        throw new HttpsError("permission-denied", "Cannot earn coins for another user");
      }

      // Validate coin amount
      const validCoins = SecurityHelpers.validateNumeric(coins, "coins", 1, 100);

      // Validate user exists and is active
      await SecurityHelpers.validateUser(userId);

      // Validate game exists and is active
      const game = await SecurityHelpers.validateGame(gameId);

      // Check for duplicate submissions (same day)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const duplicateCheck = await db.collection("gameScores")
        .where("userId", "==", userId)
        .where("gameId", "==", gameId)
        .where("createdAt", ">=", startOfDay.toISOString())
        .get();

      if (!duplicateCheck.empty) {
        throw new HttpsError("already-exists", "Duplicate game completion rejected");
      }

      // Check daily earning cap
      const withinDailyLimit = await SecurityHelpers.checkDailyEarnCap(userId, validCoins);
      if (!withinDailyLimit) {
        throw new HttpsError("resource-exhausted", "Daily earning limit exceeded");
      }

      // Execute transaction
      const result = await db.runTransaction(async (transaction) => {
        const walletRef = db.collection("wallets").doc(userId);
        const walletDoc = await transaction.get(walletRef);

        let wallet: Wallet;
        if (!walletDoc.exists) {
          // Create new wallet
          wallet = {
            walletId: userId,
            id: userId,
            entityId: userId,
            userId: userId,
            inrBalance: 0,
            healCoins: validCoins,
            totalEarned: validCoins,
            totalRedeemed: 0,
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            dailyEarnLimit: DAILY_EARN_LIMIT,
            monthlyEarnLimit: MONTHLY_REDEEM_LIMIT,
          };
          transaction.set(walletRef, wallet);
        } else {
          // Update existing wallet
          wallet = walletDoc.data() as Wallet;
          const updatedWallet = {
            ...wallet,
            healCoins: wallet.healCoins + validCoins,
            lastUpdated: new Date().toISOString(),
          };
          transaction.update(walletRef, updatedWallet);
          wallet = updatedWallet;
        }

        return wallet;
      });

      // Log audit trail
      await logAudit(
        "earnCoins",
        userId,
        userId,
        {},
        {
          gameId,
          coins: validCoins,
          gameTitle: game.title,
          newBalance: result.healCoins,
        },
        "walletFunctions"
      );

      // Log user activity
      await logUserActivity(
        userId,
        "earnCoins",
        {
          gameId,
          coins: validCoins,
          gameTitle: game.title,
        },
        "walletFunctions"
      );

      return SecurityHelpers.createResponse("success", `Earned ${validCoins} coins`, {
        updatedWallet: result,
        earnedCoins: validCoins,
        gameTitle: game.title,
      });
    } catch (error) {
      console.error("Error in earnCoins:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Failed to earn coins");
    }
  });

/**
 * Secure function to redeem coins with validation and caps
 */
export const redeemCoins = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<RedeemCoinsData>) => {
    try {
      // Validate authentication
      const authUserId = SecurityHelpers.validateAuth(request);

      // Validate required parameters
      SecurityHelpers.validateRequired(request.data, ["userId", "amount"]);

      const {userId, amount, rewardId} = request.data;

      // Ensure authenticated user matches the userId
      if (authUserId !== userId) {
        throw new HttpsError("permission-denied", "Cannot redeem coins for another user");
      }

      // Validate amount
      const validAmount = SecurityHelpers.validateNumeric(amount, "amount", 1);

      // Validate user exists and is active
      await SecurityHelpers.validateUser(userId);

      // Check monthly redeem cap
      const withinMonthlyLimit = await SecurityHelpers.checkMonthlyRedeemCap(userId, validAmount);
      if (!withinMonthlyLimit) {
        throw new HttpsError("resource-exhausted", "Monthly redemption limit exceeded");
      }

      // Execute transaction
      const result = await db.runTransaction(async (transaction) => {
        const walletRef = db.collection("wallets").doc(userId);
        const walletDoc = await transaction.get(walletRef);

        if (!walletDoc.exists) {
          throw new HttpsError("not-found", "Wallet not found");
        }

        const wallet = walletDoc.data() as Wallet;

        // Check sufficient balance
        if (wallet.healCoins < validAmount) {
          throw new HttpsError("failed-precondition", "Insufficient balance");
        }

        // Update wallet
        const updatedWallet = {
          ...wallet,
          healCoins: wallet.healCoins - validAmount,
          lastUpdated: new Date().toISOString(),
        };

        transaction.update(walletRef, updatedWallet);

        // If reward redemption, create redemption record
        if (rewardId) {
          const redemptionRef = db.collection("redemptions").doc();
          const redemption = {
            redemptionId: redemptionRef.id,
            userId,
            rewardId,
            amount: validAmount,
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          transaction.set(redemptionRef, redemption);
        }

        return updatedWallet;
      });

      // Log audit trail
      await logAudit(
        "redeemCoins",
        userId,
        userId,
        {},
        {
          amount: validAmount,
          rewardId: rewardId || null,
          newBalance: result.healCoins,
          redemptionType: rewardId ? "reward" : "direct",
        },
        "walletFunctions"
      );

      // Log user activity
      await logUserActivity(
        userId,
        "redeemCoins",
        {
          amount: validAmount,
          rewardId: rewardId || null,
          redemptionType: rewardId ? "reward" : "direct",
        },
        "walletFunctions"
      );

      return SecurityHelpers.createResponse("success", `Redeemed ${validAmount} coins`, {
        updatedWallet: result,
        redeemedAmount: validAmount,
        rewardId: rewardId || null,
      });
    } catch (error) {
      console.error("Error in redeemCoins:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Failed to redeem coins");
    }
  });

/**
 * Get wallet balance (read-only function)
 */
export const getWalletBalance = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ userId: string }>) => {
    try {
      // Validate authentication
      const authUserId = SecurityHelpers.validateAuth(request);

      const {userId} = request.data;

      // Ensure authenticated user matches the userId
      if (authUserId !== userId) {
        throw new HttpsError("permission-denied", "Cannot view another user's wallet");
      }

      // Get wallet
      const walletDoc = await db.collection("wallets").doc(userId).get();

      if (!walletDoc.exists) {
        return SecurityHelpers.createResponse("success", "Wallet not found", {
          wallet: null,
          hasWallet: false,
        });
      }

      const wallet = walletDoc.data() as Wallet;

      return SecurityHelpers.createResponse("success", "Wallet retrieved", {
        wallet: {
          walletId: wallet.walletId,
          healCoins: wallet.healCoins,
          inrBalance: wallet.inrBalance,
          lastUpdated: wallet.lastUpdated,
          isActive: wallet.isActive,
        },
        hasWallet: true,
      });
    } catch (error) {
      console.error("Error in getWalletBalance:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Failed to get wallet balance");
    }
  });
