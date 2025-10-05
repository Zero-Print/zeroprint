/**
 * Monitoring Service - isolates Firestore operations for monitoring and analytics
 */

import {BaseService} from "./baseService";
import {ActivityLog, ErrorLog, PerformanceMetric} from "../types/shared";
import {validateRequiredFields} from "../lib/validators";

export class MonitoringService extends BaseService {
  async logActivity(userId: string, action: string, details: any): Promise<void> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, action}, ["userId", "action"]);

        const activityLog: ActivityLog = {
          id: this.db.collection("activityLogs").doc().id,
          userId,
          action,
          details,
          module: (details as any)?.module || "unknown",
          coinsEarned: (details as any)?.coinsEarned,
          co2Saved: (details as any)?.co2Saved,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await this.db.collection("activityLogs").doc(activityLog.id).set(
          this.sanitizeForFirestore(activityLog)
        );
      },
      "monitoring_log_activity",
      {userId, action},
      "monitoring"
    );
  }

  async logError(module: string, errorType: string, message: string, stackTrace?: string, userId?: string): Promise<void> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({module: module || "unknown", errorType, message}, ["module", "errorType", "message"]);

        const errorLog: ErrorLog = {
          id: this.db.collection("errorLogs").doc().id,
          userId: userId || "",
          module: module || "unknown",
          errorType: errorType as "runtime" | "build" | "api" | "database" | "auth",
          message,
          stackTrace: stackTrace || "",
          severity: this.determineSeverity(errorType),
          resolved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await this.db.collection("errorLogs").doc(errorLog.id).set(
          this.sanitizeForFirestore(errorLog)
        );
      },
      "monitoring_log_error",
      {module, errorType},
      "monitoring"
    );
  }

  async recordMetric(metricType: string, value: number, context: any): Promise<void> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({metricType, value}, ["metricType", "value"]);

        const performanceMetric: PerformanceMetric = {
          id: this.db.collection("perfMetrics").doc().id,
          metricType,
          value,
          context,
          module: context.module || "unknown",
          percentile: context.percentile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await this.db.collection("perfMetrics").doc(performanceMetric.id).set(
          this.sanitizeForFirestore(performanceMetric)
        );
      },
      "monitoring_record_metric",
      {metricType, value},
      "monitoring"
    );
  }

  async getAnalytics(timeRange: string): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        const startDate = this.getStartDate(timeRange);

        // Get activity logs
        const activityLogs = await this.db
          .collection("activityLogs")
          .where("createdAt", ">=", startDate.toISOString())
          .get();

        // Get error logs
        const errorLogs = await this.db
          .collection("errorLogs")
          .where("createdAt", ">=", startDate.toISOString())
          .get();

        // Get performance metrics
        const perfMetrics = await this.db
          .collection("perfMetrics")
          .where("createdAt", ">=", startDate.toISOString())
          .get();

        // Calculate analytics
        const analytics = {
          totalActivities: activityLogs.size,
          totalErrors: errorLogs.size,
          avgResponseTime: this.calculateAvgResponseTime(perfMetrics.docs),
          errorRate: this.calculateErrorRate(activityLogs.docs, errorLogs.docs),
          topErrors: this.getTopErrors(errorLogs.docs),
          activityTrends: this.getActivityTrends(activityLogs.docs),
        };

        return analytics;
      },
      "monitoring_get_analytics",
      {timeRange},
      "monitoring"
    );
  }

  private determineSeverity(errorType: string): "low" | "medium" | "high" | "critical" {
    const criticalErrors = ["payment_failed", "auth_failed", "database_error"];
    const highErrors = ["api_error", "validation_error", "rate_limit_exceeded"];
    const mediumErrors = ["user_error", "config_error"];

    if (criticalErrors.includes(errorType)) return "critical";
    if (highErrors.includes(errorType)) return "high";
    if (mediumErrors.includes(errorType)) return "medium";
    return "low";
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

  private calculateAvgResponseTime(perfMetrics: any[]): number {
    const responseTimeMetrics = perfMetrics.filter((metric) =>
      metric.data().metricType === "response_time"
    );

    if (responseTimeMetrics.length === 0) return 0;

    const total = responseTimeMetrics.reduce((sum, metric) =>
      sum + metric.data().value, 0
    );

    return total / responseTimeMetrics.length;
  }

  private calculateErrorRate(activityLogs: any[], errorLogs: any[]): number {
    if (activityLogs.length === 0) return 0;
    return (errorLogs.length / activityLogs.length) * 100;
  }

  private getTopErrors(errorLogs: any[]): any[] {
    const errorCounts: Record<string, number> = {};

    errorLogs.forEach((log) => {
      const errorType = log.data().errorType;
      errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    });

    return Object.entries(errorCounts)
      .map(([errorType, count]) => ({errorType, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getActivityTrends(activityLogs: any[]): any[] {
    const trends: Record<string, number> = {};

    activityLogs.forEach((log) => {
      const action = log.data().action;
      trends[action] = (trends[action] || 0) + 1;
    });

    return Object.entries(trends)
      .map(([action, count]) => ({action, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}

export const monitoringService = new MonitoringService();
