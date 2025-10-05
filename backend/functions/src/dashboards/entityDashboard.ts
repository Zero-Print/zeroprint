import * as functions from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";

interface EntityDashboardDataRequest {
  timeframe?: string;
}

export const getEntityDashboardData = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<EntityDashboardDataRequest>) => {
    try {
      // Validate auth
      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "Authentication required"
        );
      }

      const {timeframe = "week"} = request.data;
      const userId = request.auth.uid;

      // Get user data to verify entity role
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "User not found"
        );
      }

      const userData = userDoc.data();
      if (!["school", "msme", "admin"].includes(userData?.role)) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Requires entity access"
        );
      }

      // Get entity stats
      const entityStats = await getEntityStats(userId, timeframe);

      // Get department data
      const departmentData = await getDepartmentData(userId, timeframe);

      // Get top performers
      const topPerformers = await getEntityTopPerformers(userId, timeframe);

      // Get initiatives
      const initiatives = await getEntityInitiatives(userId, timeframe);

      return {
        entityStats,
        departmentData,
        topPerformers,
        initiatives,
      };
    } catch (error) {
      console.error("Entity dashboard error:", error);
      throw new HttpsError(
        "internal",
        "Error retrieving entity dashboard data"
      );
    }
  }
);

// Helper functions
async function getEntityStats(userId: string, timeframe: string) {
  // This would fetch real data from Firestore in production
  // For now, returning mock data
  return {
    employees: 120,
    activeUsers: 95,
    carbonReduction: 12500,
    ranking: 3,
  };
}

async function getDepartmentData(userId: string, timeframe: string) {
  // This would fetch real data from Firestore in production
  // For now, returning mock data
  return [
    {deptId: "dept1", name: "Operations", carbonReduction: 4500, activeUsers: 35},
    {deptId: "dept2", name: "Administration", carbonReduction: 3200, activeUsers: 25},
    {deptId: "dept3", name: "Sales", carbonReduction: 2800, activeUsers: 20},
    {deptId: "dept4", name: "IT", carbonReduction: 2000, activeUsers: 15},
  ];
}

async function getEntityTopPerformers(userId: string, timeframe: string) {
  // This would fetch real data from Firestore in production
  // For now, returning mock data
  return [
    {userId: "user1", name: "John Doe", department: "Operations", points: 850},
    {userId: "user2", name: "Jane Smith", department: "IT", points: 780},
    {userId: "user3", name: "Alex Johnson", department: "Sales", points: 720},
  ];
}

async function getEntityInitiatives(userId: string, timeframe: string) {
  // This would fetch real data from Firestore in production
  // For now, returning mock data
  return [
    {
      id: "initiative1",
      name: "Paperless Office",
      participants: 85,
      carbonReduction: 1200,
      status: "active",
    },
    {
      id: "initiative2",
      name: "Remote Work",
      participants: 65,
      carbonReduction: 950,
      status: "active",
    },
  ];
}
