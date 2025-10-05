import * as functions from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";

interface DashboardDataRequest {
  timeframe?: string;
}

export const getCitizenDashboardData = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<DashboardDataRequest>) => {
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

      // Get user data
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        throw new HttpsError(
          "not-found",
          "User not found"
        );
      }

      // Get carbon footprint data
      const carbonData = await getCarbonFootprintData(userId, timeframe);

      // Get water usage data
      const waterData = await getWaterUsageData(userId, timeframe);

      // Get energy consumption data
      const energyData = await getEnergyConsumptionData(userId, timeframe);

      // Get HealCoins data
      const healCoinsData = await getHealCoinsData(userId, timeframe);

      // Get activities
      const activities = await getUserActivities(userId, 10);

      // Get leaderboard
      const leaderboard = await getLeaderboard(10);

      return {
        carbonFootprint: carbonData,
        waterUsage: waterData,
        energyConsumption: energyData,
        healCoins: healCoinsData,
        activities,
        leaderboard,
      };
    } catch (error) {
      console.error("Citizen dashboard error:", error);
      throw new HttpsError(
        "internal",
        "Error retrieving citizen dashboard data"
      );
    }
  }
);

// Helper functions
async function getCarbonFootprintData(userId: string, timeframe: string) {
  // This would fetch real data from Firestore in production
  // For now, returning mock data
  return {
    current: 125.5,
    previous: 145.2,
    change: -13.6,
  };
}

async function getWaterUsageData(userId: string, timeframe: string) {
  // This would fetch real data from Firestore in production
  // For now, returning mock data
  return {
    current: 320,
    previous: 350,
    change: -8.6,
  };
}

async function getEnergyConsumptionData(userId: string, timeframe: string) {
  // This would fetch real data from Firestore in production
  // For now, returning mock data
  return {
    current: 210,
    previous: 230,
    change: -8.7,
  };
}

async function getHealCoinsData(userId: string, timeframe: string) {
  // This would fetch real data from Firestore in production
  // For now, returning mock data
  return {
    balance: 450,
    earned: 75,
    spent: 25,
  };
}

async function getUserActivities(userId: string, limit: number) {
  // This would fetch real data from Firestore in production
  // For now, returning mock data
  return [
    {
      id: "act1",
      type: "carbon_reduction",
      description: "Used public transport",
      points: 15,
      timestamp: new Date().toISOString(),
    },
    {
      id: "act2",
      type: "water_saving",
      description: "Installed water-efficient fixtures",
      points: 25,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

async function getLeaderboard(limit: number) {
  // This would fetch real data from Firestore in production
  // For now, returning mock data
  return [
    {userId: "user1", name: "John Doe", points: 1250},
    {userId: "user2", name: "Jane Smith", points: 1150},
    {userId: "user3", name: "Alex Johnson", points: 1050},
  ];
}
