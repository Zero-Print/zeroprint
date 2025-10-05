import {db} from "../../lib/firebase";
import type {CarbonLog} from "../../types/shared";
import {logUserActivity} from "../../lib/auditService";

export class CarbonService {
  async addCarbonLog(
    userId: string,
    logData: Omit<
      CarbonLog,
      "id" | "userId" | "timestamp" | "co2Saved"
    > & { value: number; actionType: string }
  ): Promise<CarbonLog> {
    try {
      const logId =
        "carbon_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substr(2, 9);
      const carbonLog: CarbonLog = {
        id: logId,
        userId,
        categoryId: logData.categoryId || "general",
        action: logData.actionType,
        co2Saved: 0,
        quantity: logData.value,
        unit: logData.unit || "kg",
        timestamp: new Date().toISOString(),
        metadata: logData.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection("carbonLogs").doc(logId).set(carbonLog);

      await logUserActivity(
        userId,
        "CARBON_LOG_CREATED",
        {action: carbonLog.action, quantity: carbonLog.quantity},
        "carbonService"
      );

      return carbonLog;
    } catch (error) {
      throw new Error(`Failed to add carbon log: ${error}`);
    }
  }

  async getCarbonLogs(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<CarbonLog[]> {
    try {
      const snapshot = await db
        .collection("carbonLogs")
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .limit(limit)
        .offset(offset)
        .get();
      return snapshot.docs.map((doc) => doc.data() as CarbonLog);
    } catch (error) {
      throw new Error(`Failed to get carbon logs: ${error}`);
    }
  }

  async updateCarbonLog(logId: string, userId: string, updates: Partial<CarbonLog>): Promise<void> {
    try {
      const logDoc = await db.collection("carbonLogs").doc(logId).get();
      if (!logDoc.exists) {
        throw new Error("Carbon log not found");
      }

      const logData = logDoc.data() as CarbonLog;
      if (logData.userId !== userId) {
        throw new Error("Unauthorized to update this log");
      }

      await db.collection("carbonLogs").doc(logId).update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      await logUserActivity(
        userId,
        "CARBON_LOG_UPDATED",
        {logId, updates: Object.keys(updates)},
        "carbonService"
      );
    } catch (error) {
      throw new Error(`Failed to update carbon log: ${error}`);
    }
  }

  async deleteCarbonLog(logId: string, userId: string): Promise<void> {
    try {
      const logDoc = await db.collection("carbonLogs").doc(logId).get();
      if (!logDoc.exists) {
        throw new Error("Carbon log not found");
      }

      const logData = logDoc.data() as CarbonLog;
      if (logData.userId !== userId) {
        throw new Error("Unauthorized to delete this log");
      }

      await db.collection("carbonLogs").doc(logId).delete();

      await logUserActivity(
        userId,
        "CARBON_LOG_DELETED",
        {logId},
        "carbonService"
      );
    } catch (error) {
      throw new Error(`Failed to delete carbon log: ${error}`);
    }
  }
}
