/* eslint-disable object-curly-spacing, @typescript-eslint/no-explicit-any, camelcase, max-len, @typescript-eslint/no-unused-vars */
import * as functions from "firebase-functions/v2";
import * as Sentry from "@sentry/node";
import express from "express";

// Initialize environment variables for development
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_ENV = process.env.NODE_ENV || "development";
  process.env.GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || "zeroprint-49afb";
  process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || "zeroprint-49afb";
  process.env.ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || "https://zeroprint.in,https://www.zeroprint.in,https://staging.zeroprint.in,https://admin.zeroprint.in,http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001";
  process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag";
  process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "thisissupersecret";
  process.env.LOG_LEVEL = process.env.LOG_LEVEL || "info";
}
import {backendSentry} from "./lib/sentry";
import {expressErrorHandler} from "./middleware/errorHandler";
import { corsMiddleware, handlePreflight } from "./middleware/cors";
import {auth as adminAuth, db } from "./lib/firebase";
import { timingMiddleware } from "./middleware/timing";
import { globalErrorHandler, initializeErrorHandlers } from "./middleware/globalErrorHandler";
import { securityMiddleware } from "./middleware/securityHeaders";
import { rateLimiting } from "./middleware/rateLimiting";
// import { loggingService } from "./services/loggingService"; // Unused
import { SubscriptionsService } from "./services/subscriptionsService";
import { RewardsService } from "./services/rewardsService";
import { logAudit } from "./lib/auditService";
// import { redeemCoins } from "./wallet/walletFunctions"; // Unused
// import { gameCollections } from "./lib/collections"; // Module doesn't exist

// Initialize Sentry
backendSentry.init();

// Initialize error handlers
initializeErrorHandlers();

const app = express();

// Security middleware (must be first)
app.use(securityMiddleware.httpsRedirect);
app.use(securityMiddleware.securityHeaders);
app.use(securityMiddleware.audit);

// Rate limiting middleware
app.use(rateLimiting.bypass);

// Sentry request handler (must be early)
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Basic middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Timing middleware for performance monitoring
app.use(timingMiddleware());

// Request ID middleware
app.use((req, res, next) => {
  req.headers["x-request-id"] = req.headers["x-request-id"] ||
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  next();
});

// Import HTTP router
import httpRouter from "./http/router";

// Routes
app.use("/api", httpRouter);

// Attach user from Authorization: Bearer <idToken> if present
app.use(async (req, _res, next) => {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.substring("Bearer ".length).trim();
      const decoded = await adminAuth.verifyIdToken(idToken);
      (req as any).user = {
        uid: decoded.uid,
        email: decoded.email,
        admin: (decoded as any).admin === true || (decoded as any).role === "admin",
      };
    }
  } catch (_e) {
    // ignore, route handlers can enforce auth when required
  }
  next();
});

const requireAuth: express.RequestHandler = (req, res, next) => {
  if (!(req as any).user?.uid) {
    res.status(401).json({success: false, error: {message: "Unauthorized", code: "UNAUTHORIZED"}});
    return;
  }
  next();
};

const requireAdmin: express.RequestHandler = (req, res, next) => {
  const user = (req as any).user;
  if (!user?.uid) {
    res.status(401).json({success: false, error: {message: "Unauthorized", code: "UNAUTHORIZED"}});
    return;
  }
  if (!user?.admin) {
    res.status(403).json({success: false, error: {message: "Forbidden: admin only", code: "FORBIDDEN"}});
    return;
  }
  next();
};

// Simple index route for quick manual checks
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ZeroPrint Functions API",
    endpoints: {
      health: "/api/health",
      info: "/api", // alias to this index
      callable_hint: "Most business endpoints are Firebase callable functions; invoke via POST with { data: ... } and Authorization",
      examples: [
        "/createSubscription (POST, callable)",
        "/rewards_getRewards (POST, callable)",
        "/processPaymentWebhook (POST, webhook)",
        "/api/subscriptions (POST)",
        "/api/subscriptions/me (GET)",
        "/api/rewards (GET)",
        "/api/rewards/:id (GET)",
        "/api/rewards/redeem (POST)",
        "/api/gameScores (POST, GET)",
        "/api/earnCoins (POST)",
        "/api/leaderboards/* (POST, GET)",
        "/api/activityLogs (POST)",
        "/api/auditLogs (POST)",
      ],
    },
    timestamp: new Date().toISOString(),
  });
});

// Export CO₂ monitoring function
export { monitorCO2Drop } from "./trackers/carbonMonitoring";

