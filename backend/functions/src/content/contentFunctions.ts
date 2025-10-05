import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {SecurityHelpers} from "../lib/securityHelpers";
import {logAudit, logUserActivity} from "../lib/auditService";
import {ContentItem, RecommendationItem} from "../types";

export const createContent = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<Omit<ContentItem, "contentId" | "createdAt" | "createdBy">>) => {
    const uid = SecurityHelpers.validateAuth(request);
    if (!request.auth?.token?.admin) {
      throw new functions.https.HttpsError("permission-denied", "Admin required");
    }
    SecurityHelpers.validateRequired(request.data || {}, ["title", "type", "language", "category"]);
    const contentId = `content_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();
    const item: ContentItem = {
      contentId,
      createdAt: now,
      createdBy: uid,
      ...request.data!,
    };
    await db.collection("content").doc(contentId).set(item);
    await logAudit(
      "createContent",
      uid,
      contentId,
      {},
      {title: item.title, type: item.type, language: item.language},
      "contentFunctions"
    );
    return {success: true, data: item};
  }
);

export const listContent = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ language?: string; category?: string; visibility?: string } | undefined>) => {
    let query: FirebaseFirestore.Query = db.collection("content");
    if (request?.data?.language) query = query.where("language", "==", request.data.language);
    if (request?.data?.category) query = query.where("category", "==", request.data.category);
    if (request?.data?.visibility) query = query.where("visibility", "==", request.data.visibility);
    const snap = await (query.orderBy("createdAt", "desc").limit(100) as any).get();
    return {success: true, data: snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => d.data())};
  }
);

export const generateRecommendations = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ userId?: string; language?: string } | undefined>) => {
    const uid = SecurityHelpers.validateAuth(request);
    const userId = request?.data?.userId || uid;
    const language = request?.data?.language || "en";

    // Simple rules engine example. In future, plug LLM.
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const carbonSnap = await db.collection("carbonLogs").where("userId", "==", userId).where("createdAt", ">=", weekAgo).get();
    const mentalSnap = await db.collection("mentalHealthLogs").where("userId", "==", userId).where("createdAt", ">=", weekAgo).get();

    const carTrips = carbonSnap.docs.filter((d) => (d.data() as any).actionType === "transport_car").length;
    const moodAvg = mentalSnap.docs.length ? mentalSnap.docs.reduce((s, d) => s + ((d.data() as any).mood || 0), 0) / mentalSnap.docs.length : 0;

    const messages: string[] = [];
    if (carTrips >= 5) messages.push("You logged 5+ car trips. Try public transport twice to save ~3kg CO₂.");
    if (moodAvg < 6) messages.push("Low mood week? A short nature walk can boost your Eco-Mind score.");
    if (messages.length === 0) messages.push("Great consistency! Consider switching two lights to LEDs this week.");

    const rec: RecommendationItem = {
      recommendationId: `${userId}_${Date.now()}`,
      userId,
      message: messages[0],
      language,
      category: "personalized",
      createdAt: new Date().toISOString(),
    };
    await db.collection("recommendations").doc(rec.recommendationId).set(rec);
    await logUserActivity(
      userId,
      "recommendationGenerated",
      {message: rec.message},
      "contentFunctions"
    );
    return {success: true, data: rec};
  }
);


