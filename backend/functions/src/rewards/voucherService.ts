import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {SecurityHelpers} from "../lib/securityHelpers";
import {logAudit, logUserActivity} from "../lib/auditService";
import {Voucher} from "../types";

/**
 * Upload vouchers from CSV (admin only)
 */
export async function uploadVouchers(
  request: CallableRequest<{
    rewardId: string;
    voucherCodes: string[];
  }>
) {
  try {
    // Validate authentication
    const authUserId = SecurityHelpers.validateAuth(request);

    // Validate admin role
    await SecurityHelpers.validateUser(authUserId);

    // Validate required parameters
    SecurityHelpers.validateRequired(request.data, ["rewardId", "voucherCodes"]);

    const {rewardId, voucherCodes} = request.data;

    // Validate that voucherCodes is an array
    if (!Array.isArray(voucherCodes)) {
      throw new functions.https.HttpsError("invalid-argument", "voucherCodes must be an array");
    }

    // Validate that voucherCodes is not empty
    if (voucherCodes.length === 0) {
      throw new functions.https.HttpsError("invalid-argument", "voucherCodes cannot be empty");
    }

    // Validate that each voucher code is a string
    for (const code of voucherCodes) {
      if (typeof code !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "Each voucher code must be a string");
      }
    }

    // Create voucher documents
    const batch = db.batch();
    const voucherIds: string[] = [];

    for (const code of voucherCodes) {
      const voucherId = `vchr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      voucherIds.push(voucherId);

      const voucher: Voucher = {
        voucherId,
        code,
        rewardId,
        isRedeemed: false,
        createdAt: new Date().toISOString(),
        createdBy: authUserId,
      };

      const voucherRef = db.collection("vouchers").doc(voucherId);
      batch.set(voucherRef, voucher);
    }

    // Commit batch
    await batch.commit();

    // Log audit trail
    await logAudit(
      "VOUCHERS_UPLOADED",
      authUserId,
      rewardId,
      {},
      {
        rewardId,
        count: voucherCodes.length,
        voucherIds,
      },
      "VoucherService"
    );

    // Log user activity
    await logUserActivity(
      authUserId,
      "VOUCHERS_UPLOADED",
      {
        rewardId,
        count: voucherCodes.length,
      },
      "vouchers"
    );

    return SecurityHelpers.createResponse("success", `${voucherCodes.length} vouchers uploaded successfully`, {
      count: voucherCodes.length,
    });
  } catch (error) {
    console.error("Error in uploadVouchers:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to upload vouchers");
  }
}

/**
 * Verify partner redemption (QR code or voucher ID scan)
 */
export async function verifyPartnerRedemption(
  request: CallableRequest<{
    voucherCode: string;
  }>
) {
  try {
    // Validate authentication
    const authUserId = SecurityHelpers.validateAuth(request);

    // Validate required parameters
    SecurityHelpers.validateRequired(request.data, ["voucherCode"]);

    const {voucherCode} = request.data;

    // Find voucher by code
    const voucherQuery = await db.collection("vouchers")
      .where("code", "==", voucherCode)
      .limit(1)
      .get();

    if (voucherQuery.empty) {
      throw new functions.https.HttpsError("not-found", "Invalid voucher code");
    }

    const voucherDoc = voucherQuery.docs[0];
    const voucher = voucherDoc.data() as Voucher;

    // Check if voucher is already redeemed
    if (voucher.isRedeemed) {
      throw new functions.https.HttpsError("failed-precondition", "Voucher has already been redeemed");
    }

    // Get reward details
    const rewardDoc = await db.collection("rewards").doc(voucher.rewardId).get();

    if (!rewardDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Reward not found");
    }

    const reward = rewardDoc.data();

    // Log audit trail
    await logAudit(
      "VOUCHER_VERIFIED",
      authUserId,
      voucher.voucherId,
      {},
      {
        voucherId: voucher.voucherId,
        voucherCode,
        rewardId: voucher.rewardId,
      },
      "VoucherService"
    );

    // Log user activity
    await logUserActivity(
      authUserId,
      "VOUCHER_VERIFIED",
      {
        voucherId: voucher.voucherId,
        voucherCode,
      },
      "vouchers"
    );

    return SecurityHelpers.createResponse("success", "Voucher verified successfully", {
      isValid: true,
      rewardId: voucher.rewardId,
      rewardTitle: reward?.title || "Reward",
    });
  } catch (error) {
    console.error("Error in verifyPartnerRedemption:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to verify voucher");
  }
}

/**
 * Get vouchers for a reward (admin only)
 */
export async function getVouchersForReward(
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

    // Get vouchers for reward
    const snapshot = await db
      .collection("vouchers")
      .where("rewardId", "==", rewardId)
      .orderBy("createdAt", "desc")
      .get();

    const vouchers = snapshot.docs.map((doc) => doc.data() as Voucher);

    // Log user activity
    await logUserActivity(
      authUserId,
      "VOUCHERS_VIEWED",
      {
        rewardId,
      },
      "vouchers"
    );

    return SecurityHelpers.createResponse("success", "Vouchers retrieved successfully", {
      vouchers,
    });
  } catch (error) {
    console.error("Error in getVouchersForReward:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to retrieve vouchers");
  }
}
