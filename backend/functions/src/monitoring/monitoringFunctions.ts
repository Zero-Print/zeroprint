import * as functions from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {logAudit} from "../lib/auditService";

type UserActivityReq = { userId: string; action: string; details?: any };
type SystemErrorReq = { module: string; errorType: string; message: string; stackTrace?: string; userId?: string; severity?: "low"|"medium"|"high"|"critical" };
type PerfMetricReq = { metricType: string; value: number; context?: any };
type FraudAlertReq = { userId?: string; action: string; reason: string; metadata?: any };
type AnalyticsReq = { timeRange: "24h"|"7d"|"30d" };

export const logUserActivityFn = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<UserActivityReq>) => {
    const {userId, action, details} = request.data || {} as any;
    if (!userId || !action) throw new HttpsError("invalid-argument", "userId and action are required");
    const logId = `act_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await db.collection("activityLogs").doc(logId).set({
      logId,
      userId,
      action,
      details: details || {},
      timestamp: new Date().toISOString(),
    });
    // Cross-link to audit for sensitive events (optional)
    if (["earnCoins", "redeemCoins", "subscriptionUpdated", "paymentProcessed"].includes(action)) {
      await logAudit(`ACT_${action}`, userId, logId, {}, details || {}, "MonitoringService");
    }
    return {success: true, logId};
  }
);

export const logSystemError = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<SystemErrorReq>) => {
    const {module, errorType, message, stackTrace, userId, severity} = request.data || {} as any;
    if (!module || !errorType || !message) throw new HttpsError("invalid-argument", "module, errorType, message required");
    const errorId = `err_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await db.collection("errorLogs").doc(errorId).set({
      errorId, module, errorType, message, stackTrace: stackTrace || "", userId: userId || null,
      severity: severity || "medium", timestamp: new Date().toISOString(),
    });
    if (severity === "high" || severity === "critical") {
      await sendAlert(`Error: ${module}/${errorType} - ${message}`);
    }
    return {success: true, errorId};
  }
);

export const recordPerfMetric = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<PerfMetricReq>) => {
    const {metricType, value, context} = request.data || {} as any;
    if (!metricType || typeof value !== "number") throw new HttpsError("invalid-argument", "metricType and numeric value required");
    const metricId = `pm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await db.collection("perfMetrics").doc(metricId).set({metricId, metricType, value, context: context || {}, timestamp: new Date().toISOString()});
    return {success: true, metricId};
  }
);

export const triggerFraudAlert = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<FraudAlertReq>) => {
    const {userId, action, reason, metadata} = request.data || {} as any;
    if (!action || !reason) throw new HttpsError("invalid-argument", "action and reason required");
    const alertId = `fraud_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await db.collection("fraudAlerts").doc(alertId).set({alertId, userId: userId || null, action, reason, metadata: metadata || {}, timestamp: new Date().toISOString()});
    await sendAlert(`Fraud Alert: ${action} - ${reason}`);
    return {success: true, alertId};
  }
);

export const generateAnalyticsReport = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<AnalyticsReq>) => {
    const {timeRange} = request.data || {timeRange: "7d"} as any;
    const since = new Date();
    if (timeRange === "24h") since.setDate(since.getDate() - 1);
    else if (timeRange === "7d") since.setDate(since.getDate() - 7);
    else since.setDate(since.getDate() - 30);

    const [acts, errors, metrics] = await Promise.all([
      db.collection("activityLogs").where("timestamp", ">=", since.toISOString()).get(),
      db.collection("errorLogs").where("timestamp", ">=", since.toISOString()).get(),
      db.collection("perfMetrics").where("timestamp", ">=", since.toISOString()).get(),
    ]);

    const summary = {
      dau: new Set(acts.docs.map((d) => (d.data() as any).userId).filter(Boolean)).size,
      actionsCount: acts.size,
      errorsCount: errors.size,
      avgPerfByType: {} as Record<string, number>,
    };
    const perfByType: Record<string, { sum: number; n: number }> = {};
    metrics.forEach((m) => {
      const d = m.data() as any;
      const key = d.metricType;
      if (!perfByType[key]) perfByType[key] = {sum: 0, n: 0};
      perfByType[key].sum += Number(d.value) || 0;
      perfByType[key].n += 1;
    });
    Object.keys(perfByType).forEach((k) => summary.avgPerfByType[k] = Math.round((perfByType[k].sum / perfByType[k].n) * 100) / 100);

    return {success: true, data: summary};
  }
);

export const exportAnalyticsReport = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ timeRange: "24h"|"7d"|"30d"; format?: "csv"|"pdf" }>) => {
    const {timeRange = "7d", format = "csv"} = request.data || {} as any;
    const result = await (generateAnalyticsReport as any)({data: {timeRange}});
    const payload = (result?.data) || {};
    if (format === "csv") {
      const rows = [["metric", "value"]];
      rows.push(["dau", String(payload.dau || 0)]);
      rows.push(["actionsCount", String(payload.actionsCount || 0)]);
      rows.push(["errorsCount", String(payload.errorsCount || 0)]);
      if (payload.avgPerfByType) {
        Object.keys(payload.avgPerfByType).forEach((k) => rows.push([`perf_${k}`, String(payload.avgPerfByType[k])]));
      }
      const csv = rows.map((r) => r.join(",")).join("\n");
      return {success: true, format, data: csv};
    }
    // Simple PDF stub (string payload); in production return a signed URL
    const content = `Analytics Report (${timeRange})\n\n` + JSON.stringify(payload, null, 2);
    return {success: true, format, data: content};
  }
);

async function sendAlert(message: string): Promise<void> {
  try {
    const webhook = process.env.SLACK_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
    if (!webhook) return;
    await fetch(webhook, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({text: message, content: message})});
  } catch (e) {
    console.error("sendAlert failed", e);
  }
}


