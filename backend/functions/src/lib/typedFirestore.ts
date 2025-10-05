import {db} from "./firebase";
import * as admin from "firebase-admin";
import type {
  CarbonLog,
  MentalHealthLog,
  AnimalWelfareLog,
  DigitalTwinSimulation,
  MSMEReport,
  User,
  Wallet,
  AuditLog,
  GameScore,
} from "../types";

const createConverter = <T extends Record<string, any>>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot): T => snap.data() as T,
});

export const converters = {
  carbonLog: createConverter<CarbonLog>(),
  mentalHealthLog: createConverter<MentalHealthLog>(),
  animalWelfareLog: createConverter<AnimalWelfareLog>(),
  digitalTwinSimulation: createConverter<DigitalTwinSimulation>(),
  msmeReport: createConverter<MSMEReport>(),
};

export const collectionsRef = {
  carbonLogs: () => db.collection("carbonLogs").withConverter(converters.carbonLog as any),
  mentalHealthLogs: () => db.collection("mentalHealthLogs").withConverter(converters.mentalHealthLog as any),
  animalWelfareLogs: () => db.collection("animalWelfareLogs").withConverter(converters.animalWelfareLog as any),
  digitalTwinSimulations: () => db.collection("digitalTwinSimulations").withConverter(converters.digitalTwinSimulation as any),
  msmeReports: () => db.collection("msmeReports").withConverter(converters.msmeReport as any),
};

