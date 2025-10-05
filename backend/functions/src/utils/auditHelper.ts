import {v4 as uuidv4} from "uuid";
import {AuditLog} from "../types";

/**
 * Creates an audit log data object with a generated auditId
 * @param data Partial audit log data without auditId
 * @returns Complete audit log data with auditId
 */
export function createAuditData(data: Omit<AuditLog, "auditId">): AuditLog {
  return {
    ...data,
    auditId: `${data.action}_${data.resourceType || "resource"}_${uuidv4()}`,
  };
}
