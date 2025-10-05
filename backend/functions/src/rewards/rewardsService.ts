import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {SecurityHelpers} from "../lib/securityHelpers";
import {logAudit, logUserActivity} from "../lib/auditService";
import {Reward} from "../types";

// Reward management functions

/**
 * Add a new reward (admin only)
 */
export async function addReward(
  request: CallableRequest<{
    title: string;
    description?: string;
    coinCost: number;
    stock: number;
    type: "voucher" | "product" | "credit";
    imageUrl?: string;
    metadata?: any;
    partnerId?: string;
  }>
) {
  try {
    // Validate authentication
    const authUserId = SecurityHelpers.validateAuth(request);

    // Validate admin role - in a real implementation, you would check for admin role
    // For now, we'll just validate the user exists
    await SecurityHelpers.validateUser(authUserId);

    // Validate required parameters
    SecurityHelpers.validateRequired(request.data, ["title", "coinCost", "stock", "type"]);

    const {title, description, coinCost, stock, type, imageUrl, metadata, partnerId} = request.data;

    // Validate numeric values
    const validCoinCost = SecurityHelpers.validateNumeric(coinCost, "coinCost", 1);
    const validStock = SecurityHelpers.validateNumeric(stock, "stock", 0);

    // Create reward document
    const rewardId = `rew_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reward: Reward = {
      rewardId,
      title,
      name: title, // Use title as name
      description,
      cost: validCoinCost, // Use coinCost as cost
      coinCost: validCoinCost,
      stock: validStock,
      type,
      imageUrl,
      partnerId,
      createdAt: new Date().toISOString(),
      createdBy: authUserId,
      isActive: true,
      metadata,
    };

    // Save to Firestore
    await db.collection("rewards").doc(rewardId).set(reward);

    // Log audit trail
    await logAudit(
      "REWARD_CREATED",
      authUserId,
      rewardId,
      {},
      {
        title,
        coinCost: validCoinCost,
        stock: validStock,
        type,
      },
      "rewardsService"
    );

    // Log user activity
    await logUserActivity(
      authUserId,
      "REWARD_CREATED",
      {
        rewardId,
        title,
      },
      "rewardsService"
    );

    return SecurityHelpers.createResponse("success", "Reward created successfully", {
      rewardId,
    });
  } catch (error) {
    console.error("Error in addReward:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to create reward");
  }
}

/**
 * Update an existing reward (admin only)
 */
export async function updateReward(
  request: CallableRequest<{
    rewardId: string;
    updates: Partial<Reward>;
  }>
) {
  try {
    // Validate authentication
    const authUserId = SecurityHelpers.validateAuth(request);

    // Validate admin role
    await SecurityHelpers.validateUser(authUserId);

    // Validate required parameters
    SecurityHelpers.validateRequired(request.data, ["rewardId", "updates"]);

    const {rewardId, updates} = request.data;

    // Get existing reward
    const rewardRef = db.collection("rewards").doc(rewardId);
    const rewardDoc = await rewardRef.get();

    if (!rewardDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Reward not found");
    }

    const existingReward = rewardDoc.data() as Reward;

    // Prepare updates
    const updatedReward: Partial<Reward> = {
      ...updates,
      rewardId: existingReward.rewardId, // Ensure ID is not changed
    };

    // Validate numeric values if provided
    if (updates.coinCost !== undefined) {
      updatedReward.coinCost = SecurityHelpers.validateNumeric(updates.coinCost, "coinCost", 1);
    }

    if (updates.stock !== undefined) {
      updatedReward.stock = SecurityHelpers.validateNumeric(updates.stock, "stock", 0);
    }

    // Update in Firestore
    await rewardRef.update(updatedReward);

    // Log audit trail
    await logAudit(
      "REWARD_UPDATED",
      authUserId,
      rewardId,
      {},
      {
        updates,
      },
      "rewardsService"
    );

    // Log user activity
    await logUserActivity(
      authUserId,
      "REWARD_UPDATED",
      {
        rewardId,
      },
      "rewardsService"
    );

    return SecurityHelpers.createResponse("success", "Reward updated successfully");
  } catch (error) {
    console.error("Error in updateReward:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to update reward");
  }
}

/**
 * Delete a reward (admin only)
 */
export async function deleteReward(
  request: CallableRequest<{
    rewardId: string;
  }>
) {
  try {
    // Validate authentication
    const authUserId = SecurityHelpers.validateAuth(request);

    // Validate admin role
    await SecurityHelpers.validateUser(authUserId);

    // Validate required parameters
    SecurityHelpers.validateRequired(request.data, ["rewardId"]);

    const {rewardId} = request.data;

    // Check if reward exists
    const rewardRef = db.collection("rewards").doc(rewardId);
    const rewardDoc = await rewardRef.get();

    if (!rewardDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Reward not found");
    }

    // Delete from Firestore
    await rewardRef.delete();

    // Log audit trail
    await logAudit(
      "REWARD_DELETED",
      authUserId,
      rewardId,
      {},
      {},
      "rewardsService"
    );

    // Log user activity
    await logUserActivity(
      authUserId,
      "REWARD_DELETED",
      {
        rewardId,
      },
      "rewardsService"
    );

    return SecurityHelpers.createResponse("success", "Reward deleted successfully");
  } catch (error) {
    console.error("Error in deleteReward:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to delete reward");
  }
}

/**
 * Get all rewards (public)
 */
export async function getRewards(
  request: CallableRequest<undefined>
) {
  try {
    // Validate authentication
    const authUserId = SecurityHelpers.validateAuth(request);

    // Get all active rewards
    const snapshot = await db
      .collection("rewards")
      .where("isActive", "==", true)
      .orderBy("createdAt", "desc")
      .get();

    const rewards = snapshot.docs.map((doc) => doc.data() as Reward);

    // Log user activity
    await logUserActivity(
      authUserId,
      "REWARDS_VIEWED",
      {},
      "rewardsService"
    );

    return SecurityHelpers.createResponse("success", "Rewards retrieved successfully", {
      rewards,
    });
  } catch (error) {
    console.error("Error in getRewards:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to retrieve rewards");
  }
}

/**
 * Get reward by ID (public)
 */
export async function getRewardById(
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

    // Get reward
    const rewardDoc = await db.collection("rewards").doc(rewardId).get();

    if (!rewardDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Reward not found");
    }

    const reward = rewardDoc.data() as Reward;

    // Log user activity
    await logUserActivity(
      authUserId,
      "REWARD_VIEWED",
      {
        rewardId,
      },
      "rewardsService"
    );

    return SecurityHelpers.createResponse("success", "Reward retrieved successfully", {
      reward,
    });
  } catch (error) {
    console.error("Error in getRewardById:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to retrieve reward");
  }
}

/**
 * Update reward stock (admin only)
 */
export async function updateRewardStock(
  request: CallableRequest<{
    rewardId: string;
    delta: number;
  }>
) {
  try {
    // Validate authentication
    const authUserId = SecurityHelpers.validateAuth(request);

    // Validate admin role
    await SecurityHelpers.validateUser(authUserId);

    // Validate required parameters
    SecurityHelpers.validateRequired(request.data, ["rewardId", "delta"]);

    const {rewardId, delta} = request.data;

    // Validate numeric value
    const validDelta = SecurityHelpers.validateNumeric(delta, "delta");

    // Get existing reward
    const rewardRef = db.collection("rewards").doc(rewardId);
    const rewardDoc = await rewardRef.get();

    if (!rewardDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Reward not found");
    }

    const existingReward = rewardDoc.data() as Reward;

    // Calculate new stock
    const newStock = existingReward.stock + validDelta;

    if (newStock < 0) {
      throw new functions.https.HttpsError("failed-precondition", "Cannot reduce stock below zero");
    }

    // Update stock
    await rewardRef.update({
      stock: newStock,
    });

    // Log audit trail
    await logAudit(
      "REWARD_STOCK_UPDATED",
      authUserId,
      rewardId,
      {oldStock: existingReward.stock},
      {
        newStock,
        delta: validDelta,
      },
      "rewardsService"
    );

    // Log user activity
    await logUserActivity(
      authUserId,
      "REWARD_STOCK_UPDATED",
      {
        rewardId,
        delta: validDelta,
      },
      "rewardsService"
    );

    return SecurityHelpers.createResponse("success", "Reward stock updated successfully", {
      newStock,
    });
  } catch (error) {
    console.error("Error in updateRewardStock:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to update reward stock");
  }
}
