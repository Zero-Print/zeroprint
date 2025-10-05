import * as functions from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";

interface GovernmentDashboardDataRequest {
  timeframe?: string;
}

export const getGovernmentDashboardData = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<GovernmentDashboardDataRequest>) => {
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

      // Get user data to verify government role
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "User not found"
        );
      }

      const userData = userDoc.data();
      if (userData?.role !== "government" && userData?.role !== "admin") {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Requires government access"
        );
      }

      // Get city stats
      const cityStats = await getCityStats(timeframe);

      // Get ward data
      const wardData = await getWardData(timeframe);

      // Get top performers
      const topPerformers = await getTopPerformers(timeframe);

      // Get campaigns
      const campaigns = await getCampaigns(timeframe);

      return {
        cityStats,
        wardData,
        topPerformers,
        campaigns,
      };
    } catch (error) {
      console.error("Government dashboard error:", error);
      throw new HttpsError(
        "internal",
        "Error retrieving government dashboard data"
      );
    }
  }
);

// Helper functions
async function getCityStats(timeframe: string) {
  // This would fetch real data from Firestore in production
  // For now, returning mock data
  return {
    totalUsers: 12500,
    activeUsers: 8750,
    totalEntities: 450,
    carbonReduction: 25600,
  };
}

async function getWardData(timeframe: string) {
  // This would fetch real data from Firestore in production
  // For now, returning mock data
  return [
    {wardId: "ward1", name: "North Ward", carbonReduction: 5600, activeUsers: 2100},
    {wardId: "ward2", name: "South Ward", carbonReduction: 6200, activeUsers: 2300},
    {wardId: "ward3", name: "East Ward", carbonReduction: 4800, activeUsers: 1800},
    {wardId: "ward4", name: "West Ward", carbonReduction: 9000, activeUsers: 2550},
  ];
}

async function getTopPerformers(timeframe: string) {
  // This would fetch real data from Firestore in production
  // For now, returning mock data
  return {
    citizens: [
      {userId: "user1", name: "John Doe", points: 1250},
      {userId: "user2", name: "Jane Smith", points: 1150},
      {userId: "user3", name: "Alex Johnson", points: 1050},
    ],
    entities: [
      {entityId: "entity1", name: "Green Corp", points: 5250},
      {entityId: "entity2", name: "Eco Solutions", points: 4800},
      {entityId: "entity3", name: "Sustainable Tech", points: 4500},
    ],
  };
}

async function getCampaigns(timeframe: string) {
  // This would fetch real data from Firestore in production
  // For now, returning mock data
  return [
    {
      id: "campaign1",
      name: "Plant a Tree",
      participants: 1250,
      carbonReduction: 2500,
      status: "active",
    },
    {
      id: "campaign2",
      name: "Cycle to Work",
      participants: 850,
      carbonReduction: 1800,
      status: "active",
    },
  ];
}
