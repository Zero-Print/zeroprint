import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {SecurityHelpers, DAILY_EARN_LIMIT, MONTHLY_REDEEM_LIMIT} from "../lib/securityHelpers";
import {logAudit, logUserActivity} from "../lib/auditService";
import {Wallet} from "../types";

interface Mission {
  missionId: string;
  title: string;
  type: "streak" | "count" | "challenge";
  goal: number;
  rewardCoins: number;
  startDate?: string;
  endDate?: string;
  status: "active" | "inactive" | "archived";
  createdAt: string;
  createdBy: string;
}

interface UserStreak {
  userId: string;
  missionId?: string;
  streakCount: number;
  lastCompletedDate?: string;
  badges: string[];
  xp: number;
  updatedAt: string;
}

function isAdminToken(request: any): boolean {
  const token = request.auth?.token;
  const email: string | undefined = token?.email;
  return Boolean(token?.admin || (email && email.includes("admin")));
}

export const createMission = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<Partial<Mission>>) => {
    try {
      if (!request.auth?.uid || !isAdminToken(request)) {
        throw new functions.https.HttpsError("permission-denied", "Admin required");
      }

      const {title, type, goal, rewardCoins, startDate, endDate, status = "active"} = request.data || {};
      SecurityHelpers.validateRequired({title, type, goal, rewardCoins}, ["title", "type", "goal", "rewardCoins"]);

      const missionId = SecurityHelpers.generateId("mission");
      const mission: Mission = {
        missionId,
        title: String(title),
        type: String(type) as any,
        goal: Number(goal),
        rewardCoins: Number(rewardCoins),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: status as any,
        createdAt: new Date().toISOString(),
        createdBy: request.auth.uid,
      };

      await db.collection("missions").doc(missionId).set(mission);

      await logAudit(
        "createMission",
        request.auth.uid,
        missionId,
        {},
        {title, type, goal, rewardCoins, status},
        "gamificationFunctions"
      );

      return {success: true, data: mission};
    } catch (error) {
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError("internal", "Failed to create mission");
    }
  }
);

export const updateMission = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{missionId: string; updates: Partial<Mission>}>) => {
    try {
      if (!request.auth?.uid || !isAdminToken(request)) {
        throw new functions.https.HttpsError("permission-denied", "Admin required");
      }
      SecurityHelpers.validateRequired(request.data || {}, ["missionId", "updates"]);
      const {missionId, updates} = request.data!;

      const ref = db.collection("missions").doc(missionId);
      const snap = await ref.get();
      if (!snap.exists) throw new functions.https.HttpsError("not-found", "Mission not found");

      await ref.update({...updates, updatedAt: new Date().toISOString()});

      await logAudit(
        "updateMission",
        request.auth.uid,
        missionId,
        {},
        {updates},
        "gamificationFunctions"
      );

      return {success: true};
    } catch (error) {
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError("internal", "Failed to update mission");
    }
  }
);

export const listMissions = functions.https.onCall(
  {region: "asia-south1"},
  async (_request) => {
    try {
      const q = await db.collection("missions").where("status", "==", "active").get();
      const missions = q.docs.map((d) => d.data());
      return {success: true, data: missions};
    } catch {
      throw new functions.https.HttpsError("internal", "Failed to list missions");
    }
  }
);

export const completeMission = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{missionId: string}>) => {
    try {
      const uid = SecurityHelpers.validateAuth(request);
      SecurityHelpers.validateRequired(request.data || {}, ["missionId"]);
      const {missionId} = request.data!;

      const missionSnap = await db.collection("missions").doc(missionId).get();
      if (!missionSnap.exists) throw new functions.https.HttpsError("not-found", "Mission not found");
      const mission = missionSnap.data() as Mission;
      if (mission.status !== "active") throw new functions.https.HttpsError("failed-precondition", "Mission not active");

      // Award coins and update streaks in a transaction
      const withinDailyLimit = await SecurityHelpers.checkDailyEarnCap(uid, mission.rewardCoins);
      if (!withinDailyLimit) throw new functions.https.HttpsError("resource-exhausted", "Daily earning limit exceeded");

      const result = await db.runTransaction(async (txn) => {
        // Update user streak doc
        const streakRef = db.collection("userStreaks").doc(uid);
        const streakSnap = await txn.get(streakRef as any);
        const today = new Date().toISOString().split("T")[0];

        let streak: UserStreak;
        if (!(streakSnap as any).exists) {
          streak = {userId: uid, missionId, streakCount: 1, lastCompletedDate: today, badges: [], xp: 10, updatedAt: new Date().toISOString()};
          txn.set(streakRef as any, streak);
        } else {
          const prev = (streakSnap as any).data() as UserStreak;
          const last = prev.lastCompletedDate || today;
          const lastDate = new Date(last);
          const curDate = new Date(today);
          const diffDays = Math.round((curDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          const nextStreak = diffDays === 1 ? prev.streakCount + 1 : diffDays === 0 ? prev.streakCount : 1;
          const newXp = prev.xp + 10;
          streak = {...prev, missionId, streakCount: nextStreak, lastCompletedDate: today, xp: newXp, updatedAt: new Date().toISOString()};
          txn.update(streakRef as any, streak);
        }

        // Grant badges on milestones
        const badgesToGrant: string[] = [];
        if (streak.streakCount === 7) badgesToGrant.push("Streak-7");
        if (streak.streakCount === 30) badgesToGrant.push("Streak-30");
        if (badgesToGrant.length) {
          const updatedBadges = Array.from(new Set([...(streak.badges || []), ...badgesToGrant]));
          txn.update(streakRef as any, {badges: updatedBadges});
          streak.badges = updatedBadges;
        }

        // Update wallet
        const walletRef = db.collection("wallets").doc(uid);
        const walletSnap = await txn.get(walletRef as any);
        let updatedWallet: Wallet;
        if (!(walletSnap as any).exists) {
          updatedWallet = {
            walletId: uid,
            id: uid,
            entityId: uid,
            userId: uid,
            inrBalance: 0,
            healCoins: mission.rewardCoins,
            totalEarned: mission.rewardCoins,
            totalRedeemed: 0,
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            dailyEarnLimit: DAILY_EARN_LIMIT,
            monthlyEarnLimit: MONTHLY_REDEEM_LIMIT,
          };
          txn.set(walletRef as any, updatedWallet);
        } else {
          const wallet = (walletSnap as any).data() as Wallet;
          updatedWallet = {...wallet, healCoins: wallet.healCoins + mission.rewardCoins, lastUpdated: new Date().toISOString()};
          txn.update(walletRef as any, {healCoins: updatedWallet.healCoins, lastUpdated: updatedWallet.lastUpdated});
        }

        return {streak, updatedWallet};
      });

      await logAudit(
        "completeMission",
        uid,
        missionId,
        {},
        {
          rewardCoins: mission.rewardCoins,
          streakCount: result.streak.streakCount,
          badges: result.streak.badges,
        },
        "gamificationFunctions"
      );

      await logUserActivity(
        uid,
        "missionCompleted",
        {missionId, rewardCoins: mission.rewardCoins},
        "gamificationFunctions"
      );

      return {success: true};
    } catch (error) {
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError("internal", "Failed to complete mission");
    }
  }
);

export const getUserStreak = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<undefined>) => {
    try {
      const uid = SecurityHelpers.validateAuth(request);
      const snap = await db.collection("userStreaks").doc(uid).get();
      return {success: true, data: snap.exists ? snap.data() : null};
    } catch (error) {
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError("internal", "Failed to get user streak");
    }
  }
);


