/**
 * HTTP Router - routes requests to appropriate handlers
 * All endpoints are mounted under /api
 */

import {Router} from "express";
import {corsMiddleware, handlePreflight} from "../middleware/cors";
import {authGuard} from "../middleware/authGuard";
// import { adminGuard, roleGuard } from '../middleware/authGuard';
import {globalErrorHandler} from "../middleware/globalErrorHandler";
import {rateLimiting} from "../middleware/rateLimiting";

// Import route modules
import authRoutes from "./routes/auth";
import walletRoutes from "./routes/wallet";
import trackerRoutes from "./routes/trackers";
import webhookRoutes from "./routes/webhooks";
import monitoringRoutes from "./monitoring";
import dashboardRoutes from "./routes/dashboard";
import gamesRoutes from "./routes/games";
import subscriptionsRoutes from "./routes/subscriptions";

// All routes are now imported as modules above

const router = Router();

// Enable CORS for all routes
router.use(corsMiddleware);
router.use(handlePreflight);

// Health check
router.get("/health", (req, res) => {
  res.json({status: "ok", timestamp: new Date().toISOString()});
});

// Auth routes (no auth required, strict rate limiting)
router.use("/auth", rateLimiting.auth, authRoutes);

// Webhook routes (no auth required, signature verification, strict rate limiting)
router.use("/webhooks", rateLimiting.webhook, webhookRoutes);

// Protected routes (require authentication)
router.use(authGuard);

// Wallet routes
router.use("/wallet", walletRoutes);

// Tracker routes
router.use("/trackers", trackerRoutes);

// Game routes (rate limiting for game completion)
router.use("/games", rateLimiting.game, gamesRoutes);

// Subscription routes (strict rate limiting for payments)
router.use("/subscriptions", rateLimiting.payment, subscriptionsRoutes);

// Dashboard routes
router.use("/dashboard", dashboardRoutes);

// Monitoring routes
router.use("/monitoring", monitoringRoutes);

// Error handling middleware
router.use(globalErrorHandler);

export default router;
