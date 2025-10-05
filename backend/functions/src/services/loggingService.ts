/**
 * Logging Service
 * Centralized logging for audit, activity, errors, and performance metrics
 */

import {db} from "../lib/firebase";
import * as crypto from "crypto";

// Types
export interface AuditLog {
  id: string;
  type: string;
  action: string;
  userId: string;
  data: any;
  createdAt: Date;
  hash?: string;
  previousHash?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: any;
  timestamp: Date;
  module: string;
  coinsEarned?: number;
  co2Saved?: number;
}

export interface ErrorLog {
  id: string;
  module: string;
  errorType: string;
  message: string;
  stack?: string;
  userId?: string;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
  context?: any;
}

export interface PerformanceMetric {
  id: string;
  route: string;
  method: string;
  latency: number;
  p95: number;
  p99: number;
  timestamp: Date;
  userId?: string;
  statusCode: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface SystemAlert {
  id: string;
  type: "webhook_failure" | "co2_drop" | "downtime" | "error_spike" | "performance_degradation";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  data: any;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

class LoggingService {
  private static instance: LoggingService;
  private lastAuditHash: string | null = null;

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  // Generate hash for audit log chaining
  private generateAuditHash(log: Omit<AuditLog, "hash" | "previousHash">): string {
    const dataToHash = JSON.stringify({
      type: log.type,
      action: log.action,
      userId: log.userId,
      data: log.data,
      createdAt: log.createdAt.toISOString(),
      previousHash: this.lastAuditHash,
    });
    return crypto.createHash("sha256").update(dataToHash).digest("hex");
  }

  // Log audit trail
  async logAudit(
    type: string,
    action: string,
    userId: string,
    data: any,
    source: string = "LoggingService"
  ): Promise<string> {
    try {
      const logId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date();

      const auditLog: Omit<AuditLog, "hash" | "previousHash"> = {
        id: logId,
        type,
        action,
        userId,
        data,
        createdAt: timestamp,
      };

      const hash = this.generateAuditHash(auditLog);
      const completeLog: AuditLog = {
        ...auditLog,
        hash,
        previousHash: this.lastAuditHash || undefined,
      };

      await db.collection("auditLogs").doc(logId).set(completeLog);
      this.lastAuditHash = hash;

      console.log(`Audit logged: ${type}:${action} by ${userId}`);
      return logId;
    } catch (error) {
      console.error("Error logging audit:", error);
      throw error;
    }
  }

  // Log user activity
  async logActivity(
    userId: string,
    action: string,
    details: any,
    module: string = "system",
    coinsEarned?: number,
    co2Saved?: number
  ): Promise<string> {
    try {
      const logId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date();

      const activityLog: ActivityLog = {
        id: logId,
        userId,
        action,
        details,
        timestamp,
        module,
        coinsEarned,
        co2Saved,
      };

      await db.collection("activityLogs").doc(logId).set(activityLog);

      console.log(`Activity logged: ${action} by ${userId} in ${module}`);
      return logId;
    } catch (error) {
      console.error("Error logging activity:", error);
      throw error;
    }
  }

  // Log system error
  async logError(
    module: string,
    errorType: string,
    message: string,
    stack?: string,
    userId?: string,
    severity: "low" | "medium" | "high" | "critical" = "medium",
    context?: any
  ): Promise<string> {
    try {
      const logId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date();

      const errorLog: ErrorLog = {
        id: logId,
        module,
        errorType,
        message,
        stack,
        userId,
        timestamp,
        severity,
        resolved: false,
        context,
      };

      await db.collection("errorLogs").doc(logId).set(errorLog);

      // Log to console based on severity
      const logLevel = severity === "critical" ? "error" :
        severity === "high" ? "error" :
          severity === "medium" ? "warn" : "info";

      console[logLevel](`Error logged: ${errorType} in ${module} - ${message}`, stack);

      // Trigger alert for critical errors
      if (severity === "critical") {
        await this.triggerAlert("error_spike", "critical", `Critical error in ${module}`, {
          errorType,
          message,
          module,
          userId,
        });
      }

      return logId;
    } catch (error) {
      console.error("Error logging error:", error);
      throw error;
    }
  }

  // Record performance metric
  async recordPerformance(
    route: string,
    method: string,
    latency: number,
    statusCode: number,
    userId?: string,
    memoryUsage?: number,
    cpuUsage?: number
  ): Promise<string> {
    try {
      const metricId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date();

      // Calculate p95 and p99 (simplified - in production, use proper percentile calculation)
      const p95 = latency * 1.2; // Simplified calculation
      const p99 = latency * 1.5; // Simplified calculation

      const perfMetric: PerformanceMetric = {
        id: metricId,
        route,
        method,
        latency,
        p95,
        p99,
        timestamp,
        userId,
        statusCode,
        memoryUsage,
        cpuUsage,
      };

      await db.collection("perfMetrics").doc(metricId).set(perfMetric);

      // Check for performance degradation
      if (latency > 5000) { // 5 seconds threshold
        await this.triggerAlert("performance_degradation", "high",
          `Slow response detected: ${route} took ${latency}ms`, {
            route,
            method,
            latency,
            statusCode,
          });
      }

      return metricId;
    } catch (error) {
      console.error("Error recording performance metric:", error);
      throw error;
    }
  }

  // Trigger system alert
  async triggerAlert(
    type: SystemAlert["type"],
    severity: SystemAlert["severity"],
    message: string,
    data: any
  ): Promise<string> {
    try {
      const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date();

      const alert: SystemAlert = {
        id: alertId,
        type,
        severity,
        message,
        data,
        timestamp,
        resolved: false,
      };

      await db.collection("systemAlerts").doc(alertId).set(alert);

      console.warn(`Alert triggered: ${type} - ${message}`, data);
      return alertId;
    } catch (error) {
      console.error("Error triggering alert:", error);
      throw error;
    }
  }

  // Get analytics data
  async getAnalytics(timeRange: "24h" | "7d" | "30d" = "7d"): Promise<{
    dau: number;
    totalCoins: number;
    totalCo2Saved: number;
    ecoMindScore: number;
    kindnessIndex: number;
    errorCount: number;
    subscriptionCount: number;
    fraudAlerts: number;
    performance: {
      avgLatency: number;
      p95Latency: number;
      p99Latency: number;
    };
  }> {
    try {
      const now = new Date();
      const timeRangeMs = timeRange === "24h" ? 24 * 60 * 60 * 1000 :
        timeRange === "7d" ? 7 * 24 * 60 * 60 * 1000 :
          30 * 24 * 60 * 60 * 1000;
      const startDate = new Date(now.getTime() - timeRangeMs);

      // Get activity logs for DAU
      const activitySnapshot = await db.collection("activityLogs")
        .where("timestamp", ">=", startDate)
        .get();

      const uniqueUsers = new Set(activitySnapshot.docs.map((doc) => doc.data().userId));
      const dau = uniqueUsers.size;

      // Calculate total coins earned
      const totalCoins = activitySnapshot.docs
        .reduce((sum, doc) => sum + (doc.data().coinsEarned || 0), 0);

      // Calculate total CO₂ saved
      const totalCo2Saved = activitySnapshot.docs
        .reduce((sum, doc) => sum + (doc.data().co2Saved || 0), 0);

      // Get error count
      const errorSnapshot = await db.collection("errorLogs")
        .where("timestamp", ">=", startDate)
        .get();

      const errorCount = errorSnapshot.size;

      // Get performance metrics
      const perfSnapshot = await db.collection("perfMetrics")
        .where("timestamp", ">=", startDate)
        .get();

      const latencies = perfSnapshot.docs.map((doc) => doc.data().latency);
      const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
      const p95Latency = latencies.length > 0 ? latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)] : 0;
      const p99Latency = latencies.length > 0 ? latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.99)] : 0;

