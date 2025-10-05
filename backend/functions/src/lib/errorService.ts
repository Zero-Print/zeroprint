/**
 * Error Service
 * Handles error logging and system error tracking
 */

import {db} from "./firebase";

export interface ErrorLog {
  id: string;
  userId?: string;
  module: string;
  errorType: string;
  message: string;
  stackTrace?: string;
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Log error event (alias for logSystemError)
export const logErrorEvent = logSystemError;

// Log system error
export async function logSystemError(
  module: string,
  errorType: string,
  message: string,
  error?: Error,
  userId?: string,
  severity: "low" | "medium" | "high" | "critical" = "medium"
): Promise<string> {
  try {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();

    const errorLog: ErrorLog = {
      id: errorId,
      userId,
      module,
      errorType,
      message,
      stackTrace: error?.stack,
      severity,
      resolved: false,
      timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Store in Firestore
    await db.collection("errorLogs").doc(errorId).set(errorLog);

    // Log to console based on severity
    const logLevel = severity === "critical" ? "error" :
      severity === "high" ? "error" :
        severity === "medium" ? "warn" : "info";

    console[logLevel](`System error logged: ${errorType} in ${module} - ${message}`, error);

    return errorId;
  } catch (logError) {
    console.error("Error logging system error:", logError);
    throw logError;
  }
}

// Log performance metric
export async function recordPerfMetric(
  metricType: string,
  value: number,
  context: any = {},
  module: string = "system"
): Promise<string> {
  try {
    const metricId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();

    const perfMetric = {
      id: metricId,
      metricType,
      value,
      context,
      module,
      timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Store in Firestore
    await db.collection("perfMetrics").doc(metricId).set(perfMetric);

    console.log(`Performance metric recorded: ${metricType} = ${value} in ${module}`);
    return metricId;
  } catch (error) {
    console.error("Error recording performance metric:", error);
    throw error;
  }
}

// Get error logs with pagination
export async function getErrorLogs(
  filters: {
    module?: string;
    severity?: string;
    resolved?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
  } = {},
  page: number = 1,
  limit: number = 20
): Promise<{ data: ErrorLog[]; pagination: any }> {
  try {
    let query = db.collection("errorLogs").orderBy("timestamp", "desc");

    // Apply filters
    if (filters.module) {
      query = query.where("module", "==", filters.module);
    }
    if (filters.severity) {
      query = query.where("severity", "==", filters.severity);
    }
    if (filters.resolved !== undefined) {
      query = query.where("resolved", "==", filters.resolved);
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
    const data = snapshot.docs.map((doc) => doc.data() as ErrorLog);

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
  } catch (error) {
    console.error("Error getting error logs:", error);
    throw error;
  }
}

// Mark error as resolved
export async function resolveError(errorId: string, adminId: string): Promise<void> {
  try {
    await db.collection("errorLogs").doc(errorId).update({
      resolved: true,
      updatedAt: new Date(),
      resolvedBy: adminId,
      resolvedAt: new Date(),
    });

    console.log(`Error ${errorId} marked as resolved by ${adminId}`);
  } catch (error) {
    console.error("Error resolving error:", error);
    throw error;
  }
}

// Get error statistics
export async function getErrorStats(timeRange: "24h" | "7d" | "30d" = "7d"): Promise<{
  total: number;
  bySeverity: Record<string, number>;
  byModule: Record<string, number>;
  resolved: number;
  unresolved: number;
  trend: Array<{ date: string; count: number }>;
}> {
  try {
    const now = new Date();
    const timeRangeMs = timeRange === "24h" ? 24 * 60 * 60 * 1000 :
      timeRange === "7d" ? 7 * 24 * 60 * 60 * 1000 :
        30 * 24 * 60 * 60 * 1000;
    const startDate = new Date(now.getTime() - timeRangeMs);

    // Get all errors in time range
    const snapshot = await db.collection("errorLogs")
      .where("timestamp", ">=", startDate)
      .get();

    const errors = snapshot.docs.map((doc) => doc.data() as ErrorLog);

    // Calculate statistics
    const total = errors.length;
    const bySeverity = errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byModule = errors.reduce((acc, error) => {
      acc[error.module] = (acc[error.module] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resolved = errors.filter((error) => error.resolved).length;
    const unresolved = total - resolved;

    // Calculate daily trend
    const trendMap = new Map<string, number>();
    errors.forEach((error) => {
      const date = error.timestamp.toISOString().split("T")[0];
      trendMap.set(date, (trendMap.get(date) || 0) + 1);
    });

    const trend = Array.from(trendMap.entries())
      .map(([date, count]) => ({date, count}))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total,
      bySeverity,
      byModule,
      resolved,
      unresolved,
      trend,
    };
  } catch (error) {
    console.error("Error getting error statistics:", error);
    throw error;
  }
}
