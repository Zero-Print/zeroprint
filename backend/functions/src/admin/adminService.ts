import {db} from "../lib/firebase";
import {logAudit} from "../lib/auditService";
import {walletService} from "../wallet/walletService";

/**
 * Service class for admin operations
 */
export class AdminService {
  /**
   * Get audit logs with filtering and pagination
   * @param {string} adminUserId - ID of the admin user
   * @param {object} filters - Filter criteria for audit logs
   * @param {number} limit - Maximum number of logs to return
   * @param {number} offset - Number of logs to skip
   * @return {Promise<object>} Audit logs with pagination info
   */
  async getAuditLogs(
    adminUserId: string,
    filters: Record<string, any> = {},
    limit: number = 100,
    offset: number = 0
  ) {
    try {
      // Verify admin permissions
      await this.verifyAdminAccess(adminUserId);

      // Get audit logs directly from database
      const logsSnapshot = await db.collection("auditLogs")
        .orderBy("timestamp", "desc")
        .limit(limit)
        .offset(offset)
        .get();

      const logs = logsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      await logAudit(
        "AUDIT_LOGS_ACCESSED",
        adminUserId,
        adminUserId,
        {},
        {filters, limit, offset},
        "adminService"
      );

      return logs;
    } catch (error) {
      throw new Error(`Failed to get audit logs: ${error}`);
    }
  }

  async getSystemConfigs(adminUserId: string) {
    try {
      await this.verifyAdminAccess(adminUserId);

      const configSnapshot = await db.collection("systemConfigs").get();
      const configs = configSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      await logAudit(
        "SYSTEM_CONFIGS_ACCESSED",
        adminUserId,
        adminUserId,
        {},
        {},
        "adminService"
      );

      return configs;
    } catch (error) {
      throw new Error(`Failed to get system configs: ${error}`);
    }
  }

  async updateSystemConfig(
    adminUserId: string,
    configId: string,
    updates: any
  ) {
    try {
      await this.verifyAdminAccess(adminUserId);

      const configRef = db.collection("systemConfigs").doc(configId);
      const configDoc = await configRef.get();

      if (!configDoc.exists) {
        throw new Error("Config not found");
      }

      const oldConfig = configDoc.data();

      await configRef.update({
        ...updates,
        updatedAt: new Date(),
        updatedBy: adminUserId,
      });

      await logAudit(
        "SYSTEM_CONFIG_UPDATED",
        adminUserId,
        configId,
        oldConfig,
        {
          configId,
          oldConfig,
          newConfig: updates,
        },
        "adminService"
      );

      return {success: true};
    } catch (error) {
      throw new Error(`Failed to update system config: ${error}`);
    }
  }

  async reverseTransaction(
    adminUserId: string,
    transactionId: string,
    reason: string
  ) {
    try {
      await this.verifyAdminAccess(adminUserId);

      const reversedTransaction = await walletService.reverseTransaction(
        transactionId,
        adminUserId,
        reason
      );

      await logAudit(
        "TRANSACTION_REVERSED_BY_ADMIN",
        adminUserId,
        transactionId,
        {},
        {
          originalTransactionId: transactionId,
          reversedTransactionId: reversedTransaction.id,
          reason,
        },
        "adminService"
      );

      return reversedTransaction;
    } catch (error) {
      throw new Error(`Failed to reverse transaction: ${error}`);
    }
  }

  async getSystemStats(adminUserId: string) {
    try {
      await this.verifyAdminAccess(adminUserId);

      // Get various system statistics
      const [
        totalUsers,
        activeUsers,
        totalTransactions,
        totalCarbonSaved,
      ] = await Promise.all([
        this.getTotalUsers(),
        this.getActiveUsers(),
        this.getTotalTransactions(),
        this.getTotalCarbonSaved(),
      ]);

      await logAudit(
        "SYSTEM_STATS_ACCESSED",
        adminUserId,
        adminUserId,
        {},
        {},
        "adminService"
      );

      return {
        totalUsers,
        activeUsers,
        totalTransactions,
        totalCarbonSaved,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to get system stats: ${error}`);
    }
  }

  private async verifyAdminAccess(userId: string): Promise<void> {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    if (userData?.role !== "admin") {
      throw new Error("Insufficient permissions");
    }
  }

  private async getTotalUsers(): Promise<number> {
    const snapshot = await db.collection("users").where("isActive", "==", true).get();
    return snapshot.size;
  }

  private async getActiveUsers(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await db
      .collection("activityLogs")
      .where("timestamp", ">=", thirtyDaysAgo)
      .get();

    const uniqueUsers = new Set(snapshot.docs.map((doc) => doc.data().userId));
    return uniqueUsers.size;
  }

  private async getTotalTransactions(): Promise<number> {
    const snapshot = await db.collection("transactions").get();
    return snapshot.size;
  }

  private async getTotalCarbonSaved(): Promise<number> {
    const snapshot = await db.collection("carbonLogs").get();
    return snapshot.docs.reduce((total, doc) => {
      return total + (doc.data().carbonSaved || 0);
    }, 0);
  }
}

export const adminService = new AdminService();
