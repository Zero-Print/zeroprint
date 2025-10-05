/**
 * Deployment Logs HTTP Handler
 * Handles deployment logging and monitoring
 */

import {Request, Response} from "express";
import {db} from "../../lib/firebase";
import {ApiResponse} from "../../lib/apiResponse";
// import { adminGuard } from '../../middleware/authGuard';
import {loggingService} from "../../services/loggingService";
import {logAudit} from "../../lib/auditService";

/**
 * Get deployment logs
 * GET /admin/deploy-logs
 */
export const getDeployLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const environment = req.query.environment as string;
    const status = req.query.status as string;

    let query = db.collection("deployLogs").orderBy("deployedAt", "desc");

    if (environment) {
      query = query.where("environment", "==", environment);
    }

    if (status) {
      query = query.where("status", "==", status);
    }

    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    const logsSnapshot = await query
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    const logs = logsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const pagination = {
      page,
      limit,
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };

    await loggingService.logActivity("admin", "Viewed Deploy Logs", {
      page,
      limit,
      environment,
      status,
    });

    res.json(ApiResponse.success({
      logs,
      pagination,
    }));
  } catch (error) {
    console.error("Error fetching deploy logs:", error);
    await loggingService.logError(
      "deployLogs",
      "GetDeployLogsError",
      "Failed to fetch deploy logs",
      error instanceof Error ? error.stack || "" : "",
      undefined
    );
    res.status(500).json(ApiResponse.error("Failed to fetch deploy logs"));
  }
};

/**
 * Get deployment log by ID
 * GET /admin/deploy-logs/:id
 */
export const getDeployLogById = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;

    const logDoc = await db.collection("deployLogs").doc(id).get();

    if (!logDoc.exists) {
      return res.status(404).json(ApiResponse.error("Deploy log not found", "404"));
    }

    const log = {
      id: logDoc.id,
      ...logDoc.data(),
    };

    await loggingService.logActivity("admin", "Viewed Deploy Log", {logId: id});

    return res.json(ApiResponse.success(log));
  } catch (error) {
    console.error("Error fetching deploy log:", error);
    await loggingService.logError(
      "deployLogs",
      "GetDeployLogByIdError",
      "Failed to fetch deploy log",
      error instanceof Error ? error.stack || "" : "",
      undefined
    );
    return res.status(500).json(ApiResponse.error("Failed to fetch deploy log"));
  }
};

/**
 * Create deployment log (called by CI/CD)
 * POST /admin/deploy-logs
 */
export const createDeployLog = async (req: Request, res: Response) => {
  try {
    const {
      version,
      environment,
      status,
      deployedBy,
      changes,
      commitHash,
      branch,
      buildNumber,
      duration,
      errorMessage,
      metadata,
    } = req.body;

    // Validate required fields
    if (!version || !environment || !status) {
      return res.status(400).json(ApiResponse.error("Missing required fields", "400"));
    }

    const deployLog = {
      version,
      environment,
      status,
      deployedBy: deployedBy || "system",
      changes: changes || [],
      commitHash: commitHash || "",
      branch: branch || "unknown",
      buildNumber: buildNumber || "",
      duration: duration || 0,
      errorMessage: errorMessage || null,
      metadata: metadata || {},
      deployedAt: new Date(),
      createdAt: new Date(),
    };

    const docRef = await db.collection("deployLogs").add(deployLog);

    await logAudit("DEPLOYMENT_CREATED", "system", docRef.id, null, {
      deployLogId: docRef.id,
      version,
      environment,
      status,
    }, "deployLogs");

    return res.status(201).json(ApiResponse.success({
      id: docRef.id,
      ...deployLog,
    }));
  } catch (error) {
    console.error("Error creating deploy log:", error);
    await loggingService.logError(
      "deployLogs",
      "CreateDeployLogError",
      "Failed to create deploy log",
      error instanceof Error ? error.stack : undefined
    );
    return res.status(500).json(ApiResponse.error("Failed to create deploy log"));
  }
};

/**
 * Update deployment log status
 * PUT /admin/deploy-logs/:id/status
 */
export const updateDeployLogStatus = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const {status, errorMessage, metadata} = req.body;

    if (!status) {
      return res.status(400).json(ApiResponse.error("Status is required", "400"));
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    if (metadata) {
      updateData.metadata = {...updateData.metadata, ...metadata};
    }

    await db.collection("deployLogs").doc(id).update(updateData);

    await logAudit("DEPLOYMENT_STATUS_UPDATED", "admin", id, null, {
      deployLogId: id,
      status,
      errorMessage,
    }, "deployLogs");

    return res.json(ApiResponse.success({
      id,
      status,
      updatedAt: updateData.updatedAt,
    }));
  } catch (error) {
    console.error("Error updating deploy log status:", error);
    await loggingService.logError(
      "deployLogs",
      "UpdateDeployLogStatusError",
      "Failed to update deploy log status",
      error instanceof Error ? error.stack : undefined
    );
    return res.status(500).json(ApiResponse.error("Failed to update deploy log status"));
  }
};

/**
 * Get deployment statistics
 * GET /admin/deploy-logs/stats
 */