// Dashboard callable functions
export { getCitizenDashboardData } from "./dashboards/citizenDashboard";
export { getEntityDashboardData } from "./dashboards/entityDashboard";
export { getSchoolDashboardData } from "./dashboards/schoolDashboard";

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Convenience stubs for manual GET checks (non-auth routing)
app.get("/login", (_req, res) => res.redirect(302, "http://127.0.0.1:4000/auth"));
app.get("/signup", (_req, res) => res.redirect(302, "http://127.0.0.1:4000/auth"));

// Auth endpoints (dev convenience - proxy to Auth emulator if available)
// Apply CORS middleware to /auth endpoints
app.use("/auth", corsMiddleware, handlePreflight);

const resolveFirebaseAuthEndpoint = (path: string): { url: string; isEmulator: boolean } | null => {
  const emulatorHostRaw = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const isEmulator = process.env.FUNCTIONS_EMULATOR === "true" || !!emulatorHostRaw;

  if (isEmulator) {
    const emulatorHost = (emulatorHostRaw || "127.0.0.1:9099").replace(/^https?:\/\//, "");
    return {
      url: `http://${emulatorHost}/identitytoolkit.googleapis.com/v1/${path}?key=fake-api-key`,
      isEmulator: true,
    };
  }

  const apiKey = process.env.FIREBASE_WEB_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!apiKey) {
    return null;
  }

  return {
    url: `https://identitytoolkit.googleapis.com/v1/${path}?key=${apiKey}`,
    isEmulator: false,
  };
};

app.post("/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({success: false, error: {message: "email and password required"}});
      return;
    }

    const endpoint = resolveFirebaseAuthEndpoint("accounts:signUp");
    if (!endpoint) {
      res.status(500).json({
        success: false,
        error: {message: "Firebase API key not configured", code: "CONFIG_ERROR"},
      });
      return;
    }

    const resp = await fetch(endpoint.url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email, password, returnSecureToken: true}),
    });
    const data = await resp.json();

    if (!resp.ok) {
      res.status(resp.status).json({success: false, error: data});
      return;
    }

    res.json({success: true, idToken: data.idToken, refreshToken: data.refreshToken, localId: data.localId});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "signup failed"}});
    return;
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({success: false, error: {message: "email and password required"}});
      return;
    }

    const endpoint = resolveFirebaseAuthEndpoint("accounts:signInWithPassword");
    if (!endpoint) {
      res.status(500).json({
        success: false,
        error: {message: "Firebase API key not configured", code: "CONFIG_ERROR"},
      });
      return;
    }

    const resp = await fetch(endpoint.url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email, password, returnSecureToken: true}),
    });
    const data = await resp.json();
    if (!resp.ok) {
      res.status(resp.status).json({success: false, error: data});
      return;
    }
    res.json({success: true, idToken: data.idToken, refreshToken: data.refreshToken, localId: data.localId});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "login failed"}});
    return;
  }
});

// Subscriptions REST endpoints
const subscriptionsService = new SubscriptionsService();
const rewardsService = new RewardsService();

app.get("/subscriptions/plans", (_req, res) => {
  try {
    const plans = subscriptionsService.getSubscriptionPlans();
    res.json({success: true, data: plans});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to get plans"}});
    return;
  }
});

app.get("/subscriptions/me", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const sub = await subscriptionsService.getSubscriptionStatus(uid);
    res.json({success: true, data: sub});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to get subscription"}});
    return;
  }
});

app.post("/subscriptions", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const { planId } = req.body || {};
    if (!planId) {
      res.status(400).json({success: false, error: {message: "planId is required"}});
      return;
    }
    const result = await subscriptionsService.createCheckoutOrder(uid, planId, "", "");
    res.json({success: true, data: {orderId: result.orderId, razorpayOrder: {id: result.order.id, currency: result.currency, amount: result.amount}}});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to create subscription"}});
    return;
  }
});

app.post("/subscriptions/cancel", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const { subscriptionId, reason } = req.body || {};
    if (!subscriptionId) {
      res.status(400).json({success: false, error: {message: "subscriptionId is required"}});
      return;
    }
    await subscriptionsService.cancelSubscription(uid, subscriptionId, reason);
    res.json({success: true, message: "Subscription cancelled"});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to cancel subscription"}});
    return;
  }
});

// Rewards REST endpoints
app.get("/rewards", async (_req, res) => {
  try {
    const list = await rewardsService.getRewards();
    res.json({success: true, data: list});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to get rewards"}});
    return;
  }
});

app.get("/rewards/:id", async (req, res) => {
  try {
    const reward = await rewardsService.getReward(req.params.id);
    res.json({success: true, data: reward});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to get reward"}});
    return;
  }
});

