import * as functions from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {logAudit, logUserActivity} from "../lib/auditService";

type ExportUserDataRequest = { userId: string };
type DeleteUserAccountRequest = { userId: string };
type ReverseTransactionRequest = { logId: string; adminId: string };

/**
 * Append immutable audit log (explicit function)
 */
export const logAuditEventFn = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<any>) => {
    try {
      if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Auth required");
      const {eventType, resourceId, details} = request.data || {};
      if (!eventType) throw new HttpsError("invalid-argument", "eventType is required");

      const auditId = await logAudit(
        eventType,
        request.auth.uid,
        resourceId,
        {},
        details,
        "SecurityFunctions"
      );

      return {success: true, auditId};
    } catch (error) {
      console.error("logAuditEventFn error:", error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", "Failed to log audit event");
    }
  }
);

// Optional hardening: prevent accidental updates/deletes to auditLogs via triggers
export const onAuditLogWrite = functions.firestore.onDocumentWritten(
  {region: "asia-south1", document: "auditLogs/{logId}"},
  async (event) => {
    const before = event.data?.before;
    const after = event.data?.after;
    // Allow only creates; block updates and deletes
    if (before?.exists && after?.exists) {
      console.warn("Attempt to UPDATE audit log", event.params.logId);
      // No throw supported here; revert by writing back the old data
      try {
        const prev = before.data();
        if (prev) await db.collection("auditLogs").doc(event.params.logId).set(prev, {merge: false});
      } catch (e) {
        console.error("Failed to revert audit log update", e);
      }
    } else if (before?.exists && !after?.exists) {
      console.warn("Attempt to DELETE audit log", event.params.logId);
      try {
        const prev = before.data();
        if (prev) await db.collection("auditLogs").doc(event.params.logId).set(prev, {merge: false});
      } catch (e) {
        console.error("Failed to restore deleted audit log", e);
      }
    }
  }
);

// Deployment logs utilities
export const logDeployment = functions.https.onCall(
  {region: "asia-south1"},
  async (request) => {
    const {branch, actor, status, commitHash, module} = request.data || {};
    if (!branch || !actor || !status || !commitHash) {
      throw new HttpsError("invalid-argument", "branch, actor, status, commitHash are required");
    }
    const deployId = `dep_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await db.collection("deployLogs").doc(deployId).set({
      deployId,
      branch,
      actor,
      status,
      timestamp: new Date().toISOString(),
      commitHash,
      module: module || "core",
    });
    await logAudit(
      "DEPLOYMENT_LOGGED",
      actor,
      deployId,
      {},
      {branch, status, commitHash, module: module || "core"},
      "SecurityFunctions"
    );
    return {success: true, deployId};
  }
);


/**
 * Export user data for DPDP compliance
 */
export const exportUserData = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<ExportUserDataRequest>) => {
    try {
      if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Auth required");
      const {userId} = request.data || {};
      if (!userId) throw new HttpsError("invalid-argument", "userId is required");
      if (request.auth.uid !== userId && !request.auth.token?.admin) {
        throw new HttpsError("permission-denied", "Not allowed");
      }

      const collections = [
        {name: "users", field: "userId"},
        {name: "wallets", field: "walletId"},
        {name: "payments", field: "userId"},
        {name: "subscriptions", field: "userId"},
        {name: "carbonLogs", field: "userId"},
        {name: "mentalHealthLogs", field: "userId"},
        {name: "animalWelfareLogs", field: "userId"},
        {name: "digitalTwinSimulations", field: "userId"},
        {name: "gameScores", field: "userId"},
        {name: "redemptions", field: "userId"},
      ];

      const exportData: Record<string, any[]> = {};
      for (const col of collections) {
        const snap = await db.collection(col.name).where(col.field, "==", userId).get();
        exportData[col.name] = snap.docs.map((d) => ({id: d.id, ...d.data()}));
      }

      await logAudit(
        "DATA_EXPORT_REQUESTED",
        userId,
        userId,
        {},
        {collections: exportData ? Object.keys(exportData) : []},
        "SecurityFunctions"
      );

      return {success: true, data: exportData};
    } catch (error) {
      console.error("exportUserData error:", error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", "Failed to export user data");
    }
  }
);

/**
 * Delete user account with anonymization (DPDP)
 */
export const deleteUserAccount = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<DeleteUserAccountRequest>) => {
    try {
      if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Auth required");
      const {userId} = request.data || {};
      if (!userId) throw new HttpsError("invalid-argument", "userId is required");
      if (request.auth.uid !== userId && !request.auth.token?.admin) {
        throw new HttpsError("permission-denied", "Not allowed");
      }

      // Anonymize PII in users doc
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        await userRef.update({
          email: null,
          displayName: null,
          name: null,
          phoneNumber: null,
          profilePicture: null,
          anonymizedAt: new Date().toISOString(),
          isActive: false,
        });
      }

      // Forfeit wallet balance
      const walletRef = db.collection("wallets").doc(userId);
      const walletDoc = await walletRef.get();
      if (walletDoc.exists) {
        await walletRef.update({healCoins: 0, inrBalance: 0, lastUpdated: new Date().toISOString()});
      }

      // Mark in deletedUsers
      await db.collection("deletedUsers").doc(userId).set({
        userId,
        deletedAt: new Date().toISOString(),
        anonymized: true,
      });

      await logAudit(
        "ACCOUNT_DELETION_COMPLETED",
        userId,
        userId,
        {},
        {},
        "SecurityFunctions"
      );

      await logUserActivity(
        userId,
        "accountDeleted",
        {category: "privacy"},
        "security"
      );

      return {success: true};
    } catch (error) {
      console.error("deleteUserAccount error:", error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", "Failed to delete user account");
    }
  }
);

/**
 * Reverse a wallet transaction (admin only)
 */
export const reverseTransaction = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<ReverseTransactionRequest>) => {
    try {
      if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Auth required");
      if (!request.auth.token?.admin) throw new HttpsError("permission-denied", "Admin only");
      const {logId, adminId} = request.data || {};
      if (!logId || !adminId) throw new HttpsError("invalid-argument", "logId and adminId required");

      // Find audit log to reverse
      const auditDoc = await db.collection("auditLogs").doc(logId).get();
      if (!auditDoc.exists) throw new HttpsError("not-found", "Audit log not found");
      const audit = auditDoc.data() as any;

      if (audit.eventType !== "earnCoins" && audit.eventType !== "redeemCoins") {
        throw new HttpsError("failed-precondition", "Only wallet events can be reversed");
      }

      const userId = audit.userId as string;
      const delta = audit.eventType === "earnCoins" ? -(audit.details?.coins || 0) : (audit.details?.amount || 0);

      await db.runTransaction(async (transaction) => {
        const walletRef = db.collection("wallets").doc(userId);
        const walletDoc = await transaction.get(walletRef);
        if (!walletDoc.exists) throw new HttpsError("not-found", "Wallet not found");
        const wallet = walletDoc.data() as any;
        const newBalance = Math.max(0, (wallet.healCoins || 0) + delta);
        transaction.update(walletRef, {healCoins: newBalance, lastUpdated: new Date().toISOString()});
      });

      const reversalAuditId = await logAudit(
        "TRANSACTION_REVERSED",
        adminId,
        userId,
        {},
        {originalLogId: logId, delta},
        "SecurityFunctions"
      );

      return {success: true, reversalAuditId};
    } catch (error) {
      console.error("reverseTransaction error:", error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", "Failed to reverse transaction");
    }
  }
);


