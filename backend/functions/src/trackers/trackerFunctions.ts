import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";
import {db, admin} from "../lib/firebase";
import {SecurityHelpers, DAILY_EARN_LIMIT, MONTHLY_REDEEM_LIMIT} from "../lib/securityHelpers";
import {logAudit, logUserActivity} from "../lib/auditService";
import {Wallet} from "../types";
import axios from "axios";

// Import types from a central location
export interface CarbonActionData {
  userId: string;
  actionType: "transport" | "energy" | "waste" | "water";
  value: number;
  description?: string;
  location?: string;
}

export interface MoodCheckinData {
  userId: string;
  mood: number;
  note?: string;
  activities?: string[];
}

export interface AnimalActionData {
  userId: string;
  actions: string[];
  description?: string;
}

// Remove unused type definitions (already defined in types/trackers.ts)
// These are re-exported from the types module

// Remove problematic import
// import { CarbonActionType, TransportMode } from "../../../shared/types/carbon";

// Use imported types with local extensions
interface LogCarbonActionData extends CarbonActionData {
  // Extending the base type
}

interface LogMoodCheckinData extends MoodCheckinData {
  // Extending the base type
}

interface LogAnimalActionData extends AnimalActionData {
  // Extending the base type
}

// Carbon footprint calculation constants (mock fallback)
const CARBON_FACTORS = {
  transport: {
    walking: -0.0, // No emissions
    cycling: -0.0, // No emissions
    public_transport: 0.05, // kg CO2 per km
    car: 0.2, // kg CO2 per km
    flight: 0.25, // kg CO2 per km
  },
  energy: {
    solar: -0.1, // Negative for renewable
    led_bulb: -0.05, // Savings from efficient lighting
    ac_optimization: -0.3, // Savings from efficient cooling
    electricity_saved: -0.5, // kg CO2 per kWh saved
  },
  waste: {
    recycling: -0.1, // kg CO2 per kg recycled
    composting: -0.2, // kg CO2 per kg composted
    waste_reduction: -0.15, // kg CO2 per kg reduced
  },
  water: {
    conservation: -0.001, // kg CO2 per liter saved
    rainwater_harvesting: -0.002, // kg CO2 per liter collected
  },
};

// India state-wise grid intensity (kg CO2/kWh) fallback
const INDIA_GRID_INTENSITY: Record<string, number> = {
  "DL": 0.72, "MH": 0.76, "KA": 0.68, "TN": 0.62, "GJ": 0.74, "RJ": 0.70,
  "UP": 0.80, "WB": 0.78, "TS": 0.69, "AP": 0.71, "MP": 0.79, "BR": 0.82,
};

function parseIndiaState(location?: string): string {
  if (!location) return "IN";
  const code = location.trim().toUpperCase();
  if (INDIA_GRID_INTENSITY[code] !== undefined) return code;
  // Try extracting last token
  const parts = code.split(/[,\s-]+/);
  const last = parts[parts.length - 1];
  return INDIA_GRID_INTENSITY[last] !== undefined ? last : "IN";
}

async function fetchEmissionFactor(actionType: string, location?: string): Promise<{ factor: number; source: "api" | "mock" }> {
  const useApi = process.env.CARBON_API_URL && process.env.CARBON_API_KEY;
  try {
    if (useApi) {
      const url = `${process.env.CARBON_API_URL}/factors?actionType=${encodeURIComponent(actionType)}${location ? `&location=${encodeURIComponent(location)}` : ""}`;
      const {data} = await axios.get(url, {headers: {"Authorization": `Bearer ${process.env.CARBON_API_KEY}`}});
      if (data && typeof data.factor === "number") {
        return {factor: data.factor, source: "api"};
      }
    }
  } catch {
    // fall through to mock
  }

  // Mock factors by category with state-wise grid intensity if energy + location
  if (actionType === "energy") {
    const state = parseIndiaState(location);
    const grid = INDIA_GRID_INTENSITY[state] ?? 0.75;
    return {factor: grid, source: "mock"};
  }

  const mockBase: Record<string, number> = {transport: 0.12, waste: 0.05, water: 0.001};
  return {factor: mockBase[actionType] ?? 0.1, source: "mock"};
}

