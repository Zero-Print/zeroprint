import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {SecurityHelpers} from "../lib/securityHelpers";
import {logAudit, logUserActivity} from "../lib/auditService";
import {Competition, CompetitionScore} from "../types";

export const createCompetition = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<Omit<Competition, "competitionId" | "createdAt" | "createdBy" | "updatedAt">>) => {
    const uid = SecurityHelpers.validateAuth(request);
    if (!request.auth?.token?.admin) {
      throw new functions.https.HttpsError("permission-denied", "Admin required");
    }
    SecurityHelpers.validateRequired(request.data || {}, ["name", "type", "startDate", "endDate"]);
    const competitionId = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();
    const comp: Competition = {
      competitionId,
      name: request.data!.name,
      type: request.data!.type,
      startDate: request.data!.startDate,
      endDate: request.data!.endDate,
      rewardPool: request.data!.rewardPool,
      isActive: true,
      createdAt: now,
      createdBy: uid,
      updatedAt: now,
      participants: request.data!.participants || [],
    };
    await db.collection("competitions").doc(competitionId).set(comp);
    await logAudit(
      "createCompetition",
      uid,
      competitionId,
      {},
      {name: comp.name, type: comp.type},
      "competitionsFunctions"
    );
    return {success: true, data: comp};
  }
);

export const updateCompetitionScore = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ competitionId: string; groupId: string; groupName?: string; deltaPoints: number; deltaHealCoins?: number }>) => {
    const uid = SecurityHelpers.validateAuth(request);
    SecurityHelpers.validateRequired(request.data || {}, ["competitionId", "groupId", "deltaPoints"]);
    const {competitionId, groupId, groupName, deltaPoints, deltaHealCoins = 0} = request.data!;
    const id = `${competitionId}_${groupId}`;
    const now = new Date().toISOString();
    await db.runTransaction(async (tx) => {
      const ref = db.collection("competitionScores").doc(id);
      const snap = await tx.get(ref);
      const curr = snap.exists ? (snap.data() as CompetitionScore) : {
        id,
        competitionId,
        groupId,
        groupName,
        totalPoints: 0,
        healCoinsEarned: 0,
        lastUpdated: now,
      } as CompetitionScore;
      const updated: CompetitionScore = {
        ...curr,
        groupName: groupName || curr.groupName,
        totalPoints: (curr.totalPoints || 0) + deltaPoints,
        healCoinsEarned: (curr.healCoinsEarned || 0) + deltaHealCoins,
        lastUpdated: now,
      };
      tx.set(ref, updated);
    });
    await logUserActivity(
      uid,
      "competitionScoreUpdated",
      {competitionId, groupId, deltaPoints},
      "competitionsFunctions"
    );
    return {success: true};
  }
);

export const listCompetitionScores = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ competitionId: string; limit?: number }>) => {
    SecurityHelpers.validateRequired(request.data || {}, ["competitionId"]);
    const {competitionId, limit = 50} = request.data!;
    const snap = await db.collection("competitionScores").where("competitionId", "==", competitionId).orderBy("totalPoints", "desc").limit(limit).get();
    return {success: true, data: snap.docs.map((d) => d.data())};
  }
);


