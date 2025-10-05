import * as functions from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";

export * from "./citizenDashboard";
export * from "./governmentDashboard";
export * from "./entityDashboard";

interface DashboardDataRequest {
  dashboardType: string;
  timeframe?: string;
}

// Main dashboard data endpoint
export const getDashboardData = functions.https.onCall(
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

      const {dashboardType, timeframe = "week"} = request.data;
      const userId = request.auth.uid;

      if (!dashboardType) {
        throw new HttpsError(
          "invalid-argument",
          "Dashboard type is required"
        );
      }

      let dashboardData;

      switch (dashboardType) {
      case "citizen":
        dashboardData = await getCitizenDashboardData(userId, timeframe);
        break;
      case "government":
        dashboardData = await getGovernmentDashboardData(userId, timeframe);
        break;
      case "entity":
        dashboardData = await getEntityDashboardData(userId, timeframe);
        break;
      default:
        throw new HttpsError(
          "invalid-argument",
          "Invalid dashboard type"
        );
      }

      return {success: true, data: dashboardData};
    } catch (error) {
      console.error("Dashboard data error:", error);
      throw new HttpsError(
        "internal",
        "Error retrieving dashboard data"
      );
    }
  });

// Helper functions
async function getCitizenDashboardData(userId: string, timeframe: string) {
  // Implementation would fetch real data from Firestore
  return {
    carbonFootprint: {
      current: 125.5,
      previous: 145.2,
      change: -13.6,
    },
    waterUsage: {
      current: 320,
      previous: 350,
      change: -8.6,
    },
    energyConsumption: {
      current: 210,
      previous: 230,
      change: -8.7,
    },
    healCoins: {
      balance: 450,
      earned: 75,
      spent: 25,
    },
    activities: [
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
    ],
    leaderboard: [
      {userId: "user1", name: "John Doe", points: 1250},
      {userId: "user2", name: "Jane Smith", points: 1150},
      {userId: "user3", name: "Alex Johnson", points: 1050},
    ],
  };
}

async function getGovernmentDashboardData(userId: string, timeframe: string) {
  // Implementation would fetch real data from Firestore
  return {
    cityStats: {
      totalUsers: 12500,
      activeUsers: 8750,
      totalEntities: 450,
      carbonReduction: 25600,
    },
    wardData: [
      {wardId: "ward1", name: "North Ward", carbonReduction: 5600, activeUsers: 2100},
      {wardId: "ward2", name: "South Ward", carbonReduction: 6200, activeUsers: 2300},
      {wardId: "ward3", name: "East Ward", carbonReduction: 4800, activeUsers: 1800},
      {wardId: "ward4", name: "West Ward", carbonReduction: 9000, activeUsers: 2550},
    ],
    topPerformers: {
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
    },
    campaigns: [
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
    ],
  };
}

async function getEntityDashboardData(userId: string, timeframe: string) {
  // Implementation would fetch real data from Firestore
  return {
    entityStats: {
      employees: 120,
      activeUsers: 95,
      carbonReduction: 12500,
      ranking: 3,
    },
    departmentData: [
      {deptId: "dept1", name: "Operations", carbonReduction: 4500, activeUsers: 35},
      {deptId: "dept2", name: "Administration", carbonReduction: 3200, activeUsers: 25},
      {deptId: "dept3", name: "Sales", carbonReduction: 2800, activeUsers: 20},
      {deptId: "dept4", name: "IT", carbonReduction: 2000, activeUsers: 15},
    ],
    topPerformers: [
      {userId: "user1", name: "John Doe", department: "Operations", points: 850},
      {userId: "user2", name: "Jane Smith", department: "IT", points: 780},
      {userId: "user3", name: "Alex Johnson", department: "Sales", points: 720},
    ],
    initiatives: [
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
    ],
  };
}