export const getDeployStats = async (req: Request, res: Response) => {
  try {
    const timeRange = req.query.timeRange as string || "30d";
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const logsSnapshot = await db.collection("deployLogs")
      .where("deployedAt", ">=", startDate)
      .get();

    const logs = logsSnapshot.docs.map((doc) => doc.data());

    // Calculate statistics
    const totalDeployments = logs.length;
    const successfulDeployments = logs.filter((log) => log.status === "success").length;
    const failedDeployments = logs.filter((log) => log.status === "failed").length;
    const successRate = totalDeployments > 0 ? (successfulDeployments / totalDeployments) * 100 : 0;

    // Deployments by environment
    const envStats = logs.reduce((acc, log) => {
      acc[log.environment] = (acc[log.environment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Deployments by status
    const statusStats = logs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average deployment duration
    const avgDuration = logs
      .filter((log) => log.duration > 0)
      .reduce((sum, log) => sum + log.duration, 0) / logs.filter((log) => log.duration > 0).length || 0;

    // Recent deployments (last 10)
    const recentDeployments = logs
      .sort((a, b) => b.deployedAt.toDate().getTime() - a.deployedAt.toDate().getTime())
      .slice(0, 10)
      .map((log) => ({
        id: log.id,
        version: log.version,
        environment: log.environment,
        status: log.status,
        deployedAt: log.deployedAt.toDate().toISOString(),
        deployedBy: log.deployedBy,
      }));

    const stats = {
      totalDeployments,
      successfulDeployments,
      failedDeployments,
      successRate: Math.round(successRate * 100) / 100,
      avgDuration: Math.round(avgDuration),
      envStats,
      statusStats,
      recentDeployments,
      timeRange,
    };

    await loggingService.logActivity("admin", "Viewed Deploy Stats", {timeRange});

    return res.json(ApiResponse.success(stats));
  } catch (error) {
    console.error("Error fetching deploy stats:", error);
    await loggingService.logError(
      "deployLogs",
      "GetDeployStatsError",
      "Failed to fetch deploy stats",
      error instanceof Error ? error.stack : undefined
    );
    return res.status(500).json(ApiResponse.error("Failed to fetch deploy stats"));
  }
};

/**
 * Get deployment health
 * GET /admin/deploy-logs/health
 */
export const getDeployHealth = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get recent deployments
    const recentLogsSnapshot = await db.collection("deployLogs")
      .where("deployedAt", ">=", oneHourAgo)
      .get();

    const recentLogs = recentLogsSnapshot.docs.map((doc) => doc.data());

    // Get daily deployments
    const dailyLogsSnapshot = await db.collection("deployLogs")
      .where("deployedAt", ">=", oneDayAgo)
      .get();

    const dailyLogs = dailyLogsSnapshot.docs.map((doc) => doc.data());

    // Calculate health metrics
    const recentFailures = recentLogs.filter((log) => log.status === "failed").length;
    const dailyFailures = dailyLogs.filter((log) => log.status === "failed").length;
    const dailySuccesses = dailyLogs.filter((log) => log.status === "success").length;

    const health = {
      status: recentFailures > 0 ? "degraded" : "healthy",
      recentDeployments: recentLogs.length,
      recentFailures,
      dailyDeployments: dailyLogs.length,
      dailyFailures,
      dailySuccesses,
      lastDeployment: dailyLogs.length > 0 ?
        dailyLogs.sort((a, b) => b.deployedAt.toDate().getTime() - a.deployedAt.toDate().getTime())[0] :
        null,
      healthScore: dailyLogs.length > 0 ?
        Math.round((dailySuccesses / dailyLogs.length) * 100) :
        100,
    };

    return res.json(ApiResponse.success(health));
  } catch (error) {
    console.error("Error fetching deploy health:", error);
    await loggingService.logError(
      "deployLogs",
      "GetDeployHealthError",
      "Failed to fetch deploy health",
      error instanceof Error ? error.stack : undefined
    );
    return res.status(500).json(ApiResponse.error("Failed to fetch deploy health"));
  }
};

/**
 * Export deployment logs
 * GET /admin/deploy-logs/export
 */
export const exportDeployLogs = async (req: Request, res: Response) => {
  try {
    const format = req.query.format as string || "csv";
    const environment = req.query.environment as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let query = db.collection("deployLogs").orderBy("deployedAt", "desc");

    if (environment) {
      query = query.where("environment", "==", environment);
    }

    if (startDate) {
      query = query.where("deployedAt", ">=", new Date(startDate));
    }

    if (endDate) {
      query = query.where("deployedAt", "<=", new Date(endDate));
    }

    const logsSnapshot = await query.get();
    const logs = logsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    let exportData: string;
    let filename: string;
    let contentType: string;

    if (format === "csv") {
      exportData = convertToCSV(logs);
      filename = `deploy-logs-${new Date().toISOString().split("T")[0]}.csv`;
      contentType = "text/csv";
    } else {
      exportData = JSON.stringify(logs, null, 2);
      filename = `deploy-logs-${new Date().toISOString().split("T")[0]}.json`;
      contentType = "application/json";
    }

    await loggingService.logActivity("admin", "Exported Deploy Logs", {
      format,
      environment,
      count: logs.length,
    });

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(exportData);
  } catch (error) {
    console.error("Error exporting deploy logs:", error);
    await loggingService.logError(
      "deployLogs",
      "ExportDeployLogsError",
      "Failed to export deploy logs",
      error instanceof Error ? error.stack : undefined
    );
    return res.status(500).json(ApiResponse.error("Failed to export deploy logs"));
  }
};

/**
 * Convert logs to CSV format
 */
function convertToCSV(logs: any[]): string {
  if (logs.length === 0) return "";

  const headers = [
    "ID",
    "Version",
    "Environment",
    "Status",
    "Deployed By",
    "Deployed At",
    "Duration (ms)",
    "Branch",
    "Commit Hash",
    "Build Number",
    "Error Message",
    "Changes Count",
  ];

  const rows = logs.map((log) => [
    log.id,
    log.version,
    log.environment,
    log.status,
    log.deployedBy,
    log.deployedAt.toDate().toISOString(),
    log.duration || 0,
    log.branch || "",
    log.commitHash || "",
    log.buildNumber || "",
    log.errorMessage || "",
    log.changes ? log.changes.length : 0,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");

  return csvContent;
}
