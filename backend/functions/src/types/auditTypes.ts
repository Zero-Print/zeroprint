// Remove unused import - types available in index.ts
// import { AuditAction } from './index';

// This interface is used for the function parameter
export interface AuditLogData {
  auditId?: string; // Make auditId optional in the parameter
  action: string;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  details?: any;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}