function validateActionInput(actionType: string, value: number): void {
  // Block negatives and unrealistic extremes per category
  if (value <= 0) {
    throw new functions.https.HttpsError("invalid-argument", "Value must be positive");
  }
  const limits: Record<string, number> = {
    transport: 2000, // km
    energy: 5000, // kWh
    waste: 10000, // kg
    water: 1000000, // liters
  };
  const max = limits[actionType] ?? 100000;
  if (value > max) {
    throw new functions.https.HttpsError("invalid-argument", `Value exceeds maximum allowed for ${actionType}`);
  }
}

/**
 * Log carbon action and award coins
 */
export const logCarbonAction = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<LogCarbonActionData>) => {
    try {
    // Validate authentication
      const authUserId = SecurityHelpers.validateAuth(request);

      // Validate required parameters
      SecurityHelpers.validateRequired(request.data, ["userId", "actionType", "value"]);

      const {userId, actionType, value, description, location} = request.data;

      // Ensure authenticated user matches the userId
      if (authUserId !== userId) {
        throw new functions.https.HttpsError("permission-denied", "Cannot log carbon action for another user");
      }

      // Validate user exists and is active
      await SecurityHelpers.validateUser(userId);

      // Validate action type
      if (!["transport", "energy", "waste", "water"].includes(actionType)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid action type");
      }

      // Validate value (strict)
      const validValue = SecurityHelpers.validateNumeric(value, "value", 0.001, 1000000);
      validateActionInput(actionType, validValue);

      // Calculate CO2 impact and coins to award using API factors with fallback
      const {factor, source} = await fetchEmissionFactor(actionType, location);
      const co2Saved = validValue * factor; // Negative indicates CO2 saved
      const coinsToAward = Math.max(1, Math.floor(Math.abs(co2Saved) * 10)); // 10 coins per kg CO2 saved

      // Check for duplicate recent actions (prevent spam)
      const recentActions = await db.collection("carbonLogs")
        .where("userId", "==", userId)
        .where("actionType", "==", actionType)
        .where("timestamp", ">", new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
        .limit(1)
        .get();

      if (!recentActions.empty) {
        throw new functions.https.HttpsError("already-exists", "Similar action logged recently. Please wait before logging again.");
      }

      // Execute transaction
      const withinDailyLimit = await SecurityHelpers.checkDailyEarnCap(userId, coinsToAward);
      if (!withinDailyLimit) {
        throw new functions.https.HttpsError("resource-exhausted", "Daily earning limit exceeded");
      }

      const result = await db.runTransaction(async (transaction) => {
        const logId = SecurityHelpers.generateId("carbon");

        // Create carbon log
        const carbonLogRef = db.collection("carbonLogs").doc(logId);
        const carbonLog: any = {
          logId,
          userId,
          actionType,
          value: validValue,
          co2Saved,
          coinsEarned: Math.max(1, Math.floor(Math.abs(co2Saved) * 10)),
          timestamp: new Date().toISOString(),
          // extensions
          source: source as any, // 'api' | 'mock'
          isAuditable: (source as any) === "api",
        };

        transaction.set(carbonLogRef, carbonLog);

        // Update wallet with earned coins
        const walletRef = db.collection("wallets").doc(userId);
        const walletDoc = await transaction.get(walletRef);

        let updatedWallet: Wallet;
        if (!walletDoc.exists) {
        // Create new wallet
          updatedWallet = {
            walletId: userId,
            id: userId,
            entityId: userId,
            userId: userId,
            inrBalance: 0,
            healCoins: coinsToAward,
            totalEarned: coinsToAward,
            totalRedeemed: 0,
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            dailyEarnLimit: DAILY_EARN_LIMIT,
            monthlyEarnLimit: MONTHLY_REDEEM_LIMIT,
          };
          transaction.set(walletRef, updatedWallet);
        } else {
        // Update existing wallet
          const wallet = walletDoc.data() as Wallet;
          updatedWallet = {
            ...wallet,
            healCoins: wallet.healCoins + coinsToAward,
            lastUpdated: new Date().toISOString(),
          };
          transaction.update(walletRef, {
            healCoins: wallet.healCoins + coinsToAward,
            lastUpdated: new Date().toISOString(),
          });
        }

        return {carbonLog, updatedWallet};
      });

      // Log audit trail
      await logAudit(
        "logCarbonAction",
        userId,
        result.carbonLog.logId,
        {},
        {
          actionType,
          value: validValue,
          co2Saved,
          coinsAwarded: coinsToAward,
          description: description || "",
          location: location || "",
          source,
        },
        "trackerFunctions"
      );

      // Log user activity
      await logUserActivity(
        userId,
        "carbonActionLogged",
        {
          actionType,
          co2Saved,
          coinsAwarded: coinsToAward,
        },
        "trackerFunctions"
      );

      return SecurityHelpers.createResponse("success", `Carbon action logged successfully. Earned ${coinsToAward} coins!`, {
        carbonLog: result.carbonLog,
        updatedWallet: result.updatedWallet,
        co2Saved,
        coinsAwarded: coinsToAward,
      });
    } catch (error) {
      console.error("Error in logCarbonAction:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError("internal", "Failed to log carbon action");
    }
  });

/**
 * Log mood check-in for mental health tracking
 */
export const logMoodCheckin = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<LogMoodCheckinData>) => {
    try {
    // Validate authentication
      const authUserId = SecurityHelpers.validateAuth(request);

      // Validate required parameters
      SecurityHelpers.validateRequired(request.data, ["userId", "mood"]);

      const {userId, mood, note, activities} = request.data;

      // Ensure authenticated user matches the userId
      if (authUserId !== userId) {
        throw new functions.https.HttpsError("permission-denied", "Cannot log mood for another user");
      }

      // Validate user exists and is active
      await SecurityHelpers.validateUser(userId);

      // Validate mood value (1-10 scale)
      const validMood = SecurityHelpers.validateNumeric(mood, "mood", 1, 10);

      // Check for duplicate recent check-ins (one per day)
      const today = new Date().toISOString().split("T")[0];
      const todayCheckins = await db.collection("mentalHealthLogs")
        .where("userId", "==", userId)
        .where("date", "==", today)
        .limit(1)
        .get();

      if (!todayCheckins.empty) {
        throw new functions.https.HttpsError("already-exists", "Mood already logged today. Only one check-in per day allowed.");
      }

      // Calculate ecoMindScore improvement
      const ecoMindImprovement = calculateEcoMindScore(validMood, activities || []);
      const coinsToAward = Math.max(1, Math.floor(ecoMindImprovement * 2)); // 2 coins per point improvement

      // Execute transaction
      const withinDailyLimit = await SecurityHelpers.checkDailyEarnCap(userId, coinsToAward);
      if (!withinDailyLimit) {
        throw new functions.https.HttpsError("resource-exhausted", "Daily earning limit exceeded");
      }

      const result = await db.runTransaction(async (transaction) => {
        const logId = SecurityHelpers.generateId("mood");

        // Create mental health log
        const mentalHealthLogRef = db.collection("mentalHealthLogs").doc(logId);
        const mentalHealthLog: any = {
          logId,
          userId,
          mood: validMood,
          note: note || "",
          activities: activities || [],
          ecoMindScore: ecoMindImprovement,
          ecoScoreRef: `eco_${userId}_${today}`,
          coinsAwarded: coinsToAward,
          date: today,
          timestamp: new Date().toISOString(),
        };

        transaction.set(mentalHealthLogRef, mentalHealthLog);

        // Update wallet with earned coins
        const walletRef = db.collection("wallets").doc(userId);
        const walletDoc = await transaction.get(walletRef);

        let updatedWallet: Wallet;
        if (!walletDoc.exists) {
        // Create new wallet
          updatedWallet = {
            walletId: userId,
            id: userId,
            entityId: userId,
            userId: userId,
            inrBalance: 0,
            healCoins: coinsToAward,
            totalEarned: coinsToAward,
            totalRedeemed: 0,
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            dailyEarnLimit: DAILY_EARN_LIMIT,
            monthlyEarnLimit: MONTHLY_REDEEM_LIMIT,
          };
          transaction.set(walletRef, updatedWallet);
        } else {
        // Update existing wallet
          const wallet = walletDoc.data() as Wallet;
          updatedWallet = {
            ...wallet,
            healCoins: wallet.healCoins + coinsToAward,
            lastUpdated: new Date().toISOString(),
          };
          transaction.update(walletRef, {
            healCoins: wallet.healCoins + coinsToAward,
            lastUpdated: new Date().toISOString(),
          });
        }

        return {mentalHealthLog, updatedWallet};
      });

      // Log audit trail
      await logAudit(
        "logMoodCheckin",
        userId,
        result.mentalHealthLog.logId,
        {},
        {
          mood: validMood,
          ecoMindScore: ecoMindImprovement,
          ecoScoreRef: result.mentalHealthLog.ecoScoreRef,
          coinsAwarded: coinsToAward,
          activitiesCount: activities?.length || 0,
        },
        "trackerFunctions"
      );

      // Log user activity
      await logUserActivity(
        userId,
        "moodCheckinLogged",
        {
          mood: validMood,
          ecoMindScore: ecoMindImprovement,
          coinsAwarded: coinsToAward,
        },
        "trackerFunctions"
      );

      return SecurityHelpers.createResponse("success", `Mood check-in logged successfully. Earned ${coinsToAward} coins!`, {
        mentalHealthLog: result.mentalHealthLog,
        updatedWallet: result.updatedWallet,
        ecoMindScore: ecoMindImprovement,
        coinsAwarded: coinsToAward,
      });
    } catch (error) {
      console.error("Error in logMoodCheckin:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError("internal", "Failed to log mood check-in");
    }
  });

