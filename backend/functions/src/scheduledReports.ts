import * as admin from "firebase-admin";
import {onSchedule} from "firebase-functions/v2/scheduler";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Generate weekly government report with key metrics
 */
const generateWeeklyReport = async () => {
  const db = admin.firestore();
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  // Get all wards
  const wardsSnapshot = await db.collection("wards").get();
  const wards = wardsSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

  // Aggregate metrics for each ward
  const wardMetrics = await Promise.all(wards.map(async (ward) => {
    // Get users in this ward
    const usersSnapshot = await db.collection("users")
      .where("wardId", "==", ward.id)
      .get();
    const users = usersSnapshot.docs.map((doc) => doc.data());

    // Get activities in the last week
    const activitiesSnapshot = await db.collection("activities")
      .where("wardId", "==", ward.id)
      .where("timestamp", ">=", oneWeekAgo)
      .get();
    const activities = activitiesSnapshot.docs.map((doc) => doc.data());

    // Calculate metrics
    const totalUsers = users.length;
    const activeUsers = new Set(activities.map((a) => a.userId)).size;
    const totalCo2Saved = activities.reduce((sum, a) => sum + (a.co2Saved || 0), 0);
    const totalHealCoins = activities.reduce((sum, a) => sum + (a.healCoins || 0), 0);

    return {
      wardId: ward.id,
      wardName: (ward as any).name || "Unknown Ward",
      totalUsers,
      activeUsers,
      activePercentage: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
      totalCo2Saved,
      totalHealCoins,
      timestamp: now,
    };
  }));
  // Generate city-wide summary
  const citySummary = {
    totalWards: wards.length,
    totalUsers: wardMetrics.reduce((sum, w) => sum + w.totalUsers, 0),
    activeUsers: wardMetrics.reduce((sum, w) => sum + w.activeUsers, 0),
    totalCo2Saved: wardMetrics.reduce((sum, w) => sum + w.totalCo2Saved, 0),
    totalHealCoins: wardMetrics.reduce((sum, w) => sum + w.totalHealCoins, 0),
    timestamp: now,
  };
  // Store report in Firestore
  const reportRef = db.collection("reports").doc(`weekly_${now.toISOString().split("T")[0]}`);
  await reportRef.set({
    type: "government_weekly",
    citySummary,
    wardMetrics,
    generatedAt: now,
  });
  return {
    reportId: reportRef.id,
    citySummary,
    wardMetrics,
  };
};

/**
 * Email the report to government officials
 */
const emailReport = async (report: any, email: string) => {
  // In a real implementation, this would use a service like SendGrid or Mailgun
  console.log(`Sending report ${report.reportId} to ${email}`);

  // Store email delivery record
  const db = admin.firestore();
  await db.collection("reportDeliveries").add({
    reportId: report.reportId,
    recipient: email,
    sentAt: new Date(),
    status: "sent",
  });
  return true;
};

/**
 * Weekly government report scheduled function
 * Runs every Monday at 9 AM
 */
export const weeklyGovernmentReport = onSchedule(
  "0 9 * * 1", // Every Monday 9 AM
  async (event) => {
    const report = await generateWeeklyReport();
    await emailReport(report, "government@zeroprint.in");
  }
);

/**
 * Monthly ESG report for schools and MSMEs
 * Runs on the 1st of each month at 8 AM
 */
export const monthlyESGReport = onSchedule(
  "0 8 1 * *", // 1st day of month at 8 AM
  async (event) => {
    const db = admin.firestore();
    const now = new Date();
    // Get all schools and MSMEs
    const entitiesSnapshot = await db.collection("entities")
      .where("type", "in", ["school", "msme"])
      .get();

    const entities = entitiesSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

    // Generate and send reports for each entity
    for (const entity of entities) {
      // Generate ESG metrics
      const esgMetrics = {
        entityId: entity.id,
        entityName: (entity as any).name || "Unknown Entity",
        entityType: (entity as any).type || "unknown",
        month: now.getMonth(),
        year: now.getFullYear(),
        environmentalScore: Math.round(Math.random() * 40 + 60), // Mock data
        socialScore: Math.round(Math.random() * 30 + 70),
        governanceScore: Math.round(Math.random() * 20 + 80),
        timestamp: now,
      };

      // Store ESG report
      await db.collection("esgReports").add(esgMetrics);
      // Email report to entity admin
      const entityAdmin = entity as any;
      if (entityAdmin.adminEmail) {
        await emailReport({
          reportId: `esg_${entity.id}_${now.toISOString().split("T")[0]}`,
          esgMetrics,
        }, entityAdmin.adminEmail);
      }
    }

    // Remove return statement to fix Promise<void> requirement
  });

/**
 * Daily activity summary
 * Runs every day at midnight
 */
export const dailyActivitySummary = onSchedule(
  "0 0 * * *", // Every day at midnight
  async (event) => {
    const db = admin.firestore();
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get yesterday's activities
    const activitiesSnapshot = await db.collection("activities")
      .where("timestamp", ">=", yesterday)
      .where("timestamp", "<", now)
      .get();
    const activities = activitiesSnapshot.docs.map((doc) => doc.data());

    // Aggregate by activity type
    const activitySummary = activities.reduce((summary: any, activity: any) => {
      const type = activity.type || "unknown";
      if (!summary[type]) {
        summary[type] = {
          count: 0,
          co2Saved: 0,
          healCoins: 0,
        };
      }

      summary[type].count++;
      summary[type].co2Saved += (activity.co2Saved || 0);
      summary[type].healCoins += (activity.healCoins || 0);

      return summary;
    }, {});

    // Store daily summary
    await db.collection("activitySummaries").doc(yesterday.toISOString().split("T")[0]).set({
      date: yesterday,
      totalActivities: activities.length,
      activitySummary,
      generatedAt: now,
    });

    // Remove return statement to fix Promise<void> requirement
  });
