import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {logAudit} from "../lib/auditService";
import {SecurityHelpers} from "../lib/securityHelpers";

interface Ambassador {
  userId: string;
  code: string;
  region?: string;
  role?: "City Ambassador" | "School Ambassador" | "MSME Ambassador";
  totalReferrals: number;
  approvedReferrals: number;
  createdAt: string;
  updatedAt: string;
}

interface Referral {
  referralId: string;
  code: string;
  ambassadorId: string;
  referredUserId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string;
}

interface SpotlightStory {
  storyId: string;
  userId: string;
  title: string;
  description?: string;
  mediaUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string;
}

export const registerAmbassador = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ region?: string; role?: Ambassador["role"] }>) => {
    const uid = SecurityHelpers.validateAuth(request);
    const region = request.data?.region;
    const role = request.data?.role;

    const code = `AMB-${uid.substring(0, 6).toUpperCase()}`;
    const ref = db.collection("ambassadors").doc(uid);
    const now = new Date().toISOString();
    const ambassador: Ambassador = {
      userId: uid,
      code,
      region,
      role,
      totalReferrals: 0,
      approvedReferrals: 0,
      createdAt: now,
      updatedAt: now,
    };
    await ref.set(ambassador, {merge: true});

    await logAudit(
      "registerAmbassador",
      uid,
      uid,
      {},
      {code, region, role},
      "communityFunctions"
    );

    return {success: true, data: ambassador};
  }
);

export const submitReferral = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ code: string }>) => {
    const uid = SecurityHelpers.validateAuth(request);
    SecurityHelpers.validateRequired(request.data || {}, ["code"]);
    const {code} = request.data!;

    const ambSnap = await db.collection("ambassadors").where("code", "==", code).limit(1).get();
    if (ambSnap.empty) {
      throw new functions.https.HttpsError("not-found", "Invalid ambassador code");
    }
    const ambassador = ambSnap.docs[0].data() as Ambassador;

    const referralId = `ref_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const referral: Referral = {
      referralId,
      code,
      ambassadorId: ambassador.userId,
      referredUserId: uid,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    await db.collection("referrals").doc(referralId).set(referral);

    await db.collection("ambassadors").doc(ambassador.userId).set({
      totalReferrals: (ambassador.totalReferrals || 0) + 1,
      updatedAt: new Date().toISOString(),
    }, {merge: true});

    await logAudit(
      "submitReferral",
      uid,
      referralId,
      {},
      {code, ambassadorId: ambassador.userId},
      "communityFunctions"
    );

    return {success: true, data: {referralId}};
  }
);

export const approveReferral = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ referralId: string }>) => {
    const uid = SecurityHelpers.validateAuth(request);
    if (!request.auth?.token?.admin) {
      throw new functions.https.HttpsError("permission-denied", "Admin required");
    }
    SecurityHelpers.validateRequired(request.data || {}, ["referralId"]);
    const {referralId} = request.data!;

    const ref = db.collection("referrals").doc(referralId);
    const snap = await ref.get();
    if (!snap.exists) throw new functions.https.HttpsError("not-found", "Referral not found");
    const referral = snap.data() as Referral;

    if (referral.status === "approved") {
      return {success: true, data: {message: "Already approved"}};
    }

    await db.runTransaction(async (tx) => {
      tx.update(ref, {status: "approved", approvedAt: new Date().toISOString()});
      const ambRef = db.collection("ambassadors").doc(referral.ambassadorId);
      const ambSnap = await tx.get(ambRef);
      const amb = ambSnap.data() as Ambassador;
      tx.update(ambRef, {
        approvedReferrals: (amb?.approvedReferrals || 0) + 1,
        updatedAt: new Date().toISOString(),
      });
    });

    try {
      const {WalletService} = await import("../services/walletService");
      const walletSvc = new WalletService();
      await walletSvc.creditCoins(referral.ambassadorId, 25, "Ambassador referral approved", "bonus");
    } catch (e) {
      console.error("Failed to credit ambassador coins", e);
    }

    await logAudit(
      "approveReferral",
      uid,
      referralId,
      {},
      {ambassadorId: referral.ambassadorId, referredUserId: referral.referredUserId},
      "communityFunctions"
    );

    return {success: true};
  }
);

export const getAmbassadorStats = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<undefined>) => {
    const uid = SecurityHelpers.validateAuth(request);
    const amb = await db.collection("ambassadors").doc(uid).get();
    return {success: true, data: amb.exists ? amb.data() : null};
  }
);

export const submitSpotlightStory = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ title: string; description?: string; mediaUrl?: string }>) => {
    const uid = SecurityHelpers.validateAuth(request);
    SecurityHelpers.validateRequired(request.data || {}, ["title"]);
    const {title, description, mediaUrl} = request.data!;
    const storyId = `story_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const story: SpotlightStory = {
      storyId,
      userId: uid,
      title,
      description,
      mediaUrl,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    await db.collection("spotlightStories").doc(storyId).set(story);
    await logAudit(
      "submitSpotlightStory",
      uid,
      storyId,
      {},
      {title},
      "communityFunctions"
    );
    return {success: true, data: {storyId}};
  }
);

export const reviewSpotlightStory = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ storyId: string; action: "approve" | "reject" }>) => {
    const uid = SecurityHelpers.validateAuth(request);
    if (!request.auth?.token?.admin) {
      throw new functions.https.HttpsError("permission-denied", "Admin required");
    }
    SecurityHelpers.validateRequired(request.data || {}, ["storyId", "action"]);
    const {storyId, action} = request.data!;
    const ref = db.collection("spotlightStories").doc(storyId);
    const snap = await ref.get();
    if (!snap.exists) throw new functions.https.HttpsError("not-found", "Story not found");
    const updates = action === "approve" ? {status: "approved", approvedAt: new Date().toISOString()} : {status: "rejected"};
    await ref.update(updates);
    await logAudit(
      "reviewSpotlightStory",
      uid,
      storyId,
      {},
      {action},
      "communityFunctions"
    );
    return {success: true};
  }
);

export const listSpotlightStories = functions.https.onCall(
  {region: "asia-south1"},
  async (_request: CallableRequest<{ status?: "approved" | "pending" } | undefined>) => {
    const status = _request?.data?.status || "approved";
    const q = await db.collection("spotlightStories").where("status", "==", status).orderBy("createdAt", "desc").limit(50).get();
    const stories = q.docs.map((d) => d.data());
    return {success: true, data: stories};
  }
);


