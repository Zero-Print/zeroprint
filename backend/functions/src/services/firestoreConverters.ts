/**
 * Firestore Converters
 * Ensures type safety and proper data transformation between Firestore and TypeScript
 */

import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  FieldValue,
  WithFieldValue,
  DocumentReference,
  CollectionReference,
} from "firebase-admin/firestore";
import {
  User,
  Wallet,
  WalletTransaction,
  CarbonLog,
  MentalHealthLog,
  AnimalWelfareLog,
  DigitalTwinSimulation,
  MSMEReport,
  Game,
  GameScore,
  SubscriptionPlan,
  Subscription,
  Reward,
  Redemption,
  ActivityLog,
  AuditLog,
  ErrorLog,
  PerformanceMetric,
  DeploymentLog,
  Leaderboard,
  Achievement,
  NotificationTemplate,
  NotificationLog,
  PartnerConfig,
  WardGeoData,
  FraudAlert,
} from "../types/shared";

// Base converter interface
export interface FirestoreConverter<T> {
  toFirestore(data: WithFieldValue<T>): DocumentData;
  fromFirestore(snapshot: QueryDocumentSnapshot): T;
}

// Generic converter factory
export function createConverter<T>(
  toFirestore: (data: WithFieldValue<T>) => DocumentData,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => T
): FirestoreConverter<T> {
  return {toFirestore, fromFirestore};
}

// Helper functions for common conversions
const toTimestamp = (date: Date | Timestamp | string | FieldValue | undefined): Timestamp | undefined => {
  if (!date) return undefined;
  if (date instanceof Timestamp) return date;
  if (typeof date === "string") return Timestamp.fromDate(new Date(date));
  if (date instanceof Date) return Timestamp.fromDate(date);
  // Handle FieldValue case - return as is for server timestamps
  return date as Timestamp;
};

const fromTimestamp = (timestamp: Timestamp | undefined): Date | undefined => {
  if (!timestamp) return undefined;
  return timestamp.toDate();
};

// User Converter
export const userConverter: FirestoreConverter<User> = createConverter(
  (user: WithFieldValue<User>): DocumentData => ({
    ...user,
    createdAt: toTimestamp(user.createdAt),
    updatedAt: toTimestamp(user.updatedAt),
  }),
  (snapshot: QueryDocumentSnapshot): User => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      email: data.email || "",
      name: data.name || "",
      role: data.role || "citizen",
      profile: data.profile || {
        preferences: {
          theme: "system",
          language: "en",
        },
      },
      notifications: data.notifications || {
        email: true,
        sms: false,
        push: true,
      },
      isActive: data.isActive ?? true,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    };
  }
);

// Wallet Converter
export const walletConverter: FirestoreConverter<Wallet> = createConverter(
  (wallet: WithFieldValue<Wallet>): DocumentData => ({
    ...wallet,
    createdAt: toTimestamp(wallet.createdAt),
    updatedAt: toTimestamp(wallet.updatedAt),
    lastTransactionAt: toTimestamp(wallet.lastTransactionAt),
  }),
  (snapshot: QueryDocumentSnapshot): Wallet => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
      lastTransactionAt: fromTimestamp(data.lastTransactionAt),
    } as Wallet;
  }
);

// Wallet Transaction Converter
export const walletTransactionConverter: FirestoreConverter<WalletTransaction> = createConverter(
  (transaction: WithFieldValue<WalletTransaction>): DocumentData => ({
    ...transaction,
    createdAt: toTimestamp(transaction.createdAt),
    updatedAt: toTimestamp(transaction.updatedAt),
  }),
  (snapshot: QueryDocumentSnapshot): WalletTransaction => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    } as WalletTransaction;
  }
);

// Carbon Log Converter
export const carbonLogConverter: FirestoreConverter<CarbonLog> = createConverter(
  (log: WithFieldValue<CarbonLog>): DocumentData => ({
    ...log,
    createdAt: toTimestamp(log.createdAt),
    updatedAt: toTimestamp(log.updatedAt),
  }),
  (snapshot: QueryDocumentSnapshot): CarbonLog => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    } as CarbonLog;
  }
);