      // Get subscription count
      const subscriptionSnapshot = await db.collection("subscriptions")
        .where("status", "==", "active")
        .get();

      const subscriptionCount = subscriptionSnapshot.size;

      // Get fraud alerts count
      const fraudSnapshot = await db.collection("fraudAlerts")
        .where("createdAt", ">=", startDate)
        .get();

      const fraudAlerts = fraudSnapshot.size;

      return {
        dau,
        totalCoins,
        totalCo2Saved,
        ecoMindScore: 75, // Placeholder - would be calculated from mood logs
        kindnessIndex: 80, // Placeholder - would be calculated from animal welfare logs
        errorCount,
        subscriptionCount,
        fraudAlerts,
        performance: {
          avgLatency,
          p95Latency,
          p99Latency,
        },
      };
    } catch (error) {
      console.error("Error getting analytics:", error);
      throw error;
    }
  }

  // Check for CO₂ drop alert
  async checkCo2Drop(): Promise<void> {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Get CO₂ saved for current week
      const currentWeekSnapshot = await db.collection("activityLogs")
        .where("timestamp", ">=", weekAgo)
        .where("co2Saved", ">", 0)
        .get();

      const currentWeekCo2 = currentWeekSnapshot.docs
        .reduce((sum, doc) => sum + (doc.data().co2Saved || 0), 0);

      // Get CO₂ saved for previous week
      const previousWeekSnapshot = await db.collection("activityLogs")
        .where("timestamp", ">=", twoWeeksAgo)
        .where("timestamp", "<", weekAgo)
        .where("co2Saved", ">", 0)
        .get();

      const previousWeekCo2 = previousWeekSnapshot.docs
        .reduce((sum, doc) => sum + (doc.data().co2Saved || 0), 0);

      if (previousWeekCo2 > 0) {
        const dropPercentage = ((previousWeekCo2 - currentWeekCo2) / previousWeekCo2) * 100;

        if (dropPercentage > 10) {
          await this.triggerAlert("co2_drop", "high",
            `CO₂ savings dropped by ${dropPercentage.toFixed(1)}% compared to last week`, {
              currentWeekCo2,
              previousWeekCo2,
              dropPercentage,
            });
        }
      }
    } catch (error) {
      console.error("Error checking CO₂ drop:", error);
    }
  }

  // Check for webhook failures
  async checkWebhookFailures(): Promise<void> {
    try {
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Check for webhook-related errors in the last hour
      const webhookErrorsSnapshot = await db.collection("errorLogs")
        .where("timestamp", ">=", hourAgo)
        .where("module", "==", "webhooks")
        .get();

      if (webhookErrorsSnapshot.size > 5) { // More than 5 webhook errors in an hour
        await this.triggerAlert("webhook_failure", "high",
          `${webhookErrorsSnapshot.size} webhook failures detected in the last hour`, {
            errorCount: webhookErrorsSnapshot.size,
            timeRange: "1 hour",
          });
      }
    } catch (error) {
      console.error("Error checking webhook failures:", error);
    }
  }

  // Check for system downtime
  async checkDowntime(): Promise<void> {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      // Check if there are any successful requests in the last 5 minutes
      const recentRequestsSnapshot = await db.collection("perfMetrics")
        .where("timestamp", ">=", fiveMinutesAgo)
        .where("statusCode", ">=", 200)
        .where("statusCode", "<", 300)
        .get();

      if (recentRequestsSnapshot.empty) {
        await this.triggerAlert("downtime", "critical",
          "No successful requests detected in the last 5 minutes", {
            lastSuccessfulRequest: fiveMinutesAgo,
          });
      }
    } catch (error) {
      console.error("Error checking downtime:", error);
    }
  }

  // Run all health checks
  async runHealthChecks(): Promise<void> {
    try {
      await Promise.all([
        this.checkCo2Drop(),
        this.checkWebhookFailures(),
        this.checkDowntime(),
      ]);
    } catch (error) {
      console.error("Error running health checks:", error);
    }
  }
}

// Export singleton instance
export const loggingService = LoggingService.getInstance();
export default loggingService;