// MSME ESG: log report download
app.get("/msmeReports/:id/download", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const id = req.params.id;
    const doc = await (await import("./lib/firebase")).db.collection("msmeReports").doc(id).get();
    if (!doc.exists) {
      res.status(404).json({success: false, error: {message: "Report not found"}});
      return;
    }
    const rpt: any = doc.data();
    await (await import("./lib/auditService")).logAudit(
      "esgReportDownload",
      uid,
      id,
      {},
      { versionId: rpt.versionId, contentHash: rpt.contentHash },
      "REST API"
    );
    res.redirect(302, rpt.pdfUrl);
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to download report"}});
    return;
  }
});

app.post("/rewards/redeem", requireAuth, async (req, res) => {
  try {
    // const uid = (req as any).user.uid; // Unused
    const { rewardId } = req.body || {};
    if (!rewardId) {
      res.status(400).json({success: false, error: {message: "rewardId is required"}});
      return;
    }
    // TODO: Fix redeemCoins call - needs proper CallableRequest type
    // const callableReq = {auth: {uid}, data: {rewardId}, rawRequest: req} as any;
    // const result = await redeemCoins(callableReq);
    res.json({success: false, error: {message: "Redeem coins not implemented in REST API"}});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to redeem"}});
    return;
  }
});

// Games & Leaderboards REST endpoints used by frontend GameIntegrationService
app.post("/gameScores", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const body = req.body || {};
    if (!body || body.userId !== uid) {
      res.status(400).json({success: false, error: {message: "Invalid userId"}});
      return;
    }
    const ref = db.collection("gameScores").doc();
    const score = {...body, scoreId: ref.id, createdAt: new Date().toISOString()};
    await ref.set(score);
    res.json({success: true});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to save game score"}});
    return;
  }
});

app.get("/gameScores", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const {userId, gameId, since, limit = "10", orderBy = "createdAt", order = "desc"} = req.query as Record<string, string>;
    if (userId && userId !== uid) {
      res.status(403).json({success: false, error: {message: "Forbidden"}});
      return;
    }
    let query: FirebaseFirestore.Query = db.collection("gameScores");
    query = query.where("userId", "==", uid);
    if (gameId) query = query.where("gameId", "==", gameId);
    if (since) query = query.where("createdAt", ">=", since);
    query = query.orderBy(orderBy as any, order as any).limit(Math.min(parseInt(limit, 10) || 10, 50));
    const snap = await (query as any).get();
    const data = snap.docs.map((d: any) => d.data());
    res.json(data);
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to get game scores"}});
    return;
  }
});

app.post("/earnCoins", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const { userId, gameId, coins } = req.body || {};
    if (userId !== uid) {
      res.status(400).json({success: false, error: {message: "userId mismatch"}});
      return;
    }

    const mod = await import("./wallet/walletFunctions");
    const callable = (mod as any).earnCoins as (arg: any) => Promise<any>;
    const result = await callable({auth: {uid}, data: {userId, gameId, coins}, rawRequest: req});
    const newBalance = result?.data?.updatedWallet?.healCoins ?? result?.updatedWallet?.healCoins ?? 0;
    res.json({success: true, newBalance});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to earn coins"}});
    return;
  }
});

app.post("/leaderboards/global", requireAuth, async (req, res) => {
  try {
    // Minimal stub: write aggregate entry
    const uid = (req as any).user.uid;
    const { delta = 0, score = 0, percentage = 0, gameId } = req.body || {};
    const ref = (await import("./lib/firebase")).db.collection("leaderboards/global").doc(uid);
    await ref.set({
      entryId: uid,
      userId: uid,
      score: score,
      percentage,
      coinsDelta: delta,
      gameId,
      period: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }, {merge: true});
    res.json({success: true});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to update global leaderboard"}});
    return;
  }
});

app.post("/leaderboards/game/:gameId", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const { score = 0, percentage = 0, coinsEarned = 0 } = req.body || {};
    const { gameId } = req.params;
    const ref = (await import("./lib/firebase")).db.collection(`leaderboards/game/${gameId}`).doc(uid);
    await ref.set({
      entryId: uid,
      userId: uid,
      score,
      percentage,
      coinsEarned,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }, {merge: true});
    res.json({success: true});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to update game leaderboard"}});
    return;
  }
});

app.post("/leaderboards/category/:category", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const { score = 0, percentage = 0, coinsEarned = 0 } = req.body || {};
    const { category } = req.params;
    const ref = (await import("./lib/firebase")).db.collection(`leaderboards/category/${category}`).doc(uid);
    await ref.set({
      entryId: uid,
      userId: uid,
      score,
      percentage,
      coinsEarned,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }, {merge: true});
    res.json({success: true});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to update category leaderboard"}});
    return;
  }
});

