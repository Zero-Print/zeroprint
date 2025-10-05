import * as functions from "firebase-functions/v2";
import {CallableRequest, HttpsError} from "firebase-functions/v2/https";
import {db} from "../lib/firebase";
import {NotificationService, SendGridProvider, TwilioProvider, FCMProvider, NotificationPayload} from "./notificationService";
import {getSecretValue} from "../lib/secrets";
import {dispatchRedeem as simDispatch, syncInventory as simSync} from "./csrAdapters/simulator";
import {GeoService} from "./geoService";

export const sendNotification = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<NotificationPayload & { preview?: boolean; testSend?: boolean }>) => {
    const payload = request.data as any;
    if (!payload?.userId || !payload?.channel || !payload?.templateId) throw new HttpsError("invalid-argument", "Missing fields");
    // Respect user preferences
    const userDoc = await db.collection("users").doc(payload.userId).get();
    const prefs = userDoc.data()?.notifications || {email: true, sms: false, push: false};
    if (!prefs[payload.channel]) return {success: false, skipped: true, reason: "opt-out"} as any;

    // Load template and render (simplified)
    const tplSnap = await db.collection("notificationTemplates").doc(payload.templateId).get();
    if (!tplSnap.exists) throw new HttpsError("not-found", "Template not found");
    const tpl = tplSnap.data() as any;
    const variables = payload.variables || {};
    const render = (s: string) => String(s || "").replace(/{{\s*(\w+)\s*}}/g, (_m, k) => variables[k] ?? "");
    const rendered = {subject: render(tpl.subject || ""), body: render(tpl.body || ""), channel: tpl.channel};

    if (payload.preview) {
      return {success: true, preview: rendered};
    }

    // Simple per-user per-day rate limit (default 5/day)
    const today = new Date().toISOString().slice(0, 10);
    const limit = userDoc.data()?.notificationLimitPerDay ?? 5;
    const countSnap = await db.collection("notificationLogs")
      .where("userId", "==", payload.userId)
      .where("sentAt", ">=", `${today}T00:00:00.000Z`).get();
    if (countSnap.size >= limit) {
      return {success: false, skipped: true, reason: "rate-limited"} as any;
    }

    const [sendgridKey, twilioSid, twilioToken, twilioFrom, fcmKey] = await Promise.all([
      getSecretValue("SENDGRID_API_KEY"),
      getSecretValue("TWILIO_SID"),
      getSecretValue("TWILIO_TOKEN"),
      getSecretValue("TWILIO_FROM"),
      getSecretValue("FCM_SERVER_KEY"),
    ]);

    const primary: (SendGridProvider|TwilioProvider|FCMProvider) = payload.channel === "email" ? new SendGridProvider(sendgridKey || "") :
      payload.channel === "sms" ? new TwilioProvider(twilioSid || "", twilioToken || "", twilioFrom || "") :
        new FCMProvider(fcmKey || "");
    const service = new NotificationService(primary);

    // If testSend: only send to payload.to
    const res = await service.send({...payload, variables});

    const logId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await db.collection("notificationLogs").doc(logId).set({
      logId,
      userId: payload.userId,
      channel: payload.channel,
      templateId: payload.templateId,
      status: res.status,
      sentAt: new Date().toISOString(),
      response: {providerId: res.providerId, error: res.error},
    });
    return {success: res.status === "sent", logId};
  }
);

export const dispatchRedemption = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ redemptionId: string }>) => {
    const {redemptionId} = request.data || {} as any;
    if (!redemptionId) throw new HttpsError("invalid-argument", "redemptionId required");
    const doc = await db.collection("redemptions").doc(redemptionId).get();
    if (!doc.exists) throw new HttpsError("not-found", "Redemption not found");
    const redemption = doc.data();
    const partner = redemption?.partnerId || "simulator";
    const partnerCfg = await db.collection("partnerConfigs").doc(partner).get();
    const cfg = partnerCfg.exists ? partnerCfg.data() : {};
    const res = await simDispatch(cfg, redemption);
    const updates: any = res.success ? {status: "fulfilled", voucherCode: res.voucherCode, fulfilledAt: new Date().toISOString()} : {status: "failed", failureReason: res.message};
    await db.collection("redemptions").doc(redemptionId).update(updates);
    return {success: res.success, message: res.message, voucherCode: res.voucherCode};
  }
);

export const partnerWebhook = functions.https.onRequest({region: "asia-south1"}, async (req, res) => {
  try {
    const redemptionId = req.body?.redemptionId as string;
    const status = req.body?.status as string;
    if (!redemptionId || !status) {
      res.status(400).json({error: "bad request"}); return;
    }
    // TODO: validate signature
    await db.collection("redemptions").doc(redemptionId).set({status, webhookAt: new Date().toISOString()}, {merge: true});
    res.json({ok: true});
  } catch (e: any) {
    res.status(500).json({error: e?.message || "failed"});
  }
});

export const reverseGeocodeAndTag = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ lat: number; lng: number; actionId: string; collection: "wasteLogs"|"ecoActionLogs" }>) => {
    const {lat, lng, actionId, collection} = request.data || {} as any;
    if (typeof lat !== "number" || typeof lng !== "number" || !actionId || !collection) throw new HttpsError("invalid-argument", "lat,lng,actionId,collection required");
    const geo = new GeoService(process.env.GEO_PROVIDER as any || "local", process.env.GOOGLE_MAPS_API_KEY);
    const result = await geo.reverseGeocode(lat, lng);
    await db.collection(collection).doc(actionId).set({wardId: result.wardId}, {merge: true});
    return {success: true, wardId: result.wardId};
  }
);

export const syncPartnerInventory = functions.scheduler.onSchedule(
  {region: "asia-south1", schedule: "0 1 * * *"},
  async () => {
    const partners = await db.collection("partnerConfigs").where("enabled", "==", true).get();
    for (const doc of partners.docs) {
      const items = await simSync(doc.data());
      for (const it of items) {
        await db.collection("rewards").doc(it.rewardId).set({stock: it.stock, updatedAt: new Date().toISOString()}, {merge: true});
      }
    }
  }
);

export const testPartnerConnection = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ partnerId: string }>) => {
    const {partnerId} = request.data || {} as any;
    if (!partnerId) throw new HttpsError("invalid-argument", "partnerId required");
    const cfgDoc = await db.collection("partnerConfigs").doc(partnerId).get();
    const cfg = cfgDoc.exists ? cfgDoc.data() : {};
    try {
      const inv = await simSync(cfg);
      return {success: true, items: inv?.length || 0};
    } catch (e: any) {
      return {success: false, error: e?.message || "failed"};
    }
  }
);


