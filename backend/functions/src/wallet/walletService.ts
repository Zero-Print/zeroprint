import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {Wallet, Transaction, TransactionType} from "../types";
import {logAudit, logUserActivity} from "../lib/auditService";

// Define the expected data structure
interface EarnCoinsData {
    userId: string;
    gameId: string;
    coins: number;
}

export const earnCoins = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<EarnCoinsData>) => {
  // Ensure user is authenticated
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
    }

    const {userId, gameId, coins} = request.data;

    // Basic validation
    if (!userId || !gameId || typeof coins !== "number") {
      throw new functions.https.HttpsError("invalid-argument", "Missing or invalid parameters");
    }

    const walletRef = db.collection("wallets").doc(userId);
    await db.runTransaction(async (tx) => {
      const wallet = (await tx.get(walletRef)).data();
      if (!wallet) throw new functions.https.HttpsError("not-found", "Wallet missing");
      tx.update(walletRef, {balance: wallet.balance + coins});
    });

    // Optionally use gameId in a log or future logic to avoid TS6133
    console.log(`Coins earned for game: ${gameId}`);
    return {status: "success", message: `Earned ${coins} coins`};
  });

export class WalletService {
  async getWallet(userId: string): Promise<Wallet | null> {
    try {
      const walletDoc = await db.collection("wallets").doc(userId).get();
      return walletDoc.exists ? (walletDoc.data() as Wallet) : null;
    } catch (error) {
      throw new Error(`Failed to get wallet: ${error}`);
    }
  }

  async createWallet(userId: string): Promise<Wallet> {
    try {
      const wallet: Wallet = {
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

      await db.collection("wallets").doc(userId).set(wallet);
      return wallet;
    } catch (error) {
      throw new Error(`Failed to create wallet: ${error}`);
    }
  }

  async addCredits(
    userId: string,
    amount: number,
    type: TransactionType,
    description: string,
    metadata?: any
  ): Promise<Transaction> {
    try {
      const wallet = await this.getWallet(userId) || await this.createWallet(userId);

      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const transaction: Transaction = {
        id: transactionId,
        transactionId: transactionId,
        userId,
        type,
        amount,
        currency: type.includes("inr") ? "INR" : "HEAL",
        description,
        status: "completed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update wallet balance
      const updates: Partial<Wallet> = {
        lastUpdated: new Date().toISOString(),
      };

      if (type === "inr_credit" || type === "inr_debit") {
        updates.inrBalance = wallet.inrBalance + (type === "inr_credit" ? amount : -amount);
      } else if (type === "healcoin_credit" || type === "healcoin_debit") {
        updates.healCoins = wallet.healCoins + (type === "healcoin_credit" ? amount : -amount);
      }

      // Use transaction to ensure atomicity
      await db.runTransaction(async (t) => {
        t.update(db.collection("wallets").doc(userId), updates);
        t.set(db.collection("transactions").doc(transaction.id), transaction);
      });

      // Log transaction
      await logAudit(
        "WALLET_TRANSACTION",
        userId,
        userId,
        {},
        {transactionId: transaction.id, type, amount},
        "walletService"
      );

      await logUserActivity(
        userId,
        "WALLET_UPDATED",
        {type, amount},
        "walletService"
      );

      return transaction;
    } catch (error) {
      throw new Error(`Failed to add credits: ${error}`);
    }
  }

  async getTransactions(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Transaction[]> {
    try {
      const snapshot = await db
        .collection("transactions")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .offset(offset)
        .get();

      return snapshot.docs.map((doc) => doc.data() as Transaction);
    } catch (error) {
      throw new Error(`Failed to get transactions: ${error}`);
    }
  }

  async reverseTransaction(
    transactionId: string,
    adminUserId: string,
    reason: string
  ): Promise<Transaction> {
    try {
      const originalTxn = await db.collection("transactions").doc(transactionId).get();
      if (!originalTxn.exists) {
        throw new Error("Transaction not found");
      }

      const originalData = originalTxn.data() as Transaction;

      // Create reverse transaction
      const reverseType = this.getReverseTransactionType(originalData.type);
      const reverseTxn = await this.addCredits(
        originalData.userId,
        originalData.amount,
        reverseType,
        `Reversal: ${reason}`,
        {originalTransactionId: transactionId, reversedBy: adminUserId}
      );

      // Mark original transaction as reversed
      await db.collection("transactions").doc(transactionId).update({
        status: "reversed",
        reversedAt: new Date(),
        reversedBy: adminUserId,
        reverseReason: reason,
      });

      await logAudit(
        "TRANSACTION_REVERSED",
        adminUserId,
        transactionId,
        {},
        {originalTransactionId: transactionId, reason},
        "walletService"
      );

      return reverseTxn;
    } catch (error) {
      throw new Error(`Failed to reverse transaction: ${error}`);
    }
  }

  private getReverseTransactionType(originalType: TransactionType): TransactionType {
    const reverseMap: Record<TransactionType, TransactionType> = {
      "credit": "debit",
      "debit": "credit",
      "inr_credit": "inr_debit",
      "inr_debit": "inr_credit",
      "healcoin_credit": "healcoin_debit",
      "healcoin_debit": "healcoin_credit",
    };
    return reverseMap[originalType];
  }
}

export const walletService = new WalletService();
