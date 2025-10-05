import {db} from "../lib/firebase";
import {
  User,
  UserRole,
  Wallet,
  Transaction,
  SubscriptionPlanData,
  Subscription,
  Game,
  AuditLog, ActivityLog} from "../types";
import type {CarbonLog} from "../types";

export class DataSeeder {
  async seedAllData() {
    console.log("Starting data seeding...");

    try {
      await Promise.all([
        this.seedUsers(),
        this.seedSubscriptionPlans(),
        this.seedGames(),
        this.seedMockLogs(),
      ]);

      // Seed user-specific data after users are created
      await this.seedWallets();
      await this.seedUserSubscriptions();
      await this.seedTrackerData();

      console.log("Data seeding completed successfully!");
    } catch (error) {
      console.error("Data seeding failed:", error);
      throw error;
    }
  }

  private async seedUsers() {
    console.log("Seeding users...");

    const users: User[] = [
      {
        userId: "user_citizen_1",
        email: "citizen@example.com",
        name: "Eco Citizen",
        role: "citizen" as UserRole,
        createdAt: new Date("2024-01-15").toISOString(),
      },
      {
        userId: "user_school_1",
        email: "school@example.com",
        name: "Green Valley School",
        role: "school" as UserRole,
        createdAt: new Date("2024-01-10").toISOString(),
      },
      {
        userId: "user_msme_1",
        email: "msme@example.com",
        name: "EcoTech Solutions",
        role: "msme" as UserRole,
        createdAt: new Date("2024-01-05").toISOString(),
      },
      {
        userId: "user_govt_1",
        email: "govt@example.com",
        name: "Municipal Corporation",
        role: "govt" as UserRole,
        createdAt: new Date("2024-01-01").toISOString(),
      },
    ];

    const batch = db.batch();
    users.forEach((user) => {
      const userRef = db.collection("users").doc(user.userId);
      batch.set(userRef, user);
    });

    await batch.commit();
    console.log(`Seeded ${users.length} users`);
  }

  private async seedWallets() {
    console.log("Seeding wallets...");

    const wallets: Wallet[] = [
      {
        walletId: "user_citizen_1",
        id: "user_citizen_1",
        entityId: "user_citizen_1",
        userId: "user_citizen_1",
        inrBalance: 500,
        healCoins: 1250,
        totalEarned: 1250,
        totalRedeemed: 0,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date("2024-01-15").toISOString(),
        updatedAt: new Date("2024-01-15").toISOString(),
        isActive: true,
      },
      {
        walletId: "user_school_1",
        id: "user_school_1",
        entityId: "user_school_1",
        userId: "user_school_1",
        inrBalance: 2000,
        healCoins: 2500,
        totalEarned: 2500,
        totalRedeemed: 0,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date("2024-01-10").toISOString(),
        updatedAt: new Date("2024-01-10").toISOString(),
        isActive: true,
      },
      {
        walletId: "user_msme_1",
        id: "user_msme_1",
        entityId: "user_msme_1",
        userId: "user_msme_1",
        inrBalance: 5000,
        healCoins: 3200,
        totalEarned: 3200,
        totalRedeemed: 0,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date("2024-01-05").toISOString(),
        updatedAt: new Date("2024-01-05").toISOString(),
        isActive: true,
      },
    ];

    // Seed transactions
    const transactions: Transaction[] = [
      {
        id: "txn_001",
        transactionId: "txn_001",
        userId: "user_citizen_1",
        type: "inr_credit",
        amount: 100,
        currency: "INR",
        description: "Initial wallet credit",
        status: "completed",
        createdAt: new Date("2024-01-15").toISOString(),
        updatedAt: new Date("2024-01-15").toISOString(),
      },
      {
        id: "txn_002",
        transactionId: "txn_002",
        userId: "user_citizen_1",
        type: "healcoin_credit",
        amount: 50,
        currency: "HEAL",
        description: "Carbon tracking reward",
        status: "completed",
        createdAt: new Date("2024-01-16").toISOString(),
        updatedAt: new Date("2024-01-16").toISOString(),
      },
      {
        id: "txn_003",
        transactionId: "txn_003",
        userId: "user_citizen_1",
        type: "healcoin_credit",
        amount: 25,
        currency: "HEAL",
        description: "Eco quiz completion",
        status: "completed",
        createdAt: new Date("2024-01-17").toISOString(),
        updatedAt: new Date("2024-01-17").toISOString(),
      },
    ];

    const batch = db.batch();

    wallets.forEach((wallet) => {
      const walletRef = db.collection("wallets").doc(wallet.walletId);
      batch.set(walletRef, wallet);
    });

    transactions.forEach((transaction) => {
      const txnRef = db.collection("transactions").doc(transaction.id);
      batch.set(txnRef, transaction);
    });

    await batch.commit();
    console.log(`Seeded ${wallets.length} wallets and ${transactions.length} transactions`);
  }

