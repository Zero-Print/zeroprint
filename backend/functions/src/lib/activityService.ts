/**
 * Activity Service
 * Tracks user activities for analytics and monitoring
 */

import {firestore} from "firebase-admin";

const db = firestore();

export interface UserActivity {
  userId: string;
  action: string;
  category?: string; // make optional for legacy calls
  details?: Record<string, any>;
  timestamp?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ActivityLog {
  activityId: string;
  userId: string;
  action: string;
  category: string;
  details?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

/**
 * Log user activity
 */
export async function logUserActivity(activity: UserActivity): Promise<string> {
  try {
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const activityLog: any = {
      activityId,
      userId: activity.userId,
      action: activity.action,
      category: activity.category || "general",
      details: activity.details,
      timestamp: activity.timestamp || timestamp,
      createdAt: timestamp,
    };

    // Only add optional fields if they exist
    if (activity.ipAddress) {
      activityLog.ipAddress = activity.ipAddress;
    }
    if (activity.userAgent) {
      activityLog.userAgent = activity.userAgent;
    }

    await db.collection("activityLogs").doc(activityId).set(activityLog);

    console.log(`User activity logged: ${activity.action}`, {activityId, userId: activity.userId});

    return activityId;
  } catch (error) {
    console.error("Failed to log user activity:", error);
    throw error;
  }
}

/**
 * Get user activities
 */
export async function getUserActivities(
  userId: string,
  filters: {
    action?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}
): Promise<ActivityLog[]> {
  try {
    let queryRef: FirebaseFirestore.Query = db.collection("activityLogs")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc");

    if (filters.action) {
      queryRef = queryRef.where("action", "==", filters.action);
    }
    if (filters.category) {
      queryRef = queryRef.where("category", "==", filters.category);
    }
    if (filters.startDate) {
      queryRef = queryRef.where("createdAt", ">=", filters.startDate);
    }
    if (filters.endDate) {
      queryRef = queryRef.where("createdAt", "<=", filters.endDate);
    }

    if (filters.limit) {
      queryRef = queryRef.limit(filters.limit);
    }

    const snapshot = await queryRef.get();
    return snapshot.docs.map((doc) => doc.data() as ActivityLog);
  } catch (error) {
    console.error("Failed to get user activities:", error);
    throw error;
  }
}

/**
 * Get activity analytics
 */
export async function getActivityAnalytics(
  filters: {
    userId?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<{
  totalActivities: number;
  topActions: Array<{ action: string; count: number }>;
  categoriesDistribution: Record<string, number>;
  dailyActivity: Array<{ date: string; count: number }>;
}> {
  try {
    let queryRef: FirebaseFirestore.Query = db.collection("activityLogs");

    if (filters.userId) {
      queryRef = queryRef.where("userId", "==", filters.userId);
    }
    if (filters.category) {
      queryRef = queryRef.where("category", "==", filters.category);
    }
    if (filters.startDate) {
      queryRef = queryRef.where("createdAt", ">=", filters.startDate);
    }
    if (filters.endDate) {
      queryRef = queryRef.where("createdAt", "<=", filters.endDate);
    }

    const snapshot = await queryRef.get();
    const activities = snapshot.docs.map((doc) => doc.data() as ActivityLog);

    // Process analytics
    const analytics = {
      totalActivities: activities.length,
      topActions: [] as Array<{ action: string; count: number }>,
      categoriesDistribution: {} as Record<string, number>,
      dailyActivity: [] as Array<{ date: string; count: number }>,
    };

    // Count actions
    const actionCounts: Record<string, number> = {};
    activities.forEach((activity) => {
      actionCounts[activity.action] = (actionCounts[activity.action] || 0) + 1;
      analytics.categoriesDistribution[activity.category] =
        (analytics.categoriesDistribution[activity.category] || 0) + 1;
    });

    // Top actions
    analytics.topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({action, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Daily activity (last 30 days)
    const dailyCounts: Record<string, number> = {};
    activities.forEach((activity) => {
      const date = activity.createdAt.split("T")[0]; // Get date part
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    analytics.dailyActivity = Object.entries(dailyCounts)
      .map(([date, count]) => ({date, count}))
      .sort((a, b) => a.date.localeCompare(b.date));

    return analytics;
  } catch (error) {
    console.error("Failed to get activity analytics:", error);
    throw error;
  }
}
