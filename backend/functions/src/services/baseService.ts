/**
 * Base service class for all backend services
 * Isolates Firestore/Razorpay/Sentry work from handlers
 */

import {db} from "../lib/firebase";
import {logAudit, logUserActivity} from "../lib/auditService";
import {logSystemError} from "../lib/errorService";
// import { recordPerfMetric } from '../lib/loggingService';

export abstract class BaseService {
  protected db = db;

  /**
   * Log audit trail for sensitive operations
   */
  protected async logAudit(
    actionType: string,
    actorId: string,
    entityId: string,
    before: any,
    after: any,
    source: string
  ): Promise<void> {
    try {
      await logAudit(actionType, actorId, entityId, before, after, source);
    } catch (error) {
      console.error("Failed to log audit:", error);
      await this.logError("audit", "log_audit_failed", "Failed to log audit trail", error);
    }
  }

  /**
   * Log user activity for monitoring
   */
  protected async logActivity(
    userId: string,
    action: string,
    details: any,
    module: string
  ): Promise<void> {
    try {
      await logUserActivity(userId, action, details, module);
    } catch (error) {
      console.error("Failed to log activity:", error);
      await this.logError(module, "log_activity_failed", "Failed to log user activity", error);
    }
  }

  /**
   * Log system errors
   */
  protected async logError(
    module: string,
    errorType: string,
    message: string,
    error: any,
    userId?: string
  ): Promise<void> {
    try {
      await logSystemError(module, errorType, message, error, userId);
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
  }

  /**
   * Record performance metrics
   */
  protected async recordMetric(
    metricType: string,
    value: number,
    context: any,
    module: string
  ): Promise<void> {
    try {
      // TODO: Implement recordPerfMetric function
      console.log(`Metric: ${metricType} = ${value}`, {context, module});
    } catch (error) {
      console.error("Failed to record metric:", error);
    }
  }

  /**
   * Execute operation with performance tracking
   */
  protected async executeWithMetrics<T>(
    operation: () => Promise<T>,
    metricType: string,
    context: any,
    module: string
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      await this.recordMetric(metricType, duration, context, module);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.recordMetric(`${metricType}_error`, duration, context, module);
      throw error;
    }
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: any, fields: string[]): void {
    for (const field of fields) {
      if (data[field] === undefined || data[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  /**
   * Sanitize data for Firestore
   */
  protected sanitizeForFirestore(data: any): any {
    if (typeof data !== "object" || data === null) {
      return data;
    }

    const sanitized = {...data};

    // Remove undefined values
    Object.keys(sanitized).forEach((key) => {
      if (sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });

    // Convert Date objects to Firestore Timestamps
    Object.keys(sanitized).forEach((key) => {
      if (sanitized[key] instanceof Date) {
        sanitized[key] = (this.db as any).Timestamp.fromDate(sanitized[key]);
      }
    });

    return sanitized;
  }

  /**
   * Convert Firestore data to API response format
   */
  protected convertFromFirestore(data: any): any {
    if (!data) return data;

    const converted = {...data};

    // Convert Firestore Timestamps to Date objects
    Object.keys(converted).forEach((key) => {
      if (converted[key] && converted[key].toDate && typeof converted[key].toDate === "function") {
        converted[key] = converted[key].toDate();
      }
    });

    return converted;
  }
}