app.get("/leaderboards/rank/:userId", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const { userId } = req.params;
    if (userId !== uid) {
      res.status(403).json({success: false, error: {message: "Forbidden"}});
      return;
    }
    // Minimal stub: return rank 0 until aggregation job exists
    res.json({rank: 0});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to get rank"}});
    return;
  }
});

app.post("/activityLogs", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const body = req.body || {};
    const ref = (await import("./lib/firebase")).db.collection("activityLogs").doc();
    await ref.set({...body, userId: uid, createdAt: new Date().toISOString()});
    res.json({success: true});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to write activity log"}});
    return;
  }
});

app.post("/auditLogs", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const body = req.body || {};
    await logAudit(
      body.action || "unknown",
      uid,
      body.entityId || body.resourceId || uid,
      {},
      body.changes || body.details || {},
      "REST API"
    );
    res.json({success: true});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to write audit log"}});
    return;
  }
});

app.get("/rewards/redemptions/me", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const result = await rewardsService.getRedemptions(uid);
    res.json({success: true, data: result});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to get redemptions"}});
    return;
  }
});

app.get("/rewards/redemptions", requireAuth, async (req, res) => {
  try {
    // In a real app, check admin role here
    const uid = (req as any).user.uid;
    // const filters = {userId: req.query.userId as string | undefined, status: req.query.status as string | undefined}; // Unused
    const result = await rewardsService.getRedemptions(uid);
    res.json({success: true, data: result});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to get all redemptions"}});
    return;
  }
});

// Admin Integrations: Partners
app.get("/admin/integrations/partners", requireAdmin, async (_req, res) => {
  try {
    const snap = await db.collection("partnerConfigs").get();
    res.json({success: true, data: snap.docs.map((d) => d.data())});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to list partners"}});
    return;
  }
});

app.post("/admin/integrations/partners", requireAdmin, async (req, res) => {
  try {
    const { partnerId, name, enabled = true, apiUrl, authType, credentials } = req.body || {};
    if (!partnerId || !name) {
      res.status(400).json({success: false, error: {message: "partnerId and name required"}});
      return;
    }
    await db.collection("partnerConfigs").doc(partnerId).set({ partnerId, name, enabled, apiUrl, authType, credentials }, { merge: true });
    res.json({success: true});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to upsert partner"}});
    return;
  }
});

app.patch("/admin/integrations/partners/:partnerId", requireAdmin, async (req, res) => {
  try {
    const { partnerId } = req.params;
    const updates = req.body || {};
    if (!partnerId) {
      res.status(400).json({success: false, error: {message: "partnerId param required"}});
      return;
    }
    await db.collection("partnerConfigs").doc(partnerId).set(updates, { merge: true });
    res.json({success: true});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to update partner"}});
    return;
  }
});

app.post("/admin/integrations/partners/:partnerId/test", requireAdmin, async (req, res) => {
  try {
    const { partnerId } = req.params;
    const mod = await import("./integrations/integrationFunctions");
    const fn = (mod as any).testPartnerConnection as (arg: any) => Promise<any>;
    const result = await fn({ auth: { uid: (req as any).user.uid }, data: { partnerId }, rawRequest: req });
    res.json({success: true, data: result});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to test connection"}});
    return;
  }
});

// Admin Integrations: Notification logs
app.get("/admin/integrations/notifications/logs", requireAdmin, async (req, res) => {
  try {
    let q: FirebaseFirestore.Query = db.collection("notificationLogs");
    const { userId, status, channel, templateId, limit = "50" } = req.query as Record<string, string>;
    if (userId) q = q.where("userId", "==", userId);
    if (status && status !== "all") q = q.where("status", "==", status);
    if (channel) q = q.where("channel", "==", channel);
    if (templateId) q = q.where("templateId", "==", templateId);
    q = q.orderBy("sentAt", "desc").limit(Math.min(parseInt(limit, 10) || 50, 200));
    const snap = await (q as any).get();
    res.json({success: true, data: snap.docs.map((d: any) => d.data())});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to fetch notification logs"}});
    return;
  }
});