// Mental Health Log Converter
export const mentalHealthLogConverter: FirestoreConverter<MentalHealthLog> = createConverter(
  (log: WithFieldValue<MentalHealthLog>): DocumentData => ({
    ...log,
    createdAt: toTimestamp(log.createdAt),
    updatedAt: toTimestamp(log.updatedAt),
  }),
  (snapshot: QueryDocumentSnapshot): MentalHealthLog => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    } as MentalHealthLog;
  }
);

// Animal Welfare Log Converter
export const animalWelfareLogConverter: FirestoreConverter<AnimalWelfareLog> = createConverter(
  (log: WithFieldValue<AnimalWelfareLog>): DocumentData => ({
    ...log,
    createdAt: toTimestamp(log.createdAt),
    updatedAt: toTimestamp(log.updatedAt),
  }),
  (snapshot: QueryDocumentSnapshot): AnimalWelfareLog => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    } as AnimalWelfareLog;
  }
);

// Digital Twin Simulation Converter
export const digitalTwinSimulationConverter: FirestoreConverter<DigitalTwinSimulation> = createConverter(
  (simulation: WithFieldValue<DigitalTwinSimulation>): DocumentData => ({
    ...simulation,
    createdAt: toTimestamp(simulation.createdAt),
    updatedAt: toTimestamp(simulation.updatedAt),
  }),
  (snapshot: QueryDocumentSnapshot): DigitalTwinSimulation => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    } as DigitalTwinSimulation;
  }
);

// MSME Report Converter
export const msmeReportConverter: FirestoreConverter<MSMEReport> = createConverter(
  (report: WithFieldValue<MSMEReport>): DocumentData => ({
    ...report,
    createdAt: toTimestamp(report.createdAt),
    updatedAt: toTimestamp(report.updatedAt),
  }),
  (snapshot: QueryDocumentSnapshot): MSMEReport => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    } as MSMEReport;
  }
);

// Game Converter
export const gameConverter: FirestoreConverter<Game> = createConverter(
  (game: WithFieldValue<Game>): DocumentData => ({
    ...game,
    createdAt: toTimestamp(game.createdAt),
    updatedAt: toTimestamp(game.updatedAt),
  }),
  (snapshot: QueryDocumentSnapshot): Game => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name || data.title || "",
      title: data.title || "",
      description: data.description || "",
      category: data.category || "eco",
      type: data.type || "quiz",
      difficulty: data.difficulty || "easy",
      coinsReward: data.coinsReward || 0,
      maxCoins: data.maxCoins || data.coinsReward || 0,
      config: data.config || {},
      tags: data.tags || [],
      isActive: data.isActive ?? true,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    };
  }
);

// Game Score Converter
export const gameScoreConverter: FirestoreConverter<GameScore> = createConverter(
  (score: WithFieldValue<GameScore>): DocumentData => ({
    ...score,
    createdAt: toTimestamp(score.createdAt),
    completedAt: toTimestamp(score.completedAt),
  }),
  (snapshot: QueryDocumentSnapshot): GameScore => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId || "",
      gameId: data.gameId || "",
      gameName: data.gameName || "",
      score: data.score || 0,
      maxScore: data.maxScore || 100,
      timeSpent: data.timeSpent || 0,
      attempts: data.attempts || 1,
      coinsEarned: data.coinsEarned || 0,
      completedAt: fromTimestamp(data.completedAt)?.toISOString() || new Date().toISOString(),
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    };
  }
);

// Subscription Plan Converter
export const subscriptionPlanConverter: FirestoreConverter<SubscriptionPlan> = createConverter(
  (plan: WithFieldValue<SubscriptionPlan>): DocumentData => ({
    ...plan,
    createdAt: toTimestamp(plan.createdAt),
    updatedAt: toTimestamp(plan.updatedAt),
  }),
  (snapshot: QueryDocumentSnapshot): SubscriptionPlan => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    } as SubscriptionPlan;
  }
);

// Subscription Converter
export const subscriptionConverter: FirestoreConverter<Subscription> = createConverter(
  (subscription: WithFieldValue<Subscription>): DocumentData => ({
    ...subscription,
    createdAt: toTimestamp(subscription.createdAt),
    updatedAt: toTimestamp(subscription.updatedAt),
    startDate: toTimestamp(subscription.startDate as string),
    endDate: toTimestamp(subscription.endDate as string),
  }),
  (snapshot: QueryDocumentSnapshot): Subscription => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId || "",
      planId: data.planId || "",
      planName: data.planName || "",
      status: data.status || "active",
      amount: data.amount || 0,
      currency: data.currency || "INR",
      autoRenew: data.autoRenew ?? true,
      startDate: fromTimestamp(data.startDate)?.toISOString() || new Date().toISOString(),
      endDate: fromTimestamp(data.endDate)?.toISOString() || new Date().toISOString(),
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    };
  }
);

