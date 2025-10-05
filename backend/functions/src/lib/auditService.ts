/**
 * Audit Service
 * Handles audit logging for all sensitive actions
 */

import {db} from "./firebase";
import crypto from "crypto";

export interface AuditLog {
  id: string;
  actorId: string;
  actionType: string;
  entityId: string;
  before: unknown;
  after: unknown;
  source: string;
  timestamp: Date;
  hash?: string;
  previousHash?: string;
}

// Get the last audit log hash for chaining
async function getLastAuditHash(): Promise<string | null> {
  try {
    const lastLog = await db
      .collection("auditLogs")
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (lastLog.empty) return null;

    const lastDoc = lastLog.docs[0].data() as AuditLog;
    return lastDoc.hash || null;
  } catch (error) {
    console.error("Error getting last audit hash:", error);
    return null;
  }
}

// Generate hash for audit log
function generateAuditHash(
  log: Omit<AuditLog, "hash" | "previousHash">,
  previousHash: string | null
): string {
  const dataToHash = JSON.stringify({
    actorId: log.actorId,
    actionType: log.actionType,
    entityId: log.entityId,
    before: log.before,
    after: log.after,
    source: log.source,
    timestamp: log.timestamp.toISOString(),
    previousHash,
  });

  return crypto.createHash("sha256").update(dataToHash).digest("hex");
}

// Log audit trail
// Alias for logAudit
export const logAuditEvent = logAudit;

export async function logAudit(
  actionType: string,
  actorId: string,
  entityId: string,
  before: unknown,
  after: unknown,
  source: string
): Promise<string> {
  try {
    const timestamp = new Date();
    const logId = `audit_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;

    // Get previous hash for chaining
    const previousHash = await getLastAuditHash();

    const auditLog: Omit<AuditLog, "hash"> = {
      id: logId,
      actorId,
      actionType,
      entityId,
      before,
      after,
      source,
      timestamp,
      previousHash: previousHash || undefined,
    };

    // Generate hash
    const hash = generateAuditHash(auditLog, previousHash);

    const completeLog: AuditLog = {
      ...auditLog,
      hash,
    };

    // Store in Firestore
    await db.collection("auditLogs").doc(logId).set(completeLog);

    console.log(`Audit logged: ${actionType} by ${actorId} on ${entityId}`);
    return logId;
  } catch (error: unknown) {
    console.error("Error logging audit:", error);
    throw error;
  }
}

// Log user activity
export async function logUserActivity(
  userId: string,
  action: string,
  details: unknown,
  module: string
): Promise<string> {
  try {
    const activityId = `activity_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;
    const timestamp = new Date();

    const activityLog = {
      id: activityId,
      userId,
      action,
      details,
      module,
      timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Store in Firestore
    await db.collection("activityLogs").doc(activityId).set(activityLog);

    console.log(`Activity logged: ${action} by ${userId} in ${module}`);
    return activityId;
  } catch (error: unknown) {
    console.error("Error logging user activity:", error);
    throw error;
  }
}

// Get audit logs with pagination
export async function getAuditLogs(
  filters: {
    userId?: string;
    actionType?: string;
    dateFrom?: Date;
    dateTo?: Date;
  } = {},
  page = 1,
  limit = 20
): Promise<{ data: AuditLog[]; pagination: any }> {
  try {
    let query: FirebaseFirestore.Query = db
      .collection("auditLogs")
      .orderBy("timestamp", "desc");

    // Apply filters
    if (filters.userId) {
      query = query.where("actorId", "==", filters.userId);
    }
    if (filters.actionType) {
      query = query.where("actionType", "==", filters.actionType);
    }
    if (filters.dateFrom) {
      query = query.where("timestamp", ">=", filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.where("timestamp", "<=", filters.dateTo);
    }

    // Get total count
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedQuery = query.offset(offset).limit(limit);

    const snapshot = await paginatedQuery.get();
    const data = snapshot.docs.map((doc) => doc.data() as AuditLog);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        hasNext: offset + limit < total,
        hasPrev: page > 1,
      },
    };
  } catch (error: unknown) {
    console.error("Error getting audit logs:", error);
    throw error;
  }
}

// Verify audit log integrity
export async function verifyAuditLogIntegrity(): Promise<{
  valid: boolean;
  errors: string[];
}> {
  try {
    const errors: string[] = [];

    // Get all audit logs in order
    const snapshot = await db
      .collection("auditLogs")
      .orderBy("timestamp", "asc")
      .get();

    if (snapshot.empty) {
      return {valid: true, errors: []};
    }

    const logs = snapshot.docs.map((doc) => doc.data() as AuditLog);
    let previousHash: string | null = null;

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];

      // Verify hash
      const expectedHash = generateAuditHash(log, previousHash);
      if (log.hash !== expectedHash) {
        errors.push(`Hash mismatch for log ${log.id} at position ${i}`);
      }

      // Verify previous hash reference
      if (i > 0 && log.previousHash !== previousHash) {
        errors.push(`Previous hash mismatch for log ${log.id} at position ${i}`);
      }

      previousHash = log.hash ?? null;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error: unknown) {
    console.error("Error verifying audit log integrity:", error);
    return {
      valid: false,
      errors: [
        error instanceof Error ?
          `Verification failed: ${error.message}` :
          "Verification failed: Unknown error",
      ],
    };
  }
}