// Admin Integrations: Manual retry for failed redemptions
app.post("/admin/integrations/redemptions/retry", requireAdmin, async (req, res) => {
  try {
    const { partnerId, max = 10 } = req.body || {};
    let q: FirebaseFirestore.Query = db.collection("redemptions").where("status", "==", "failed");
    if (partnerId) q = q.where("partnerId", "==", partnerId);
    const snap = await (q as any).limit(Math.min(parseInt(String(max), 10) || 10, 50)).get();
    const ids = snap.docs.map((d: any) => d.id);
    const mod = await import("./integrations/integrationFunctions");
    const dispatch = (mod as any).dispatchRedemption as (arg: any) => Promise<any>;
    const uid = (req as any).user.uid;
    const results = await Promise.all(ids.map((redemptionId: string) => dispatch({ auth: { uid }, data: { redemptionId }, rawRequest: req } as any)
      .then((r: any) => ({ redemptionId, ok: true, r }))
      .catch((e: any) => ({ redemptionId, ok: false, error: e?.message || String(e) }))));
    res.json({success: true, retried: results});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to retry redemptions"}});
    return;
  }
});

// Admin Integrations: Wards GeoJSON
app.get("/admin/integrations/geo/wards", requireAdmin, async (_req, res) => {
  try {
    const snap = await db.collection("wards").get();
    res.json({success: true, data: snap.docs.map((d) => ({ wardId: d.id, ...(d.data() || {}) }))});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to list wards"}});
    return;
  }
});

app.get("/admin/integrations/geo/wards/:wardId", requireAdmin, async (req, res) => {
  try {
    const { wardId } = req.params;
    const doc = await db.collection("wards").doc(wardId).get();
    if (!doc.exists) {
      res.status(404).json({success: false, error: {message: "Ward not found"}});
      return;
    }
    res.json({success: true, data: { wardId: doc.id, ...(doc.data() || {}) }});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to get ward"}});
    return;
  }
});

app.post("/admin/integrations/geo/wards", requireAdmin, async (req, res) => {
  try {
    const { wardId, name, geojson } = req.body || {};
    if (!wardId || !geojson) {
      res.status(400).json({success: false, error: {message: "wardId and geojson required"}});
      return;
    }
    // Minimal validation that it's JSON and contains features/geometry
    if (typeof geojson !== "object") {
      res.status(400).json({success: false, error: {message: "geojson must be an object"}});
      return;
    }
    await db.collection("wards").doc(wardId).set({ wardId, name: name || wardId, geojson, updatedAt: new Date().toISOString() }, { merge: true });
    res.json({success: true});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to upsert ward"}});
    return;
  }
});

// Admin Integrations: Notification Templates CRUD
app.get("/admin/integrations/templates", requireAdmin, async (_req, res) => {
  try {
    const snap = await db.collection("notificationTemplates").get();
    res.json({success: true, data: snap.docs.map((d) => ({ templateId: d.id, ...(d.data() || {}) }))});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to list templates"}});
    return;
  }
});

app.get("/admin/integrations/templates/:templateId", requireAdmin, async (req, res) => {
  try {
    const { templateId } = req.params;
    const doc = await db.collection("notificationTemplates").doc(templateId).get();
    if (!doc.exists) {
      res.status(404).json({success: false, error: {message: "Template not found"}});
      return;
    }
    res.json({success: true, data: { templateId: doc.id, ...(doc.data() || {}) }});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to get template"}});
    return;
  }
});

app.post("/admin/integrations/templates", requireAdmin, async (req, res) => {
  try {
    const { templateId, channel, subject, body } = req.body || {};
    if (!templateId || !channel) {
      res.status(400).json({success: false, error: {message: "templateId and channel required"}});
      return;
    }
    await db.collection("notificationTemplates").doc(templateId).set({ templateId, channel, subject: subject || "", body: body || "", updatedAt: new Date().toISOString() }, { merge: true });
    res.json({success: true});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to upsert template"}});
    return;
  }
});

app.patch("/admin/integrations/templates/:templateId", requireAdmin, async (req, res) => {
  try {
    const { templateId } = req.params;
    const updates = req.body || {};
    await db.collection("notificationTemplates").doc(templateId).set({...updates, updatedAt: new Date().toISOString()}, { merge: true });
    res.json({success: true});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to update template"}});
    return;
  }
});

app.delete("/admin/integrations/templates/:templateId", requireAdmin, async (req, res) => {
  try {
    const { templateId } = req.params;
    await db.collection("notificationTemplates").doc(templateId).delete();
    res.json({success: true});
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to delete template"}});
    return;
  }
});

// Games REST endpoints
app.get("/games", async (_req, res) => {
  try {
    const snap = await db.collection("games").where("isActive", "==", true).get();
    const list = snap.docs.map((d) => ({ gameId: d.id, ...d.data() }));
    res.json(list);
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to get games"}});
    return;
  }
});

