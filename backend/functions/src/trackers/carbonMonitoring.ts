import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {db} from "../lib/firebase";
import {logAudit} from "../lib/auditService";
import {CarbonLog} from "../types/trackers";

/**
 * Calculates the weekly CO₂ savings trend by comparing the current week's
 * total CO₂ savings with the previous week's total.
 *
 * @returns The percentage change in CO₂ savings (negative value indicates a drop)
 */
export const calculateWeeklyTrend = async (): Promise<{ drop: number, currentTotal: number, previousTotal: number }> => {
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - 7);

  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  // Query for current week's logs
  const currentWeekLogs = await db.collection("carbonLogs")
    .where("timestamp", ">=", currentWeekStart.toISOString())
    .where("timestamp", "<=", now.toISOString())
    .get();

  // Query for previous week's logs
  const previousWeekLogs = await db.collection("carbonLogs")
    .where("timestamp", ">=", previousWeekStart.toISOString())
    .where("timestamp", "<", currentWeekStart.toISOString())
    .get();

  // Calculate totals
  const currentWeekTotal = currentWeekLogs.docs.reduce(
    (total, doc) => total + (doc.data() as CarbonLog).co2Saved,
    0
  );

  const previousWeekTotal = previousWeekLogs.docs.reduce(
    (total, doc) => total + (doc.data() as CarbonLog).co2Saved,
    0
  );

  // Calculate percentage change
  let percentageChange = 0;
  if (previousWeekTotal > 0) {
    percentageChange = ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100;
  }

  return {
    drop: percentageChange < 0 ? Math.abs(percentageChange) : 0,
    currentTotal: currentWeekTotal,
    previousTotal: previousWeekTotal,
  };
};

/**
 * Sends an alert notification when CO₂ savings drop is detected
 *
 * @param message The alert message to send
 * @param data Additional data to include with the alert
 */
export const sendAlert = async (message: string, data?: any): Promise<void> => {
  // Create alert document
  await db.collection("alerts").add({
    type: "co2_drop",
    message,
    data,
    createdAt: new Date().toISOString(),
    status: "new",
  });

  // Log the alert in audit logs
  await logAudit(
    "co2_drop_alert_created",
    "system",
    "carbonLogs",
    {},
    {message, data},
    "carbonMonitoring"
  );

  // In a real implementation, this would also:
  // 1. Send push notifications to admin users
  // 2. Send emails to configured recipients
  // 3. Potentially trigger other notification systems
  console.log(`CO₂ Drop Alert: ${message}`, data);
};

/**
 * Cloud Function that monitors for significant drops in CO₂ savings
 * Triggers on creation of new carbon log entries
 */
export const monitorCO2Drop = onDocumentCreated(
  "carbonLogs/{logId}",
  async () => {
    try {
      const weeklyTrend = await calculateWeeklyTrend();

      // Alert if drop is greater than 10%
      if (weeklyTrend.drop > 10) {
        await sendAlert(
          `CO₂ savings dropped by ${weeklyTrend.drop.toFixed(1)}% compared to last week`,
          {
            currentWeekTotal: weeklyTrend.currentTotal,
            previousWeekTotal: weeklyTrend.previousTotal,
            dropPercentage: weeklyTrend.drop,
          }
        );

        return {success: true, alerted: true, trend: weeklyTrend};
      }

      return {success: true, alerted: false, trend: weeklyTrend};
    } catch (error) {
      console.error("Error in CO₂ drop monitoring:", error);
      return {success: false, error: (error as Error).message};
    }
  });
