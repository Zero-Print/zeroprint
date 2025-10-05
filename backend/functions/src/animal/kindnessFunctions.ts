import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {SecurityHelpers} from "../lib/securityHelpers";
import {logAudit} from "../lib/auditService";

interface KindnessAction {
  id: string;
  title: string;
  description?: string;
  regionTags: string[]; // e.g., ["IN-DL", "IN-KA"]
  baseCoins: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const addKindnessAction = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ title: string; description?: string; regionTags?: string[]; baseCoins?: number; isActive?: boolean }>) => {
    const uid = SecurityHelpers.validateAuth(request);
    if (!request.auth?.token?.admin) throw new functions.https.HttpsError("permission-denied", "Admin required");
    SecurityHelpers.validateRequired(request.data, ["title"]);
    const {title, description, regionTags = [], baseCoins = 5, isActive = true} = request.data!;
    const id = `kind_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();
    const action: KindnessAction = {id, title, description, regionTags, baseCoins, isActive, createdAt: now};
    await db.collection("kindnessActions").doc(id).set(action);
    await logAudit(
      "addKindnessAction",
      uid,
      id,
      {},
      {title, regionTags, baseCoins, isActive},
      "kindnessFunctions"
    );
    return {success: true, data: action};
  }
);

export const updateKindnessAction = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ id: string; updates: Partial<KindnessAction> }>) => {
    const uid = SecurityHelpers.validateAuth(request);
    if (!request.auth?.token?.admin) throw new functions.https.HttpsError("permission-denied", "Admin required");
    SecurityHelpers.validateRequired(request.data, ["id", "updates"]);
    const {id, updates} = request.data!;
    const ref = db.collection("kindnessActions").doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new functions.https.HttpsError("not-found", "Action not found");
    const patch = {...updates, updatedAt: new Date().toISOString()} as any;
    await ref.update(patch);
    await logAudit(
      "updateKindnessAction",
      uid,
      id,
      {},
      {updates},
      "kindnessFunctions"
    );
    return {success: true};
  }
);

export const listKindnessActions = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ region?: string; activeOnly?: boolean }>) => {
    SecurityHelpers.validateAuth(request);
    const region = request.data?.region?.toUpperCase();
    const activeOnly = request.data?.activeOnly !== false;
    let query: FirebaseFirestore.Query = db.collection("kindnessActions");
    if (activeOnly) query = query.where("isActive", "==", true);
    const snap = await query.get();
    let actions = snap.docs.map((d) => d.data() as KindnessAction);
    if (region) actions = actions.filter((a) => (a.regionTags || []).includes(region));
    return {success: true, data: actions};
  }
);

export const getKindnessActionById = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ id: string }>) => {
    SecurityHelpers.validateAuth(request);
    SecurityHelpers.validateRequired(request.data, ["id"]);
    const {id} = request.data!;
    const doc = await db.collection("kindnessActions").doc(id).get();
    if (!doc.exists) throw new functions.https.HttpsError("not-found", "Action not found");
    return {success: true, data: doc.data()};
  }
);