// Reward Converter
export const rewardConverter: FirestoreConverter<Reward> = createConverter(
  (reward: WithFieldValue<Reward>): DocumentData => ({
    ...reward,
    createdAt: toTimestamp(reward.createdAt),
  }),
  (snapshot: QueryDocumentSnapshot): Reward => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name || data.title || "",
      title: data.title || "",
      description: data.description || "",
      category: data.category || "digital",
      cost: data.cost || data.coinCost || 0,
      healCoinsCost: data.healCoinsCost || 0,
      stock: data.stock || 0,
      isActive: data.isActive ?? true,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    };
  }
);

// Redemption Converter
export const redemptionConverter: FirestoreConverter<Redemption> = createConverter(
  (redemption: WithFieldValue<Redemption>): DocumentData => ({
    ...redemption,
    createdAt: toTimestamp(redemption.createdAt),
    updatedAt: toTimestamp(redemption.updatedAt),
  }),
  (snapshot: QueryDocumentSnapshot): Redemption => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId || "",
      rewardId: data.rewardId || "",
      rewardName: data.rewardName || "",
      cost: data.cost || 0,
      quantity: data.quantity || 1,
      // coinsSpent: data.coinsSpent || 0, // This property doesn't exist in Redemption interface
      status: data.status || "pending",
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    };
  }
);

// Activity Log Converter
export const activityLogConverter: FirestoreConverter<ActivityLog> = createConverter(
  (log: WithFieldValue<ActivityLog>): DocumentData => ({
    ...log,
  }),
  (snapshot: QueryDocumentSnapshot): ActivityLog => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId || "",
      action: data.action || "",
      details: data.details || {},
      module: data.module || "",
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    };
  }
);

// Audit Log Converter
export const auditLogConverter: FirestoreConverter<AuditLog> = createConverter(
  (log: WithFieldValue<AuditLog>): DocumentData => ({
    ...log,
    createdAt: toTimestamp(log.createdAt),
  }),
  (snapshot: QueryDocumentSnapshot): AuditLog => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      actorId: data.actorId || "",
      actionType: data.actionType || "",
      entityId: data.entityId || "",
      before: data.before || {},
      after: data.after || {},
      source: data.source || "",
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    };
  }
);

// Error Log Converter
export const errorLogConverter: FirestoreConverter<ErrorLog> = createConverter(
  (log: WithFieldValue<ErrorLog>): DocumentData => ({
    ...log,
    createdAt: toTimestamp(log.createdAt),
  }),
  (snapshot: QueryDocumentSnapshot): ErrorLog => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      module: data.module || "",
      errorType: data.errorType || "unknown",
      message: data.message || "",
      stackTrace: data.stackTrace || "",
      userId: data.userId || "",
      severity: data.severity || "medium",
      resolved: data.resolved ?? false,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    };
  }
);

// Performance Metric Converter
export const performanceMetricConverter: FirestoreConverter<PerformanceMetric> = createConverter(
  (metric: WithFieldValue<PerformanceMetric>): DocumentData => ({
    ...metric,
    createdAt: toTimestamp(metric.createdAt),
    updatedAt: toTimestamp(metric.updatedAt),
  }),
  (snapshot: QueryDocumentSnapshot): PerformanceMetric => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    } as PerformanceMetric;
  }
);

// Deployment Log Converter
export const deploymentLogConverter: FirestoreConverter<DeploymentLog> = createConverter(
  (log: WithFieldValue<DeploymentLog>): DocumentData => ({
    ...log,
    createdAt: toTimestamp(log.createdAt),
  }),
  (snapshot: QueryDocumentSnapshot): DeploymentLog => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      branch: data.branch || "",
      status: data.status || "pending",
      commitHash: data.commitHash || "",
      actor: data.actor || "",
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    };
  }
);

