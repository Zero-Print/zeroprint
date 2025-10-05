// ZeroPrint Logging System - Audit & Activity Logs
// Comprehensive logging for compliance and monitoring

import { auditLogsCollection, activityLogsCollection } from './collections';
import { AuditLog, ActivityLog } from '../../types';

// ============================================================================
// AUDIT LOGGING (Compliance - Prompt J)
// ============================================================================

export interface AuditLogData {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export const auditLogger = {
  // Wallet operations
  async logWalletTransaction(data: {
    userId: string;
    transactionId: string;
    type: 'earn' | 'spend' | 'transfer' | 'refund';
    amount: number;
    description: string;
    ipAddress?: string;
  }) {
    return auditLogsCollection.create({
      userId: data.userId,
      action: `wallet_${data.type}`,
      resource: 'wallet',
      resourceId: data.transactionId,
      details: {
        amount: data.amount,
        description: data.description,
        transactionType: data.type
      },
      ipAddress: data.ipAddress,
      severity: 'info',
      category: 'financial'
    });
  },

  // User management
  async logUserAction(data: {
    adminUserId: string;
    targetUserId: string;
    action: 'create' | 'update' | 'suspend' | 'activate' | 'delete';
    changes?: Record<string, any>;
    reason?: string;
    ipAddress?: string;
  }) {
    return auditLogsCollection.create({
      userId: data.adminUserId,
      action: `user_${data.action}`,
      resource: 'user',
      resourceId: data.targetUserId,
      details: {
        changes: data.changes,
        reason: data.reason,
        targetUserId: data.targetUserId
      },
      ipAddress: data.ipAddress,
      severity: data.action === 'delete' || data.action === 'suspend' ? 'high' : 'medium',
      category: 'user_management'
    });
  },

  // Data access
  async logDataAccess(data: {
    userId: string;
    resource: string;
    resourceId?: string;
    action: 'read' | 'export' | 'download';
    details?: Record<string, any>;
    ipAddress?: string;
  }) {
    return auditLogsCollection.create({
      userId: data.userId,
      action: `data_${data.action}`,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details,
      ipAddress: data.ipAddress,
      severity: 'low',
      category: 'data_access'
    });
  },

  // System configuration changes
  async logConfigChange(data: {
    adminUserId: string;
    configKey: string;
    oldValue: any;
    newValue: any;
    reason?: string;
    ipAddress?: string;
  }) {
    return auditLogsCollection.create({
      userId: data.adminUserId,
      action: 'config_update',
      resource: 'admin_config',
      resourceId: data.configKey,
      details: {
        configKey: data.configKey,
        oldValue: data.oldValue,
        newValue: data.newValue,
        reason: data.reason
      },
      ipAddress: data.ipAddress,
      severity: 'high',
      category: 'system_config'
    });
  },

  // ESG report generation
  async logESGReport(data: {
    userId: string;
    entityId: string;
    entityType: 'school' | 'msme';
    reportType: 'monthly' | 'quarterly' | 'annual';
    reportId: string;
    ipAddress?: string;
  }) {
    return auditLogsCollection.create({
      userId: data.userId,
      action: 'esg_report_generated',
      resource: 'esg_report',
      resourceId: data.reportId,
      details: {
        entityId: data.entityId,
        entityType: data.entityType,
        reportType: data.reportType
      },
      ipAddress: data.ipAddress,
      severity: 'medium',
      category: 'reporting'
    });
  },