/**
 * Log animal welfare action
 */
export const logAnimalAction = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<LogAnimalActionData>) => {
    try {
    // Validate authentication
      const authUserId = SecurityHelpers.validateAuth(request);

      // Validate required parameters
      SecurityHelpers.validateRequired(request.data, ["userId", "actions"]);

      const {userId, actions, description} = request.data;

      // Ensure authenticated user matches the userId
      if (authUserId !== userId) {
        throw new functions.https.HttpsError("permission-denied", "Cannot log animal action for another user");
      }

      // Validate user exists and is active
      await SecurityHelpers.validateUser(userId);

      // Validate actions array
      if (!Array.isArray(actions) || actions.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "Actions must be a non-empty array");
      }

      // Calculate kindness score and coins
      const kindnessScore = calculateKindnessScore(actions);
      const coinsToAward = Math.max(1, Math.floor(kindnessScore * 5)); // 5 coins per kindness point

      // Check for duplicate recent actions (prevent spam)
      const recentActions = await db.collection("animalWelfareLogs")
        .where("userId", "==", userId)
        .where("timestamp", ">", new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Last 30 minutes
        .limit(1)
        .get();

      if (!recentActions.empty) {
        throw new functions.https.HttpsError("already-exists", "Animal action logged recently. Please wait before logging again.");
      }

      // Execute transaction
      const withinDailyLimit = await SecurityHelpers.checkDailyEarnCap(userId, coinsToAward);
      if (!withinDailyLimit) {
        throw new functions.https.HttpsError("resource-exhausted", "Daily earning limit exceeded");
      }

      const result = await db.runTransaction(async (transaction) => {
        const logId = SecurityHelpers.generateId("animal");

        // Create animal welfare log
        const animalWelfareLogRef = db.collection("animalWelfareLogs").doc(logId);
        const animalWelfareLog: any = {
          logId,
          userId,
          actions,
          description: description || "",
          kindnessScore,
          coinsAwarded: coinsToAward,
          timestamp: new Date().toISOString(),
          verified: false,
          moderated: false,
        };

        transaction.set(animalWelfareLogRef, animalWelfareLog);

        // Do not update wallet yet; create moderationQueue entry
        const moderationId = `mod_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        transaction.set(db.collection("moderationQueue").doc(moderationId), {
          moderationId,
          type: "animalWelfare",
          logId,
          userId,
          status: "pending",
          coinsToAward,
          timestamp: new Date().toISOString(),
        });

        return {animalWelfareLog, updatedWallet: null as any};
      });

      // Log audit trail
      await logAudit(
        "logAnimalAction",
        userId,
        result.animalWelfareLog.logId,
        {},
        {
          actions,
          kindnessScore,
          coinsAwarded: coinsToAward,
          description: description || "",
        },
        "trackerFunctions"
      );

      // Log user activity
      await logUserActivity(
        userId,
        "animalActionLogged",
        {
          actionsCount: actions.length,
          kindnessScore,
          coinsAwarded: 0,
        },
        "trackerFunctions"
      );

      return SecurityHelpers.createResponse("success", "Animal welfare action submitted for moderation. Coins will be awarded upon approval.", {
        animalWelfareLog: result.animalWelfareLog,
        updatedWallet: result.updatedWallet,
        kindnessScore,
        coinsAwarded: 0,
      });
    } catch (error) {
      console.error("Error in logAnimalAction:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError("internal", "Failed to log animal action");
    }
  });

// Admin callable to approve moderation and award coins
export const approveAnimalModeration = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ moderationId: string }>) => {
    const uid = SecurityHelpers.validateAuth(request);
    if (!request.auth?.token?.admin) throw new functions.https.HttpsError("permission-denied", "Admin required");
    SecurityHelpers.validateRequired(request.data, ["moderationId"]);
    const {moderationId} = request.data;
    const modRef = db.collection("moderationQueue").doc(moderationId);
    const modSnap = await modRef.get();
    if (!modSnap.exists) throw new functions.https.HttpsError("not-found", "Moderation not found");
    const mod = modSnap.data() as any;
    if (mod.status === "approved") return {success: true};

    // Approve and award coins
    await db.runTransaction(async (tx) => {
      tx.update(modRef, {status: "approved", approvedAt: new Date().toISOString(), approvedBy: uid});
      const logRef = db.collection("animalWelfareLogs").doc(mod.logId);
      tx.update(logRef, {moderated: true, verified: true});

      const walletRef = db.collection("wallets").doc(mod.userId);
      const walletSnap = await tx.get(walletRef);
      if (!walletSnap.exists) {
        tx.set(walletRef, {
          walletId: mod.userId,
          entityId: mod.userId,
          inrBalance: 0,
          healCoins: mod.coinsToAward,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isActive: true,
          dailyEarnLimit: DAILY_EARN_LIMIT,
          monthlyEarnLimit: MONTHLY_REDEEM_LIMIT,
        });
      } else {
        const w = walletSnap.data() as Wallet;
        tx.update(walletRef, {healCoins: (w.healCoins || 0) + mod.coinsToAward, lastUpdated: new Date().toISOString()});
      }
    });

    await logAudit(
      "approveAnimalModeration",
      uid,
      moderationId,
      {},
      {coinsAwarded: modSnap.data()?.coinsToAward, userId: modSnap.data()?.userId},
      "trackerFunctions"
    );

    // Issue badges based on number of approved logs
    const modData = modSnap.data() as any;
    const approvedSnap = await db.collection("moderationQueue")
      .where("userId", "==", modData.userId)
      .where("status", "==", "approved").get();
    const approvals = approvedSnap.size;
    const badgesToAdd: string[] = [];
    if (approvals >= 20) badgesToAdd.push("Kindness Hero");
    if (approvals >= 5) badgesToAdd.push("Animal Ally");
    if (badgesToAdd.length) {
      const userRef = db.collection("users").doc(modData.userId);
      const userSnap = await userRef.get();
      const existing = (userSnap.data() as any)?.badges || [];
      const merged = Array.from(new Set([...existing, ...badgesToAdd]));
      await userRef.set({badges: merged}, {merge: true});
      await logAudit(
        "badgeIssued",
        uid,
        modData.userId,
        {},
        {badges: badgesToAdd},
        "trackerFunctions"
      );
    }

    return {success: true};
  }
);

/**
 * Generate signed upload URL for animal proof photo
 * Stores expected proof path on the log for moderation reference
 */
export const getAnimalProofUploadUrl = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ userId: string; logId: string; filename: string; contentType: string }>) => {
    const uid = SecurityHelpers.validateAuth(request);
    SecurityHelpers.validateRequired(request.data, ["userId", "logId", "filename", "contentType"]);
    const {userId, logId, filename, contentType} = request.data;
    if (uid !== userId) throw new functions.https.HttpsError("permission-denied", "Cannot upload proof for another user");

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(contentType)) throw new functions.https.HttpsError("invalid-argument", "Unsupported content type");

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `animalProofs/${userId}/${logId}/${safeName}`;
    const bucket = admin.storage().bucket();
    const file = bucket.file(path);

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    });

    // Record expected proof path on the log for moderators
    await db.collection("animalWelfareLogs").doc(logId).set({
      proofPaths: admin.firestore.FieldValue.arrayUnion(path),
      updatedAt: new Date().toISOString(),
    }, {merge: true});

    await logUserActivity(
      userId,
      "animalProofUploadRequested",
      {logId, path, contentType},
      "trackerFunctions"
    );

    return {success: true, data: {uploadUrl: url, path}};
  }
);

/**
 * List moderation queue (admin-only) with optional status filter
 */
export const listModerationQueue = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ status?: string }>) => {
    SecurityHelpers.validateAuth(request);
    if (!request.auth?.token?.admin) throw new functions.https.HttpsError("permission-denied", "Admin required");
    const status = request.data?.status || "pending";
    let query: FirebaseFirestore.Query = db.collection("moderationQueue");
    if (status) query = query.where("status", "==", status);
    const snap = await query.orderBy("timestamp", "desc").limit(200).get();
    const items = snap.docs.map((d) => d.data());
    return {success: true, data: items};
  }
);

/**
 * Weekly Mental Health Insights
 * Aggregates mood logs and eco actions for the past 7 days and stores a weekly insight.
 * Saves under weeklyInsights/{userId}_{weekKey}
 */
export const generateWeeklyInsights = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ userId: string; weekStart?: string }>) => {
    const uid = SecurityHelpers.validateAuth(request);
    SecurityHelpers.validateRequired(request.data, ["userId"]);
    const {userId, weekStart} = request.data;
    if (uid !== userId) throw new functions.https.HttpsError("permission-denied", "Cannot generate insights for another user");

    // Compute window
    const start = weekStart ? new Date(weekStart) : new Date();
    // normalize to start of week (Mon)
    const day = start.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
    const windowStart = new Date(start);
    windowStart.setDate(start.getDate() + diff);
    windowStart.setHours(0, 0, 0, 0);
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowStart.getDate() + 7);

    const weekKey = `${windowStart.toISOString().slice(0, 10)}`; // YYYY-MM-DD

    // Query mood logs in window
    const moodSnap = await db.collection("mentalHealthLogs")
      .where("userId", "==", userId)
      .where("timestamp", ">=", windowStart.toISOString())
      .where("timestamp", "<", windowEnd.toISOString())
      .get();
    const moods = moodSnap.docs.map((d) => d.data() as any);

    // Query eco actions (carbon logs) in window
    const ecoSnap = await db.collection("carbonLogs")
      .where("userId", "==", userId)
      .where("timestamp", ">=", windowStart.toISOString())
      .where("timestamp", "<", windowEnd.toISOString())
      .get();
    const ecos = ecoSnap.docs.map((d) => d.data() as any);

    const avgMood = moods.length ? Math.round((moods.reduce((s, m) => s + (m.mood || m.moodScore || 0), 0) / moods.length) * 100) / 100 : 0;
    const avgEcoMind = moods.length ? Math.round((moods.reduce((s, m) => s + (m.ecoMindScore || 0), 0) / moods.length) * 100) / 100 : 0;
    const ecoActions = ecos.length;
    const co2Saved = Math.round(ecos.reduce((s, e) => s + (e.co2Saved || 0), 0) * 100) / 100;

    // Simple insights library
    const LIB = {
      boost: [
        "Great progress this week! Keep up your eco-routine.",
        "Your eco actions are inspiring—stay consistent!",
        "Nice momentum—consider a small new habit next week.",
      ],
      encourage: [
        "Every step counts. Try a short nature walk.",
        "You got this! A tiny change makes a difference.",
        "Focus on one easy eco action—you'll feel the boost.",
      ],
    };

    const category = avgMood >= 7 || ecoActions >= 3 ? "boost" : "encourage";
    const message = LIB[category][Math.floor(Math.random() * LIB[category].length)];

    const insight = {
      insightId: `${userId}_${weekKey}`,
      userId,
      weekStart: windowStart.toISOString(),
      weekEnd: windowEnd.toISOString(),
      avgMood,
      avgEcoMind,
      ecoActions,
      co2Saved,
      message,
      createdAt: new Date().toISOString(),
    };

    await db.collection("weeklyInsights").doc(insight.insightId).set(insight);

    await logUserActivity(
      userId,
      "weeklyInsightsGenerated",
      {weekStart: insight.weekStart, avgMood, ecoActions},
      "trackerFunctions"
    );

    return {success: true, data: insight};
  }
);

/**
 * School Admin Weekly Aggregate (anonymized)
 * Returns aggregated mood statistics for a school or provided userIds over the last 7 days.
 */
export const getSchoolWeeklyMoodAggregate = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ schoolId?: string; userIds?: string[] }>) => {
    SecurityHelpers.validateAuth(request);
    if (!request.auth?.token?.admin) throw new functions.https.HttpsError("permission-denied", "Admin required");
    const {schoolId, userIds} = request.data || {} as any;
    if (!schoolId && (!userIds || userIds.length === 0)) {
      throw new functions.https.HttpsError("invalid-argument", "Provide schoolId or userIds");
    }

    let targets: string[] = userIds || [];
    if (schoolId && targets.length === 0) {
      const usersSnap = await db.collection("users").where("schoolId", "==", schoolId).get();
      targets = usersSnap.docs.map((d) => (d.data() as any).userId).filter(Boolean);
    }
    if (targets.length === 0) return {success: true, data: {count: 0, avgMood: 0, distribution: {}}};

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    const startIso = start.toISOString();
    const endIso = end.toISOString();

    // Fetch logs for targets in parallel (batched queries)
    const chunks: string[][] = [];
    for (let i = 0; i < targets.length; i += 10) chunks.push(targets.slice(i, i + 10));
    const results = await Promise.all(chunks.map(async (ids) => {
      const snap = await db.collection("mentalHealthLogs")
        .where("userId", "in", ids)
        .where("timestamp", ">=", startIso)
        .where("timestamp", "<", endIso)
        .get();
      return snap.docs.map((d) => d.data() as any);
    }));

    const logs = results.flat();
    const count = logs.length;
    const avgMood = count ? Math.round((logs.reduce((s, m) => s + (m.mood || m.moodScore || 0), 0) / count) * 100) / 100 : 0;
    const distribution = logs.reduce((acc: Record<string, number>, m: any) => {
      const day = (m.date || (m.timestamp || "").slice(0, 10)) || "unknown";
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    return {success: true, data: {count, avgMood, distribution}};
  }
);

/**
 * School Admin Weekly Aggregate by Class/Section (anonymized)
 * Groups last-7-days mood logs by user profile fields (classId/section) and returns stats per group.
 */
export const getSchoolWeeklyMoodAggregateBySection = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ schoolId: string }>) => {
    SecurityHelpers.validateAuth(request);
    if (!request.auth?.token?.admin) throw new functions.https.HttpsError("permission-denied", "Admin required");
    SecurityHelpers.validateRequired(request.data, ["schoolId"]);
    const {schoolId} = request.data;

    // Fetch all users for the school with grouping metadata
    const usersSnap = await db.collection("users").where("schoolId", "==", schoolId).get();
    const userMeta: Record<string, { classId?: string; section?: string }> = {};
    const userIds: string[] = [];
    usersSnap.docs.forEach((d) => {
      const data = d.data() as any;
      const uid = data.userId || d.id;
      if (!uid) return;
      userIds.push(uid);
      userMeta[uid] = {classId: data.classId, section: data.section};
    });
    if (userIds.length === 0) return {success: true, data: {groups: {}, groupCount: 0, totalCount: 0}};

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    const startIso = start.toISOString();
    const endIso = end.toISOString();

    // Fetch logs for users in chunks of 10 (Firestore 'in' limit)
    const chunks: string[][] = [];
    for (let i = 0; i < userIds.length; i += 10) chunks.push(userIds.slice(i, i + 10));
    const results = await Promise.all(chunks.map(async (ids) => {
      const snap = await db.collection("mentalHealthLogs")
        .where("userId", "in", ids)
        .where("timestamp", ">=", startIso)
        .where("timestamp", "<", endIso)
        .get();
      return snap.docs.map((d) => d.data() as any);
    }));

    const logs = results.flat();

    // Group by classId-section
    type GroupStats = { count: number; moodSum: number; ecoSum: number; distribution: Record<string, number> };
    const groups: Record<string, GroupStats> = {};
    for (const m of logs) {
      const meta = userMeta[m.userId] || {};
      const groupKey = `${meta.classId || "unknown"}-${meta.section || "A"}`;
      if (!groups[groupKey]) groups[groupKey] = {count: 0, moodSum: 0, ecoSum: 0, distribution: {}};
      const g = groups[groupKey];
      g.count += 1;
      g.moodSum += (m.mood || m.moodScore || 0);
      g.ecoSum += (m.ecoMindScore || 0);
      const day = (m.date || (m.timestamp || "").slice(0, 10)) || "unknown";
      g.distribution[day] = (g.distribution[day] || 0) + 1;
    }

    const response: Record<string, { count: number; avgMood: number; avgEcoMind: number; distribution: Record<string, number> }> = {};
    Object.entries(groups).forEach(([k, v]) => {
      response[k] = {
        count: v.count,
        avgMood: v.count ? Math.round((v.moodSum / v.count) * 100) / 100 : 0,
        avgEcoMind: v.count ? Math.round((v.ecoSum / v.count) * 100) / 100 : 0,
        distribution: v.distribution,
      };
    });

    return {success: true, data: {groups: response, groupCount: Object.keys(response).length, totalCount: logs.length}};
  }
);

/**
 * Calculate CO2 impact based on action type and value
 */
/* istanbul ignore next */ // helper retained for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const calculateCO2Impact = (actionType: string, value: number): number => {
  // This is a simplified calculation - in production, use more sophisticated models
  const baseFactors = CARBON_FACTORS[actionType as keyof typeof CARBON_FACTORS];

  if (!baseFactors) {
    return 0;
  }

  // For simplicity, use a default factor for each category
  let factor = 0;
  switch (actionType) {
  case "transport":
    factor = -0.1; // Assume eco-friendly transport
    break;
  case "energy":
    factor = -0.2; // Assume energy saving
    break;
  case "waste":
    factor = -0.15; // Assume waste reduction
    break;
  case "water":
    factor = -0.001; // Assume water conservation
    break;
  }

  // Apply additional carbon calculation logic based on transport mode if available
  // Note: transportMode would need to be passed as a parameter

  return value * factor; // Negative values indicate CO2 saved
};

/**
 * Calculate eco-mind score based on mood and activities
 */
function calculateEcoMindScore(mood: number, activities: string[]): number {
  const baseScore = mood / 2; // Base score from mood (0.5 to 5)

  // Bonus for eco-friendly activities
  const ecoActivities = ["meditation", "nature_walk", "gardening", "recycling", "volunteering"];
  const ecoActivityBonus = activities.filter((activity) =>
    ecoActivities.some((eco) => activity.toLowerCase().includes(eco))
  ).length * 0.5;

  return Math.min(10, baseScore + ecoActivityBonus);
}

/**
 * Calculate kindness score based on animal welfare actions
 */
function calculateKindnessScore(actions: string[]): number {
  const actionScores: { [key: string]: number } = {
    "feeding_stray": 2,
    "animal_rescue": 5,
    "veterinary_care": 4,
    "adoption": 10,
    "donation": 3,
    "volunteering": 4,
    "awareness": 2,
    "shelter_visit": 3,
  };

  let totalScore = 0;
  actions.forEach((action) => {
    const normalizedAction = action.toLowerCase().replace(/\s+/g, "_");
    for (const [key, score] of Object.entries(actionScores)) {
      if (normalizedAction.includes(key)) {
        totalScore += score;
        break;
      }
    }
  });

  return Math.min(20, totalScore); // Cap at 20 points
}
