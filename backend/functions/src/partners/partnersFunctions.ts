import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {SecurityHelpers} from "../lib/securityHelpers";
import {logAudit} from "../lib/auditService";
import {Partner} from "../types";

export const createPartner = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ name: string; type: "NGO" | "Brand"; contactEmail?: string; contactPhone?: string; logoUrl?: string; websiteUrl?: string }>) => {
    const uid = SecurityHelpers.validateAuth(request);
    if (!request.auth?.token?.admin) {
      throw new functions.https.HttpsError("permission-denied", "Admin required");
    }
    SecurityHelpers.validateRequired(request.data || {}, ["name", "type"]);
    const partnerId = `partner_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();
    const partner: Partner = {
      partnerId,
      name: request.data!.name,
      type: request.data!.type,
      contactEmail: request.data!.contactEmail,
      contactPhone: request.data!.contactPhone,
      logoUrl: request.data!.logoUrl,
      websiteUrl: request.data!.websiteUrl,
      isActive: true,
      createdAt: now,
      createdBy: uid,
      updatedAt: now,
    };
    await db.collection("partners").doc(partnerId).set(partner);
    await logAudit(
      "createPartner",
      uid,
      partnerId,
      {},
      {name: partner.name, type: partner.type},
      "PartnersService"
    );
    return {success: true, data: partner};
  }
);

export const updatePartner = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ partnerId: string; updates: Partial<Partner> }>) => {
    const uid = SecurityHelpers.validateAuth(request);
    if (!request.auth?.token?.admin) {
      throw new functions.https.HttpsError("permission-denied", "Admin required");
    }
    SecurityHelpers.validateRequired(request.data || {}, ["partnerId", "updates"]);
    const {partnerId, updates} = request.data!;
    (updates as any).updatedAt = new Date().toISOString();
    await db.collection("partners").doc(partnerId).set(updates, {merge: true});
    await logAudit(
      "updatePartner",
      uid,
      partnerId,
      {},
      {updates},
      "PartnersService"
    );
    return {success: true};
  }
);

export const listPartners = functions.https.onCall(
  {region: "asia-south1"},
  async () => {
    const snap = await db.collection("partners").where("isActive", "==", true).orderBy("createdAt", "desc").get();
    return {success: true, data: snap.docs.map((d) => d.data())};
  }
);