  // Bulk operations
  async logBulkOperation(data: {
    adminUserId: string;
    operation: string;
    targetCount: number;
    successCount: number;
    failureCount: number;
    details?: Record<string, any>;
    ipAddress?: string;
  }) {
    return auditLogsCollection.create({
      userId: data.adminUserId,
      action: `bulk_${data.operation}`,
      resource: 'bulk_operation',
      details: {
        operation: data.operation,
        targetCount: data.targetCount,
        successCount: data.successCount,
        failureCount: data.failureCount,
        ...data.details
      },
      ipAddress: data.ipAddress,
      severity: data.failureCount > 0 ? 'medium' : 'low',
      category: 'bulk_operation'
    });
  }
};

// ============================================================================
// ACTIVITY LOGGING (Monitoring - Prompt L)
// ============================================================================

export interface ActivityLogData {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  duration?: number;
  success?: boolean;
  errorMessage?: string;
}

export const activityLogger = {
  // User engagement tracking
  async logUserActivity(data: {
    userId: string;
    action: 'login' | 'logout' | 'page_view' | 'feature_use';
    resource: string;
    metadata?: Record<string, any>;
    duration?: number;
  }) {
    return activityLogsCollection.create({
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      metadata: data.metadata,
      duration: data.duration,
      success: true,
      category: 'user_engagement'
    });
  },

  // Tracker activities
  async logTrackerActivity(data: {
    userId: string;
    trackerType: 'carbon' | 'mental_health' | 'animal_welfare' | 'digital_twin';
    action: 'log_entry' | 'view_stats' | 'export_data';
    logId?: string;
    metadata?: Record<string, any>;
  }) {
    return activityLogsCollection.create({
      userId: data.userId,
      action: `tracker_${data.action}`,
      resource: `${data.trackerType}_tracker`,
      resourceId: data.logId,
      metadata: data.metadata,
      success: true,
      category: 'tracker_activity'
    });
  },

  // Game activities
  async logGameActivity(data: {
    userId: string;
    gameId: string;
    action: 'start' | 'complete' | 'quit' | 'score_update';
    score?: number;
    duration?: number;
    metadata?: Record<string, any>;
  }) {
    return activityLogsCollection.create({
      userId: data.userId,
      action: `game_${data.action}`,
      resource: 'game',
      resourceId: data.gameId,
      metadata: {
        score: data.score,
        ...data.metadata
      },
      duration: data.duration,
      success: true,
      category: 'game_activity'
    });
  },

  // Dashboard interactions
  async logDashboardActivity(data: {
    userId: string;
    dashboardType: 'citizen' | 'entity' | 'government' | 'admin';
    action: 'view' | 'export' | 'filter' | 'drill_down';
    resource: string;
    metadata?: Record<string, any>;
    duration?: number;
  }) {
    return activityLogsCollection.create({
      userId: data.userId,
      action: `dashboard_${data.action}`,
      resource: `${data.dashboardType}_dashboard`,
      metadata: {
        dashboardType: data.dashboardType,
        targetResource: data.resource,
        ...data.metadata
      },
      duration: data.duration,
      success: true,
      category: 'dashboard_activity'
    });
  },

  // API performance monitoring
  async logAPICall(data: {
    userId?: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    statusCode: number;
    duration: number;
    errorMessage?: string;
    metadata?: Record<string, any>;
  }) {
    return activityLogsCollection.create({
      userId: data.userId || 'system',
      action: 'api_call',
      resource: 'api_endpoint',
      resourceId: `${data.method}_${data.endpoint}`,
      metadata: {
        endpoint: data.endpoint,
        method: data.method,
        statusCode: data.statusCode,
        ...data.metadata
      },
      duration: data.duration,
      success: data.statusCode < 400,
      errorMessage: data.errorMessage,
      category: 'api_performance'
    });
  },

  // Error tracking
  async logError(data: {
    userId?: string;
    action: string;
    resource: string;
    errorMessage: string;
    errorStack?: string;
    metadata?: Record<string, any>;
  }) {
    return activityLogsCollection.create({
      userId: data.userId || 'system',
      action: data.action,
      resource: data.resource,
      metadata: {
        errorStack: data.errorStack,
        ...data.metadata
      },
      success: false,
      errorMessage: data.errorMessage,
      category: 'error'
    });
  },

  // System health monitoring
  async logSystemHealth(data: {
    metric: string;
    value: number;
    threshold?: number;
    status: 'healthy' | 'warning' | 'critical';
    metadata?: Record<string, any>;
  }) {
    return activityLogsCollection.create({
      userId: 'system',
      action: 'health_check',
      resource: 'system_metric',
      resourceId: data.metric,
      metadata: {
        metric: data.metric,
        value: data.value,
        threshold: data.threshold,
        status: data.status,
        ...data.metadata
      },
      success: data.status === 'healthy',
      category: 'system_health'
    });
  }
};

// ============================================================================
// LOGGING MIDDLEWARE & HELPERS
// ============================================================================

// Decorator for automatic audit logging
export function auditLog(action: string, resource: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let success = true;
      let errorMessage: string | undefined;

      try {
        const result = await method.apply(this, args);
        
        // Log successful operation
        await activityLogger.logAPICall({
          endpoint: `${target.constructor.name}.${propertyName}`,
          method: 'POST',
          statusCode: 200,
          duration: Date.now() - startTime,
          metadata: { action, resource }
        });

        return result;
      } catch (error) {
        success = false;
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Log failed operation
        await activityLogger.logError({
          action: `${action}_failed`,
          resource,
          errorMessage,
          errorStack: error instanceof Error ? error.stack : undefined,
          metadata: { method: propertyName, args: args.length }
        });

        throw error;
      }
    };
  };
}

// Helper to log user actions with both audit and activity logs
export async function logUserAction(data: {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  duration?: number;
  requiresAudit?: boolean;
}) {
  const promises = [];

  // Always log activity
  promises.push(
    activityLogger.logUserActivity({
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      metadata: data.details,
      duration: data.duration
    })
  );

  // Log audit if required (financial, user management, config changes)
  if (data.requiresAudit) {
    promises.push(
      auditLogsCollection.create({
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details,
        ipAddress: data.ipAddress,
        severity: 'medium',
        category: 'user_action'
      })
    );
  }

  await Promise.all(promises);
}

// Export logging utilities
export const loggingUtils = {
  auditLogger,
  activityLogger,
  logUserAction,
  auditLog
};