  private async seedSubscriptionPlans() {
    console.log("Seeding subscription plans...");

    const plans: SubscriptionPlanData[] = [
      {
        planId: "basic",
        name: "Basic",
        description: "Perfect for individuals starting their sustainability journey",
        price: 99,
        currency: "INR",
        duration: "monthly",
        features: [
          "Carbon tracking",
          "Basic dashboard",
          "Monthly reports",
          "Community access",
        ],
        isActive: true,
        createdAt: new Date("2023-12-01").toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        planId: "premium",
        name: "Premium",
        description: "Advanced features for serious eco-warriors",
        price: 299,
        currency: "INR",
        duration: "monthly",
        features: [
          "All Basic features",
          "Advanced analytics",
          "Priority support",
          "Custom goals",
          "API access",
        ],
        isActive: true,
        createdAt: new Date("2023-12-01").toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        planId: "enterprise",
        name: "Enterprise",
        description: "Complete solution for organizations",
        price: 999,
        currency: "INR",
        duration: "monthly",
        features: [
          "All Premium features",
          "White-label solution",
          "Dedicated support",
          "Custom integrations",
          "Advanced reporting",
        ],
        isActive: true,
        createdAt: new Date("2023-12-01").toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const batch = db.batch();
    plans.forEach((plan) => {
      const planRef = db.collection("subscriptionPlans").doc(plan.planId);
      batch.set(planRef, plan);
    });

    await batch.commit();
    console.log(`Seeded ${plans.length} subscription plans`);
  }

  private async seedUserSubscriptions() {
    console.log("Seeding user subscriptions...");

    const subscriptions: Subscription[] = [
      {
        subscriptionId: "sub_001",
        userId: "user_school_1",
        plan: "school",
        status: "active",
        startDate: new Date("2024-01-10").toISOString(),
        endDate: new Date("2024-02-10").toISOString(),
        createdAt: new Date("2024-01-10").toISOString(),
      } as any,
      {
        subscriptionId: "sub_002",
        userId: "user_msme_1",
        plan: "msme",
        status: "active",
        startDate: new Date("2024-01-05").toISOString(),
        endDate: new Date("2024-02-05").toISOString(),
        createdAt: new Date("2024-01-05").toISOString(),
      } as any,
    ];

    const batch = db.batch();
    subscriptions.forEach((subscription) => {
      const subRef = db.collection("subscriptions").doc(subscription.subscriptionId);
      batch.set(subRef, subscription);
    });

    await batch.commit();
    console.log(`Seeded ${subscriptions.length} user subscriptions`);
  }

  private async seedGames() {
    console.log("Seeding games...");

    const now = new Date().toISOString();
    const games: Game[] = [
      {gameId: "rooftop-solar-builder", title: "Rooftop Solar Builder", description: "Design and install solar panels to maximize energy.", category: "solar", type: "dragdrop", coins: 15, maxScore: 100, estimatedTime: 900, isActive: true, createdAt: now, updatedAt: now} as any,
      {gameId: "solar-vs-grid-showdown", title: "Solar vs Grid Showdown", description: "Compare cost and CO₂ of solar vs grid.", category: "solar", type: "simulation", coins: 10, maxScore: 100, estimatedTime: 600, isActive: true, createdAt: now, updatedAt: now} as any,
      {gameId: "city-clean-air-race", title: "City Clean Air Race", description: "Improve air quality via policies and tech.", category: "city", type: "simulation", coins: 25, maxScore: 200, estimatedTime: 1800, isActive: true, createdAt: now, updatedAt: now} as any,
      {gameId: "electric-bus-rush", title: "Electric Bus Rush", description: "Replace diesel buses with EVs.", category: "transport", type: "simulation", coins: 20, maxScore: 150, estimatedTime: 1200, isActive: true, createdAt: now, updatedAt: now} as any,
      {gameId: "bin-sorter-master", title: "Bin Sorter Master", description: "Sort waste items into correct bins.", category: "waste", type: "dragdrop", coins: 10, maxScore: 100, estimatedTime: 480, isActive: true, createdAt: now, updatedAt: now} as any,
      {gameId: "commute-footprint-calculator", title: "Commute Footprint Calculator", description: "Calculate and optimize commute CO₂.", category: "transport", type: "simulation", coins: 12, maxScore: 100, estimatedTime: 600, isActive: true, createdAt: now, updatedAt: now} as any,
      {gameId: "fix-the-leak", title: "Fix the Leak", description: "Find and fix energy leaks in buildings.", category: "energy", type: "dragdrop", coins: 18, maxScore: 120, estimatedTime: 900, isActive: true, createdAt: now, updatedAt: now} as any,
      {gameId: "smart-city-quiz", title: "Smart City Quiz", description: "Test sustainable city knowledge.", category: "city", type: "quiz", coins: 15, maxScore: 100, estimatedTime: 600, isActive: true, createdAt: now, updatedAt: now} as any,
    ];

    const batch = db.batch();
    games.forEach((game) => {
      const gameRef = db.collection("games").doc(game.gameId);
      batch.set(gameRef, game);
    });

    await batch.commit();
    console.log(`Seeded ${games.length} games (8 MVP)`);
  }

  private async seedTrackerData() {
    console.log("Seeding tracker data...");

    const carbonLogs: CarbonLog[] = [
      {
        id: "carbon_001",
        userId: "user_citizen_1",
        categoryId: "transport",
        action: "bike_ride",
        co2Saved: 5.2,
        quantity: 10,
        unit: "km",
        timestamp: new Date("2024-01-16").toISOString(),
        createdAt: new Date("2024-01-16").toISOString(),
        updatedAt: new Date("2024-01-16").toISOString(),
      },
      {
        id: "carbon_002",
        userId: "user_citizen_1",
        categoryId: "energy",
        action: "solar_panel",
        co2Saved: 3.8,
        quantity: 15,
        unit: "kWh",
        timestamp: new Date("2024-01-17").toISOString(),
        createdAt: new Date("2024-01-17").toISOString(),
        updatedAt: new Date("2024-01-17").toISOString(),
      },
      {
        id: "carbon_003",
        userId: "user_school_1",
        categoryId: "waste",
        action: "recycling",
        co2Saved: 15.5,
        quantity: 25,
        unit: "kg",
        timestamp: new Date("2024-01-15").toISOString(),
        createdAt: new Date("2024-01-15").toISOString(),
        updatedAt: new Date("2024-01-15").toISOString(),
      },
    ];

    const batch = db.batch();

    carbonLogs.forEach((log) => {
      const logRef = db.collection("carbonLogs").doc(log.id);
      batch.set(logRef, log);
    });

    await batch.commit();
    console.log(`Seeded ${carbonLogs.length} carbon logs`);
  }

  private async seedMockLogs() {
    console.log("Seeding mock logs...");

    const auditLogs: AuditLog[] = [
      {
        logId: "audit_001",
        type: "wallet",
        action: "user_created",
        userId: "user_citizen_1",
        data: {email: "citizen@example.com", role: "citizen"},
        createdAt: new Date("2024-01-15").toISOString(),
      } as any,
      {
        logId: "audit_002",
        type: "wallet",
        action: "transaction_created",
        userId: "user_citizen_1",
        data: {transactionId: "txn_001", type: "inr_credit", amount: 100},
        createdAt: new Date("2024-01-15").toISOString(),
      } as any,
      {
        logId: "audit_003",
        type: "subscription",
        action: "subscription_created",
        userId: "user_school_1",
        data: {planId: "premium", amount: 299},
        createdAt: new Date("2024-01-10").toISOString(),
      } as any,
    ];

    const activityLogs: ActivityLog[] = [
      {
        logId: "activity_001",
        userId: "user_citizen_1",
        action: "account_created",
        details: {type: "account_created"},
        timestamp: new Date("2024-01-15").toISOString(),
      } as any,
      {
        logId: "activity_002",
        userId: "user_citizen_1",
        action: "carbon_log_added",
        details: {type: "carbon_log_added", actionType: "transport", carbonSaved: 5.2},
        timestamp: new Date("2024-01-16").toISOString(),
      } as any,
      {
        logId: "activity_003",
        userId: "user_citizen_1",
        action: "game_completed",
        details: {type: "game_completed", gameId: "eco-quiz", score: 85},
        timestamp: new Date("2024-01-17").toISOString(),
      } as any,
    ];

    const batch = db.batch();

    auditLogs.forEach((log) => {
      const id = log.logId || `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const logRef = db.collection("auditLogs").doc(id);
      batch.set(logRef, log);
    });

    activityLogs.forEach((log) => {
      const id = log.logId || `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const logRef = db.collection("activityLogs").doc(id);
      batch.set(logRef, log);
    });

    await batch.commit();
    console.log(`Seeded ${auditLogs.length} audit logs and ${activityLogs.length} activity logs`);
  }
}

// Export function to run seeding
export const seedDatabase = async () => {
  const seeder = new DataSeeder();
  await seeder.seedAllData();
};

// CLI script to run seeding
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Database seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database seeding failed:", error);
      process.exit(1);
    });
}
