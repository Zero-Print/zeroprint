/**
 * Monitoring HTTP Endpoints
 * Provides monitoring and analytics data
 */

import {Router, Request, Response} from "express";
import {db} from "../../lib/firebase";
import {loggingService} from "../../services/loggingService";
import {PerformanceMonitor, getSystemHealth} from "../../middleware/timing";
import {ApiResponse} from "../../lib/apiResponse";
import {authGuard, adminGuard} from "../../middleware/authGuard";

const router = Router();

// Apply auth guard to all monitoring routes
router.use(authGuard);

// GET /monitoring/health - System health check
router.get("/health", async (req: Request, res: Response) => {
  try {
    const health = getSystemHealth();

    // Determine overall health status
    const isHealthy = health.memory.heapUsed < 500 && // Less than 500MB heap
                     health.memory.rss < 1000 && // Less than 1GB RSS
                     health.uptime > 0; // Process is running

    res.json(ApiResponse.success({
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      ...health,
    }));
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json(ApiResponse.error("Health check failed", "HEALTH_CHECK_ERROR"));
  }
});

// GET /monitoring/analytics - Get analytics data
router.get("/analytics", async (req: Request, res: Response) => {
  try {
    const timeRange = req.query.timeRange as "24h" | "7d" | "30d" || "7d";
    const analytics = await loggingService.getAnalytics(timeRange);

    res.json(ApiResponse.success(analytics));
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json(ApiResponse.error("Failed to get analytics", "ANALYTICS_ERROR"));
  }
});

// GET /monitoring/performance - Get performance metrics
router.get("/performance", async (req: Request, res: Response) => {
  try {
    const metrics = PerformanceMonitor.getAllMetrics();

    res.json(ApiResponse.success({
      metrics,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Performance metrics error:", error);
    res.status(500).json(ApiResponse.error("Failed to get performance metrics", "PERFORMANCE_ERROR"));
  }
});

// GET /monitoring/errors - Get error logs (admin only)
router.get("/errors", adminGuard, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const severity = req.query.severity as string;
    const module = req.query.module as string;

    // Build query
    let query = db.collection("errorLogs").orderBy("timestamp", "desc");

    if (severity) {
      query = query.where("severity", "==", severity);
    }
    if (module) {
      query = query.where("module", "==", module);
    }

    // Get total count
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedQuery = query.offset(offset).limit(limit);
    const snapshot = await paginatedQuery.get();

    const errors = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(ApiResponse.paginated(errors, {
      page,
      limit,
      total,
      hasNext: offset + limit < total,
      hasPrev: page > 1,
    }));
  } catch (error) {
    console.error("Error logs error:", error);
    res.status(500).json(ApiResponse.error("Failed to get error logs", "ERROR_LOGS_ERROR"));
  }
});

// GET /monitoring/alerts - Get system alerts (admin only)
router.get("/alerts", adminGuard, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;
    const severity = req.query.severity as string;
    const resolved = req.query.resolved === "true";

    // Build query
    let query = db.collection("systemAlerts").orderBy("timestamp", "desc");

    if (type) {
      query = query.where("type", "==", type);
    }
    if (severity) {
      query = query.where("severity", "==", severity);
    }
    if (req.query.resolved !== undefined) {
      query = query.where("resolved", "==", resolved);
    }

    // Get total count
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedQuery = query.offset(offset).limit(limit);
    const snapshot = await paginatedQuery.get();

    const alerts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(ApiResponse.paginated(alerts, {
      page,
      limit,
      total,
      hasNext: offset + limit < total,
      hasPrev: page > 1,
    }));
  } catch (error) {
    console.error("Alerts error:", error);
    res.status(500).json(ApiResponse.error("Failed to get alerts", "ALERTS_ERROR"));
  }
});

// POST /monitoring/alert/:id/resolve - Resolve alert (admin only)
router.post("/alert/:id/resolve", adminGuard, async (req: Request, res: Response) => {
  try {
    const alertId = req.params.id;
    const adminId = req.user?.uid;

    if (!adminId) {
      return res.status(401).json(ApiResponse.error("Admin authentication required", "AUTH_REQUIRED"));
    }

    await db.collection("systemAlerts").doc(alertId).update({
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: adminId,
    });

    return res.json(ApiResponse.success({resolved: true}));
  } catch (error) {
    console.error("Resolve alert error:", error);
    return res.status(500).json(ApiResponse.error("Failed to resolve alert", "RESOLVE_ALERT_ERROR"));
  }
});

// POST /monitoring/health-checks - Run health checks (admin only)
router.post("/health-checks", adminGuard, async (req: Request, res: Response) => {
  try {
    await loggingService.runHealthChecks();

    res.json(ApiResponse.success({
      message: "Health checks completed",
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Health checks error:", error);
    res.status(500).json(ApiResponse.error("Failed to run health checks", "HEALTH_CHECKS_ERROR"));
  }
});

// GET /monitoring/export - Export monitoring data (admin only)
router.get("/export", adminGuard, async (req: Request, res: Response) => {
  try {
    const format = req.query.format as "csv" | "json" || "json";
    const timeRange = req.query.timeRange as "24h" | "7d" | "30d" || "7d";

    const analytics = await loggingService.getAnalytics(timeRange);
    const performance = PerformanceMonitor.getAllMetrics();

    const exportData = {
      analytics,
      performance,
      timestamp: new Date().toISOString(),
      timeRange,
    };

    if (format === "csv") {
      // Convert to CSV format
      const csv = convertToCSV(exportData);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=\"monitoring-data.csv\"");
      res.send(csv);
    } else {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=\"monitoring-data.json\"");
      res.json(exportData);
    }
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json(ApiResponse.error("Failed to export data", "EXPORT_ERROR"));
  }
});

// Helper function to convert data to CSV
function convertToCSV(data: any): string {
  const headers = Object.keys(data.analytics);
  const csvRows = [headers.join(",")];

  const values = headers.map((header) => {
    const value = data.analytics[header];
    return typeof value === "object" ? JSON.stringify(value) : value;
  });

  csvRows.push(values.join(","));

  return csvRows.join("\n");
}

export default router;
