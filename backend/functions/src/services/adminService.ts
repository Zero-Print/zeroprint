/**
 * Admin Service - isolates Firestore operations for admin functions
 */

import {BaseService} from "./baseService";
import {ErrorLog, ActivityLog, DeploymentLog} from "../types";
import {AuditLog} from "../types/shared";
import {validateRequired} from "../lib/validators";
import {Timestamp} from "firebase-admin/firestore";

export class AdminService extends BaseService {
  async getAuditLogs(userId: string, page: number = 1, limit: number = 20, filters: any = {}): Promise<{ data: AuditLog[]; pagination: any }> {
    return this.executeWithMetrics(
      async () => {
        const offset = (page - 1) * limit;

        let query = this.db.collection("auditLogs").orderBy("createdAt", "desc");

        // Apply filters
        if (filters.userId) {
          query = query.where("actorId", "==", filters.userId);
        }
        if (filters.actionType) {
          query = query.where("actionType", "==", filters.actionType);
        }
        if (filters.dateFrom) {
          query = query.where("createdAt", ">=", Timestamp.fromDate(new Date(filters.dateFrom)));
        }
        if (filters.dateTo) {
          query = query.where("createdAt", "<=", Timestamp.fromDate(new Date(filters.dateTo)));
        }

        query = query.limit(limit).offset(offset);

        const snapshot = await query.get();
        const auditLogs = snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as AuditLog
        );

        // Get total count for pagination
        const totalSnapshot = await this.db.collection("auditLogs").get();
        const total = totalSnapshot.size;

        return {
          data: auditLogs,
          pagination: {
            page,
            limit,
            total,
            hasNext: offset + limit < total,
            hasPrev: page > 1,
          },
        };
      },
      "admin_get_audit_logs",
      {userId, page, limit},
      "admin"
    );
  }

  async getErrorLogs(userId: string, page: number = 1, limit: number = 20): Promise<{ data: ErrorLog[]; pagination: any }> {
    return this.executeWithMetrics(
      async () => {
        const offset = (page - 1) * limit;

        const query = this.db
          .collection("errorLogs")
          .orderBy("createdAt", "desc")
          .limit(limit)
          .offset(offset);

        const snapshot = await query.get();
        const errorLogs = snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as ErrorLog
        );

        // Get total count for pagination
        const totalSnapshot = await this.db.collection("errorLogs").get();
        const total = totalSnapshot.size;

        return {
          data: errorLogs,
          pagination: {
            page,
            limit,
            total,
            hasNext: offset + limit < total,
            hasPrev: page > 1,
          },
        };
      },
      "admin_get_error_logs",
      {userId, page, limit},
      "admin"
    );
  }

  async getActivityLogs(userId: string, page: number = 1, limit: number = 20): Promise<{ data: ActivityLog[]; pagination: any }> {
    return this.executeWithMetrics(
      async () => {
        const offset = (page - 1) * limit;

        const query = this.db
          .collection("activityLogs")
          .orderBy("createdAt", "desc")
          .limit(limit)
          .offset(offset);

        const snapshot = await query.get();
        const activityLogs = snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as ActivityLog
        );

        // Get total count for pagination
        const totalSnapshot = await this.db.collection("activityLogs").get();
        const total = totalSnapshot.size;

        return {
          data: activityLogs,
          pagination: {
            page,
            limit,
            total,
            hasNext: offset + limit < total,
            hasPrev: page > 1,
          },
        };
      },
      "admin_get_activity_logs",
      {userId, page, limit},
      "admin"
    );
  }

  async reverseTransaction(userId: string, logId: string): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        validateRequired(userId, "userId");
        validateRequired(logId, "logId");

        // Get audit log
        const auditLogDoc = await this.db.collection("auditLogs").doc(logId).get();
        if (!auditLogDoc.exists) {
          throw new Error("Audit log not found");
        }

        const auditLog = this.convertFromFirestore(auditLogDoc.data()) as AuditLog;

        // Check if it's a wallet transaction
        if (auditLog.actionType !== "walletUpdate") {
          throw new Error("Can only reverse wallet transactions");
        }

        // Reverse the transaction
        const before = auditLog.before;
        const after = auditLog.after;

        // Update wallet to previous state
        await this.db.collection("wallets").doc(auditLog.entityId).set(
          this.sanitizeForFirestore(before)
        );

        // Create reversal audit log
        const reversalLog: AuditLog = {
          id: this.db.collection("auditLogs").doc().id,
          actorId: userId,
          actionType: "walletReversal",
          entityId: auditLog.entityId,
          before: after,
          after: before,
          source: "AdminService:reverseTransaction",
          hash: "", // Would be calculated
          previousHash: auditLog.hash,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await this.db.collection("auditLogs").doc(reversalLog.id).set(
          this.sanitizeForFirestore(reversalLog)
        );

        // Log activity
        await this.logActivity(
          userId,
          "transactionReversed",
          {logId, originalLogId: logId},
          "admin"
        );

        return {success: true, reversalLogId: reversalLog.id};
      },
      "admin_reverse_transaction",
      {userId, logId},
      "admin"
    );
  }

  async getDeployLogs(userId: string, page: number = 1, limit: number = 20): Promise<{ data: DeploymentLog[]; pagination: any }> {
    return this.executeWithMetrics(
      async () => {
        const offset = (page - 1) * limit;

        const query = this.db
          .collection("deployLogs")
          .orderBy("createdAt", "desc")
          .limit(limit)
          .offset(offset);

        const snapshot = await query.get();
        const deployLogs = snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as DeploymentLog
        );

        // Get total count for pagination
        const totalSnapshot = await this.db.collection("deployLogs").get();
        const total = totalSnapshot.size;

        return {
          data: deployLogs,
          pagination: {
            page,
            limit,
            total,
            hasNext: offset + limit < total,
            hasPrev: page > 1,
          },
        };
      },
      "admin_get_deploy_logs",
      {userId, page, limit},
      "admin"
    );
  }

  async getAnalytics(userId: string, timeRange: string): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        const startDate = this.getStartDate(timeRange);

        // Get various metrics
        const users = await this.db.collection("users").get();
        const wallets = await this.db.collection("wallets").get();
        const carbonLogs = await this.db
          .collection("carbonLogs")
          .where("createdAt", ">=", Timestamp.fromDate(startDate))
          .get();

        const analytics = {
          totalUsers: users.size,
          activeUsers: users.docs.filter((doc) => doc.data().isActive).length,
          totalHealCoins: wallets.docs.reduce((sum, doc) => sum + (doc.data().healCoins || 0), 0),
          totalCO2Saved: carbonLogs.docs.reduce((sum, doc) => sum + (doc.data().co2Saved || 0), 0),
          recentActivity: carbonLogs.size,
        };

        return analytics;
      },
      "admin_get_analytics",
      {userId, timeRange},
      "admin"
    );
  }

  async exportAnalytics(userId: string, timeRange: string, format: string): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        const analytics = await this.getAnalytics(userId, timeRange);

        if (format === "csv") {
          return this.generateCSV(analytics);
        } else if (format === "pdf") {
          return this.generatePDF(analytics);
        }

        return analytics;
      },
      "admin_export_analytics",
      {userId, timeRange, format},
      "admin"
    );
  }

  private getStartDate(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private generateCSV(analytics: any): string {
    const headers = ["Metric", "Value"];
    const rows = [
      ["Total Users", analytics.totalUsers],
      ["Active Users", analytics.activeUsers],
      ["Total HealCoins", analytics.totalHealCoins],
      ["Total CO2 Saved", analytics.totalCO2Saved],
      ["Recent Activity", analytics.recentActivity],
    ];

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    return csvContent;
  }

  private generatePDF(analytics: any): Buffer {
    // Mock PDF generation
    const content = `Analytics Report\n\nTotal Users: ${analytics.totalUsers}\nActive Users: ${analytics.activeUsers}\nTotal HealCoins: ${analytics.totalHealCoins}\nTotal CO2 Saved: ${analytics.totalCO2Saved}\nRecent Activity: ${analytics.recentActivity}`;
    return Buffer.from(content);
  }
}

export const adminService = new AdminService();