app.get("/games/:id", async (req, res) => {
  try {
    const doc = await db.collection("games").doc(req.params.id).get();
    if (!doc.exists) {
      res.status(404).json({success: false, error: {message: "Game not found"}});
      return;
    }
    res.json({ gameId: doc.id, ...doc.data() });
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to get game"}});
    return;
  }
});

// Wallet REST endpoints
app.get("/wallet/balance", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const mod = await import("./wallet/walletFunctions");
    const callable = (mod as any).getWalletBalance as (arg: any) => Promise<any>;
    const result = await callable({ auth: { uid }, data: { userId: uid }, rawRequest: req });
    res.json(result?.data || { wallet: null, hasWallet: false });
    return;
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e?.message || "failed to get wallet balance" } });
    return;
  }
});

app.post("/wallet/earn", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const { gameId = "manual", coins } = req.body || {};
    if (typeof coins !== "number" || coins <= 0) {
      res.status(400).json({ success: false, error: { message: "coins must be positive" } });
      return;
    }
    const mod = await import("./wallet/walletFunctions");
    const callable = (mod as any).earnCoins as (arg: any) => Promise<any>;
    const result = await callable({ auth: { uid }, data: { userId: uid, gameId, coins }, rawRequest: req });
    res.json({ success: true, data: result?.data || {} });
    return;
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e?.message || "failed to earn coins" } });
    return;
  }
});

app.post("/wallet/redeem", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const { amount, rewardId } = req.body || {};
    if (typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ success: false, error: { message: "amount must be positive" } });
      return;
    }
    const mod = await import("./wallet/walletFunctions");
    const callable = (mod as any).redeemCoins as (arg: any) => Promise<any>;
    const result = await callable({ auth: { uid }, data: { userId: uid, amount, rewardId }, rawRequest: req });
    res.json({ success: true, data: result?.data || {} });
    return;
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e?.message || "failed to redeem" } });
    return;
  }
});

// Trackers REST endpoints
app.get("/trackers/carbon", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    let q: FirebaseFirestore.Query = db.collection("carbonLogs").where("userId", "==", uid);
    q = q.orderBy("timestamp", "desc").limit(50);
    const snap = await (q as any).get();
    res.json({ success: true, data: snap.docs.map((d: any) => d.data()) });
    return;
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e?.message || "failed to fetch carbon logs" } });
    return;
  }
});

app.post("/trackers/carbon", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const { actionType, value, description, location } = req.body || {};
    const mod = await import("./trackers/trackerFunctions");
    const callable = (mod as any).logCarbonAction as (arg: any) => Promise<any>;
    const result = await callable({ auth: { uid }, data: { userId: uid, actionType, value, description, location }, rawRequest: req });
    res.json({ success: true, data: result?.data || {} });
    return;
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e?.message || "failed to log carbon" } });
    return;
  }
});

app.delete("/trackers/carbon/:logId", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const { logId } = req.params;
    const doc = await db.collection("carbonLogs").doc(logId).get();
    if (!doc.exists || (doc.data() as any).userId !== uid) {
      res.status(404).json({ success: false, error: { message: "Not found" } });
      return;
    }
    await db.collection("carbonLogs").doc(logId).delete();
    res.json({ success: true });
    return;
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e?.message || "failed to delete" } });
    return;
  }
});

app.get("/trackers/mood", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    let q: FirebaseFirestore.Query = db.collection("mentalHealthLogs").where("userId", "==", uid);
    q = q.orderBy("timestamp", "desc").limit(50);
    const snap = await (q as any).get();
    res.json({ success: true, data: snap.docs.map((d: any) => d.data()) });
    return;
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e?.message || "failed to fetch mood logs" } });
    return;
  }
});

app.post("/trackers/mood", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const { mood, note, activities } = req.body || {};
    const mod = await import("./trackers/trackerFunctions");
    const callable = (mod as any).logMoodCheckin as (arg: any) => Promise<any>;
    const result = await callable({ auth: { uid }, data: { userId: uid, mood, note, activities }, rawRequest: req });
    res.json({ success: true, data: result?.data || {} });
    return;
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e?.message || "failed to log mood" } });
    return;
  }
});

app.get("/trackers/animal", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    let q: FirebaseFirestore.Query = db.collection("animalWelfareLogs").where("userId", "==", uid);
    q = q.orderBy("timestamp", "desc").limit(50);
    const snap = await (q as any).get();
    res.json({ success: true, data: snap.docs.map((d: any) => d.data()) });
    return;
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e?.message || "failed to fetch animal logs" } });
    return;
  }
});

