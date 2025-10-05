/**
 * Scheduled Health Checks
 * Runs periodic health checks and monitoring
 */

import * as functions from "firebase-functions/v2";
import {loggingService} from "../services/loggingService";

// Run health checks every 5 minutes
export const healthCheckScheduler = functions.scheduler.onSchedule(
  "*/5 * * * *", // Every 5 minutes
  async (event) => {
    console.log("Running scheduled health checks...");

    try {
      await loggingService.runHealthChecks();
      console.log("Health checks completed successfully");
    } catch (error) {
      console.error("Health checks failed:", error);

      // Log the error
      await loggingService.logError(
        "scheduler",
        "HealthCheckError",
        "Scheduled health checks failed",
        error instanceof Error ? error.stack : undefined,
        undefined,
        "high",
        {scheduler: "healthCheckScheduler"}
      );
    }
  }
);

// Run analytics aggregation every hour
export const analyticsAggregator = functions.scheduler.onSchedule(
  "0 * * * *", // Every hour
  async (event) => {
    console.log("Running analytics aggregation...");

    try {
      // Get analytics for different time ranges
      const [daily, weekly, monthly] = await Promise.all([
        loggingService.getAnalytics("24h"),
        loggingService.getAnalytics("7d"),
        loggingService.getAnalytics("30d"),
      ]);

      // Log analytics summary
      await loggingService.logActivity(
        "system",
        "analytics_aggregated",
        {
          daily: {
            dau: daily.dau,
            totalCoins: daily.totalCoins,
            totalCo2Saved: daily.totalCo2Saved,
            errorCount: daily.errorCount,
          },
          weekly: {
            dau: weekly.dau,
            totalCoins: weekly.totalCoins,
            totalCo2Saved: weekly.totalCo2Saved,
            errorCount: weekly.errorCount,
          },
          monthly: {
            dau: monthly.dau,
            totalCoins: monthly.totalCoins,
            totalCo2Saved: monthly.totalCo2Saved,
            errorCount: monthly.errorCount,
          },
        },
        "analytics"
      );

      console.log("Analytics aggregation completed successfully");
    } catch (error) {
      console.error("Analytics aggregation failed:", error);

      await loggingService.logError(
        "scheduler",
        "AnalyticsAggregationError",
        "Scheduled analytics aggregation failed",
        error instanceof Error ? error.stack : undefined,
        undefined,
        "medium",
        {scheduler: "analyticsAggregator"}
      );
    }
  }
);

// Clean up old logs every day at 2 AM
export const logCleanupScheduler = functions.scheduler.onSchedule(
  "0 2 * * *", // Daily at 2 AM
  async (event) => {
    console.log("Running log cleanup...");

    try {
      const db = (await import("../lib/firebase")).db;
      const now = new Date();

      // Keep logs for different periods
      const retentionPeriods = {
        errorLogs: 30, // 30 days
        activityLogs: 90, // 90 days
        auditLogs: 365, // 1 year (never delete audit logs in production)
        perfMetrics: 7, // 7 days
        systemAlerts: 30, // 30 days
      };

      for (const [collection, days] of Object.entries(retentionPeriods)) {
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const oldLogs = await db.collection(collection)
          .where("timestamp", "<", cutoffDate)
          .limit(1000) // Process in batches
          .get();

        if (!oldLogs.empty) {
          const batch = db.batch();
          oldLogs.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });
          await batch.commit();

          console.log(`Cleaned up ${oldLogs.size} old ${collection} logs`);

          await loggingService.logActivity(
            "system",
            "log_cleanup",
            {
              collection,
              deletedCount: oldLogs.size,
              cutoffDate: cutoffDate.toISOString(),
            },
            "maintenance"
          );
        }
      }

      console.log("Log cleanup completed successfully");
    } catch (error) {
      console.error("Log cleanup failed:", error);

      await loggingService.logError(
        "scheduler",
        "LogCleanupError",
        "Scheduled log cleanup failed",
        error instanceof Error ? error.stack : undefined,
        undefined,
        "medium",
        {scheduler: "logCleanupScheduler"}
      );
    }
  }
);