// Leaderboard Converter
export const leaderboardConverter: FirestoreConverter<Leaderboard> = createConverter(
  (leaderboard: WithFieldValue<Leaderboard>): DocumentData => ({
    ...leaderboard,
    lastUpdated: toTimestamp(leaderboard.lastUpdated as string),
  }),
  (snapshot: QueryDocumentSnapshot): Leaderboard => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      title: data.title || "",
      type: data.type || "global",
      entries: data.entries || [],
      totalParticipants: data.totalParticipants || 0,
      lastUpdated: fromTimestamp(data.lastUpdated)?.toISOString() || new Date().toISOString(),
    };
  }
);

// Achievement Converter
export const achievementConverter: FirestoreConverter<Achievement> = createConverter(
  (achievement: WithFieldValue<Achievement>): DocumentData => ({
    ...achievement,
    createdAt: toTimestamp(achievement.createdAt),
    updatedAt: toTimestamp(achievement.updatedAt),
    unlockedAt: toTimestamp(achievement.unlockedAt as unknown as string),
  }),
  (snapshot: QueryDocumentSnapshot): Achievement => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
      unlockedAt: fromTimestamp(data.unlockedAt) || new Date(),
    } as Achievement;
  }
);

// Notification Template Converter
export const notificationTemplateConverter: FirestoreConverter<NotificationTemplate> = createConverter(
  (template: WithFieldValue<NotificationTemplate>): DocumentData => ({
    ...template,
    createdAt: toTimestamp(template.createdAt as any),
    updatedAt: toTimestamp(template.updatedAt as any),
  }),
  (snapshot: QueryDocumentSnapshot): NotificationTemplate => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    } as NotificationTemplate;
  }
);

// Notification Log Converter
export const notificationLogConverter: FirestoreConverter<NotificationLog> = createConverter(
  (log: WithFieldValue<NotificationLog>): DocumentData => ({
    ...log,
    createdAt: toTimestamp(log.createdAt as any),
    updatedAt: toTimestamp(log.updatedAt as any),
    sentAt: toTimestamp(log.sentAt as any),
  }),
  (snapshot: QueryDocumentSnapshot): NotificationLog => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
      sentAt: fromTimestamp(data.sentAt),
    } as NotificationLog;
  }
);

// Partner Config Converter
export const partnerConfigConverter: FirestoreConverter<PartnerConfig> = createConverter(
  (config: WithFieldValue<PartnerConfig>): DocumentData => ({
    ...config,
    createdAt: toTimestamp(config.createdAt as any),
    updatedAt: toTimestamp(config.updatedAt as any),
  }),
  (snapshot: QueryDocumentSnapshot): PartnerConfig => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    } as PartnerConfig;
  }
);

// Ward Geo Data Converter
export const wardGeoDataConverter: FirestoreConverter<WardGeoData> = createConverter(
  (ward: WithFieldValue<WardGeoData>): DocumentData => ({
    ...ward,
    createdAt: toTimestamp(ward.createdAt as any),
    updatedAt: toTimestamp(ward.updatedAt as any),
    lastUpdated: toTimestamp(ward.lastUpdated as any),
  }),
  (snapshot: QueryDocumentSnapshot): WardGeoData => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
      lastUpdated: fromTimestamp(data.lastUpdated) || new Date(),
    } as WardGeoData;
  }
);

// Fraud Alert Converter
export const fraudAlertConverter: FirestoreConverter<FraudAlert> = createConverter(
  (alert: WithFieldValue<FraudAlert>): DocumentData => ({
    ...alert,
    createdAt: toTimestamp(alert.createdAt as any),
    updatedAt: toTimestamp(alert.updatedAt as any),
  }),
  (snapshot: QueryDocumentSnapshot): FraudAlert => {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: fromTimestamp(data.createdAt)?.toISOString() || new Date().toISOString(),
      updatedAt: fromTimestamp(data.updatedAt)?.toISOString() || new Date().toISOString(),
    } as FraudAlert;
  }
);

// Collection reference helpers with converters
export const getCollectionRef = <T>(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
  converter: FirestoreConverter<T>
): CollectionReference<T> => {
  return db.collection(collectionName).withConverter(converter);
};

// Document reference helpers with converters
export const getDocumentRef = <T>(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
  docId: string,
  converter: FirestoreConverter<T>
): DocumentReference<T> => {
  return db.collection(collectionName).doc(docId).withConverter(converter);
};