app.post("/trackers/animal", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const { actions, description } = req.body || {};
    const mod = await import("./trackers/trackerFunctions");
    const callable = (mod as any).logAnimalAction as (arg: any) => Promise<any>;
    const result = await callable({ auth: { uid }, data: { userId: uid, actions, description }, rawRequest: req });
    res.json({ success: true, data: result?.data || {} });
    return;
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e?.message || "failed to log animal action" } });
    return;
  }
});

// Dashboards REST endpoints (proxy to callables)
app.get("/dashboard/citizen", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const timeframe = (req.query.timeframe as string) || "7d";
    const mod = await import("./dashboards/citizenDashboard");
    const callable = (mod as any).getCitizenDashboardData as (arg: any) => Promise<any>;
    const result = await callable({ auth: { uid }, data: { userId: uid, timeframe }, rawRequest: req });
    res.json({ success: true, data: result?.data || {} });
    return;
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e?.message || "failed to get citizen dashboard" } });
    return;
  }
});

app.get("/dashboard/entity", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const timeframe = (req.query.timeframe as string) || "7d";
    const mod = await import("./dashboards/entityDashboard");
    const callable = (mod as any).getEntityDashboardData as (arg: any) => Promise<any>;
    const result = await callable({ auth: { uid }, data: { userId: uid, timeframe }, rawRequest: req });
    res.json({ success: true, data: result?.data || {} });
    return;
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e?.message || "failed to get entity dashboard" } });
    return;
  }
});

app.get("/dashboard/govt", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const timeframe = (req.query.timeframe as string) || "7d";
    const mod = await import("./dashboards/citizenDashboard");
    const callable = (mod as any).getGovernmentDashboardData as (arg: any) => Promise<any>;
    if (!callable) {
      res.json({ success: true, data: {} }); return;
    }
    const result = await callable({ auth: { uid }, data: { userId: uid, timeframe }, rawRequest: req });
    res.json({ success: true, data: result?.data || {} });
    return;
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e?.message || "failed to get govt dashboard" } });
    return;
  }
});

// Admin Analytics REST endpoints (proxies)
app.get("/admin/analytics", requireAdmin, async (req, res) => {
  try {
    const timeRange = (req.query.timeRange as string) || "7d";
    const mod = await import("./monitoring/monitoringFunctions");
    const callable = (mod as any).generateAnalyticsReport as (arg: any) => Promise<any>;
    const result = await callable({ data: { timeRange }, rawRequest: req } as any);
    res.json({ success: true, data: result?.data?.data || {} });
    return;
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e?.message || "failed to get analytics" } });
    return;
  }
});