export async function logCarbonAction(userId: string, categoryId: string, action: string, co2Saved: number, quantity: number, unit: string) {
  const log: CarbonLog = {
    id: "",
    userId,
    categoryId,
    action,
    co2Saved,
    quantity,
    unit,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const ref = collectionsRef.carbonLogs().doc();
  log.id = ref.id;
  await ref.set(log as any);
  return log;
}

export async function logMoodCheckin(userId: string, mood: "excellent" | "good" | "neutral" | "poor" | "terrible", score: number, note?: string, factors?: string[]) {
  const mh: MentalHealthLog = {
    id: "",
    userId,
    mood,
    score,
    note,
    factors,
    coinsEarned: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const ref = collectionsRef.mentalHealthLogs().doc();
  mh.id = ref.id;
  await ref.set(mh as any);
  return mh;
}

export async function logAnimalAction(userId: string, action: string, category: string, impact: number, description: string) {
  const aw: AnimalWelfareLog = {
    id: "",
    userId,
    action,
    category,
    impact,
    description,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const ref = collectionsRef.animalWelfareLogs().doc();
  aw.id = ref.id;
  await ref.set(aw as any);
  return aw;
}

export async function runDigitalTwinSimulation(userId: string, scenario: string, inputConfig: Record<string, any>, parameters: any) {
  const sim: DigitalTwinSimulation = {
    id: "",
    userId,
    scenario,
    inputConfig,
    results: {
      co2Saved: 100,
      energySaved: 250,
      comparison: {baseline: 500, simulated: 350},
    },
    parameters,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const ref = collectionsRef.digitalTwinSimulations().doc();
  sim.id = ref.id;
  await ref.set(sim as any);
  return sim;
}

export async function generateMSMEReport(userId: string, reportType: string, reportData: any) {
  const report: MSMEReport = {
    id: "",
    userId,
    reportType,
    reportData,
    data: reportData,
    esgScore: 70,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const ref = collectionsRef.msmeReports().doc();
  report.id = ref.id;
  await ref.set(report as any);
  return report;
}


// Typed converters used by tests and routes

const tsFrom = (iso?: string) => (iso ? admin.firestore.Timestamp.fromDate(new Date(iso)) : undefined);
const tsToIso = (ts: any | undefined, fallback?: string) => (ts?.toDate ? ts.toDate().toISOString() : fallback);

export const userConverter = {
  toFirestore: (user: User) => ({
    email: user.email,
    name: (user as any).name || (user as any).displayName,
    role: (user as any).role,
    isActive: (user as any).isActive,
    emailVerified: (user as any).emailVerified,
    createdAt: tsFrom((user as any).createdAt),
    updatedAt: tsFrom((user as any).updatedAt),
    lastLoginAt: tsFrom((user as any).lastLoginAt),
  }),
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot): User => {
    const d: any = snap.data();
    return {
      userId: snap.id,
      email: d.email,
      displayName: d.name,
      role: d.role,
      isActive: d.isActive,
      emailVerified: d.emailVerified,
      createdAt: tsToIso(d.createdAt)!,
      updatedAt: tsToIso(d.updatedAt)!,
      lastLoginAt: tsToIso(d.lastLoginAt),
    } as any;
  },
};

export const walletConverter = {
  toFirestore: (wallet: Wallet) => ({
    entityId: wallet.entityId,
    inrBalance: wallet.inrBalance,
    healCoins: wallet.healCoins,
    isActive: wallet.isActive,
    createdAt: tsFrom(wallet.createdAt),
    lastUpdated: tsFrom(wallet.lastUpdated),
  }),
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot): Wallet => {
    const d: any = snap.data();
    return {
      walletId: snap.id,
      entityId: d.entityId,
      inrBalance: d.inrBalance ?? 0,
      healCoins: d.healCoins ?? 0,
      isActive: d.isActive ?? true,
      createdAt: tsToIso(d.createdAt)!,
      lastUpdated: tsToIso(d.lastUpdated)!,
    } as Wallet;
  },
};

export const gameScoreConverter = {
  toFirestore: (score: GameScore) => ({
    gameId: score.gameId,
    userId: score.userId,
    gameType: (score as any).gameType,
    score: score.score,
    maxScore: (score as any).maxScore,
    percentage: (score as any).percentage,
    coinsEarned: score.coinsEarned,
    completionTime: (score as any).completionTime,
    attempts: (score as any).attempts,
    metadata: (score as any).metadata,
    completedAt: tsFrom((score as any).completedAt),
    createdAt: tsFrom(score.createdAt),
  }),
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot): GameScore => {
    const d: any = snap.data();
    return {
      scoreId: snap.id,
      gameId: d.gameId,
      userId: d.userId,
      gameType: d.gameType,
      score: d.score ?? 0,
      maxScore: d.maxScore ?? 0,
      percentage: d.percentage ?? 0,
      coinsEarned: d.coinsEarned ?? 0,
      completionTime: d.completionTime ?? 0,
      attempts: d.attempts ?? 0,
      metadata: d.metadata ?? {},
      completedAt: tsToIso(d.completedAt) || new Date().toISOString(),
      createdAt: tsToIso(d.createdAt) || new Date().toISOString(),
    } as GameScore;
  },
};

export const auditLogConverter = {
  toFirestore: (log: AuditLog) => ({
    action: (log as any).action,
    userId: (log as any).userId,
    resourceType: (log as any).resourceType,
    resourceId: (log as any).resourceId,
    details: (log as any).details,
    ipAddress: (log as any).ipAddress,
    userAgent: (log as any).userAgent,
    severity: (log as any).severity,
    timestamp: tsFrom((log as any).timestamp),
    createdAt: tsFrom((log as any).createdAt || (log as any).timestamp),
  }),
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot): AuditLog => {
    const d: any = snap.data();
    return {
      logId: snap.id,
      type: d.type || d.resourceType,
      action: d.action,
      userId: d.userId,
      data: d.data || d.details,
      createdAt: tsToIso(d.createdAt) || tsToIso(d.timestamp)!,
      severity: d.severity,
      ipAddress: d.ipAddress,
      userAgent: d.userAgent,
    } as any;
  },
};

export const gameCollections = {
  gameScores: () => db.collection("gameScores").withConverter(gameScoreConverter as any),
  users: () => db.collection("users").withConverter(userConverter as any),
  wallets: () => db.collection("wallets").withConverter(walletConverter as any),
  auditLogs: () => db.collection("auditLogs").withConverter(auditLogConverter as any),
};