app.get("/admin/analytics/export", requireAdmin, async (req, res) => {
  try {
    const timeRange = (req.query.timeRange as string) || "7d";
    const format = (req.query.format as string) || "csv";
    const mod = await import("./monitoring/monitoringFunctions");
    const callable = (mod as any).exportAnalyticsReport as (arg: any) => Promise<any>;
    const result = await callable({ data: { timeRange, format }, rawRequest: req } as any);
    res.json({ success: true, format, data: result?.data?.data || "" });
    return;
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: e?.message || "failed to export analytics" } });
    return;
  }
});
app.post("/games/:id/start", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).user.uid;
    const gameId = req.params.id;
    const doc = await db.collection("games").doc(gameId).get();
    if (!doc.exists) {
      res.status(404).json({success: false, error: {message: "Game not found"}});
      return;
    }
    const instance = {
      instanceId: `inst_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      gameId,
      userId: uid,
      status: "in_progress",
      createdAt: new Date().toISOString(),
    };
    await db.collection("gameInstances").doc(instance.instanceId).set(instance);
    res.json(instance);
    return;
  } catch (e: any) {
    res.status(500).json({success: false, error: {message: e?.message || "failed to start game"}});
    return;
  }
});

// Utility: client IP for frontend logs
app.get("/client-ip", (req, res) => {
  const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || req.ip || "unknown";
  res.json({ ip });
});

// Sentry error handler (must be before other error handlers)
app.use(Sentry.Handlers.errorHandler());

// Custom error handler
// Global error handler (must be last)
app.use(globalErrorHandler);
app.use(expressErrorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Endpoint not found",
      code: "NOT_FOUND",
      requestId: req.headers["x-request-id"],
    },
  });
});

// Export Cloud Function
export const api = functions.https.onRequest(
  {
    region: "asia-south1",
    timeoutSeconds: 540,
    memory: "2GiB",
  },
  app
);

// Background functions with Sentry integration
export const processDeploymentLogs = functions.firestore.onDocumentCreated(
  {
    region: "asia-south1",
    document: "deploymentLogs/{logId}",
  },
  async (evt) => {
    const snap = evt.data;
    if (!snap) return;

    try {
      const log = snap.data();

      if (log.status === "failed") {
        await backendSentry.captureMessage(
          `Deployment failed: ${log.environment}`,
          "error",
          {
            metadata: {
              logId: evt.params.logId,
              environment: log.environment,
              error: log.error,
            },
          }
        );
      }
    } catch (error) {
      await backendSentry.captureError(error as Error, {
        metadata: {
          function: "processDeploymentLogs",
          logId: evt.params.logId,
        },
      });
    }
  });

export const cleanupExpiredData = functions.scheduler.onSchedule(
  {
    region: "asia-south1",
    schedule: "0 2 * * *", // Daily at 2 AM
  },
  async (_evt) => {
    try {
      // Cleanup logic here
      console.log("Running daily cleanup...");

      await backendSentry.captureMessage(
        "Daily cleanup completed successfully",
        "info"
      );
    } catch (error) {
      await backendSentry.captureError(error as Error, {
        metadata: {
          function: "cleanupExpiredData",
          scheduledTime: new Date().toISOString(),
        },
      });
      throw error;
    }
  });

// Wallet & Rewards Functions
export { earnCoins, redeemCoins, getWalletBalance } from "./wallet/walletFunctions";

// Subscription & Payment Functions
export {
  getSubscriptionPlans,
  getUserSubscription,
  createSubscription,
  cancelSubscription,
  processPaymentWebhook,
  getSubscriptionAnalytics,
} from "./subscriptions/subscriptionFunctions";

// Core Tracker Functions
export {
  logCarbonAction,
  logMoodCheckin,
  logAnimalAction,
  approveAnimalModeration,
  generateWeeklyInsights,
  getSchoolWeeklyMoodAggregate,
  getSchoolWeeklyMoodAggregateBySection,
  getAnimalProofUploadUrl,
  listModerationQueue,
} from "./trackers/trackerFunctions";

// Animal Kindness Actions
export {
  addKindnessAction,
  updateKindnessAction,
  listKindnessActions,
  getKindnessActionById,
} from "./animal/kindnessFunctions";

// Advanced Functions (Digital Twin & MSME)
export {
  runDigitalTwinSimulation,
  generateMSMEReport,
  getSimulationHistory,
  getMSMEReports,
  getMSMETrends,
} from "./advanced/advancedFunctions";

// Rewards Functions
export {
  rewards_addReward,
  rewards_updateReward,
  rewards_deleteReward,
  rewards_getRewards,
  rewards_getRewardById,
  rewards_updateRewardStock,
  rewards_redeemCoins,
  rewards_getUserRedemptions,
  rewards_getAllRedemptions,
  rewards_uploadVouchers,
  rewards_verifyPartnerRedemption,
  rewards_getVouchersForReward,
  rewards_getAnalyticsData,
  rewards_getTotalCoinsRedeemed,
  rewards_getRedemptionTrends,
} from "./rewards/rewardsFunctions";

// Partner Functions
export {
  createPartner,
  updatePartner,
  listPartners,
} from "./partners/partnersFunctions";

// Gamification Functions
export {
  createMission,
  updateMission,
  listMissions,
  completeMission,
  getUserStreak,
} from "./gamification/gamificationFunctions";

// Community Functions (Ambassador & Spotlight)
export {
  registerAmbassador,
  submitReferral,
  getAmbassadorStats,
  submitSpotlightStory,
  reviewSpotlightStory,
  approveReferral,
  listSpotlightStories,
} from "./community/communityFunctions";

// Content Library & AI
export {
  createContent,
  listContent,
  generateRecommendations,
} from "./content/contentFunctions";

// Competitions
export {
  createCompetition,
  updateCompetitionScore,
  listCompetitionScores,
} from "./competitions/competitionsFunctions";

// Monitoring & Analytics Functions
export {
  logUserActivityFn,
  logSystemError,
  recordPerfMetric,
  triggerFraudAlert,
  generateAnalyticsReport,
} from "./monitoring/monitoringFunctions";

// Integrations (Notifications, CSR Partners, Geo)
export {
  sendNotification,
  dispatchRedemption,
  partnerWebhook,
  reverseGeocodeAndTag,
  syncPartnerInventory,
} from "./integrations/integrationFunctions";

export {
  logAuditEventFn,
  exportUserData,
  deleteUserAccount,
  reverseTransaction,
} from "./security/securityFunctions";

// Scheduled functions
export {
  healthCheckScheduler,
  analyticsAggregator,
  logCleanupScheduler,
} from "./scheduled/healthChecks";


