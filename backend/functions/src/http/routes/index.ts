/**
 * Main HTTP Routes
 * Centralized route registration for all API endpoints
 */

import {Router} from "express";
import {corsMiddleware} from "../../middleware/cors";
import {authGuard} from "../../middleware/authGuard";

// Import route modules
import authRoutes from "./auth";
import walletRoutes from "./wallet";
import trackersRoutes from "./trackers";
import gamesRoutes from "./games";
import subscriptionsRoutes from "./subscriptions";
// import rewardsRoutes from './rewards'; // TODO: Create rewards routes
// import dashboardsRoutes from './dashboards'; // TODO: Create dashboards routes
import webhooksRoutes from "./webhooks";
// import adminRoutes from './admin'; // TODO: Create admin routes
// import monitoringRoutes from './monitoring'; // TODO: Create monitoring routes
// import integrationsRoutes from './integrations'; // TODO: Create integrations routes

const router = Router();

// Apply CORS middleware to all routes
router.use(corsMiddleware);

// Health check endpoint (no auth required)
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// API documentation endpoint
router.get("/docs", (req, res) => {
  res.json({
    name: "ZeroPrint API",
    version: "1.0.0",
    description: "ZeroPrint Backend API for sustainability gamification",
    endpoints: {
      auth: {
        "POST /auth/signup": "Create new user account",
        "POST /auth/login": "Authenticate user",
        "POST /auth/logout": "Logout user",
        "GET /auth/profile": "Get user profile",
        "PUT /auth/profile": "Update user profile",
        "POST /auth/refresh": "Refresh authentication token",
      },
      wallet: {
        "GET /wallet/balance": "Get wallet balance",
        "GET /wallet/transactions": "Get transaction history",
        "POST /wallet/earn": "Earn coins from activities",
        "POST /wallet/redeem": "Redeem coins for rewards",
        "POST /wallet/transfer": "Transfer coins to another user",
        "GET /wallet/limits": "Get earning and redemption limits",
      },
      trackers: {
        "GET /trackers/carbon": "Get carbon tracking data",
        "POST /trackers/carbon": "Log carbon-saving action",
        "PUT /trackers/carbon/:id": "Update carbon log",
        "DELETE /trackers/carbon/:id": "Delete carbon log",
        "GET /trackers/mood": "Get mood tracking data",
        "POST /trackers/mood": "Log mood check-in",
        "GET /trackers/animal-welfare": "Get animal welfare data",
        "POST /trackers/animal-welfare": "Log animal welfare action",
        "GET /trackers/digital-twin": "Get digital twin simulations",
        "POST /trackers/digital-twin": "Create digital twin simulation",
        "GET /trackers/msme": "Get MSME reports",
        "POST /trackers/msme": "Create MSME report",
      },
      games: {
        "GET /games": "Get available games",
        "GET /games/:id": "Get game details",
        "POST /games/:id/complete": "Complete a game",
        "GET /games/history": "Get game history",
        "GET /games/:id/leaderboard": "Get game leaderboard",
      },
      subscriptions: {
        "GET /subscriptions/plans": "Get subscription plans",
        "POST /subscriptions/checkout": "Create subscription checkout",
        "GET /subscriptions/status": "Get subscription status",
        "POST /subscriptions/cancel": "Cancel subscription",
      },
      rewards: {
        "GET /rewards": "Get available rewards",
        "GET /rewards/:id": "Get reward details",
        "POST /rewards/redeem": "Redeem reward",
        "GET /rewards/redemptions": "Get redemption history",
      },
      dashboards: {
        "GET /dashboard/citizen": "Get citizen dashboard data",
        "GET /dashboard/entity": "Get entity dashboard data",
        "GET /dashboard/government": "Get government dashboard data",
        "GET /dashboard/admin": "Get admin dashboard data",
      },
      webhooks: {
        "POST /webhooks/razorpay": "Razorpay payment webhook",
        "POST /webhooks/partner": "Partner integration webhook",
      },
      admin: {
        "GET /admin/users": "Get all users (admin only)",
        "GET /admin/analytics": "Get system analytics (admin only)",
        "GET /admin/logs": "Get system logs (admin only)",
        "POST /admin/export": "Export data (admin only)",
      },
      monitoring: {
        "GET /monitoring/health": "Get system health",
        "GET /monitoring/analytics": "Get monitoring analytics",
        "GET /monitoring/performance": "Get performance metrics",
        "GET /monitoring/errors": "Get error logs",
        "GET /monitoring/alerts": "Get system alerts",
        "POST /monitoring/alert/:id/resolve": "Resolve alert",
        "GET /monitoring/export": "Export monitoring data",
      },
      integrations: {
        "POST /integrations/notifications/send": "Send notification",
        "POST /integrations/partners/webhook": "Partner webhook",
        "POST /integrations/geo/reverse-geocode": "Reverse geocode",
        "GET /integrations/feature-flags": "Get feature flags",
      },
    },
  });
});

// Register route modules
router.use("/auth", authRoutes);
router.use("/wallet", authGuard, walletRoutes);
router.use("/trackers", authGuard, trackersRoutes);
router.use("/games", authGuard, gamesRoutes);
router.use("/subscriptions", authGuard, subscriptionsRoutes);
// router.use('/rewards', authGuard, rewardsRoutes); // TODO: Create rewards routes
// router.use('/dashboard', authGuard, dashboardsRoutes); // TODO: Create dashboards routes
router.use("/webhooks", webhooksRoutes);
// router.use('/admin', authGuard, adminRoutes); // TODO: Create admin routes
// router.use('/monitoring', authGuard, monitoringRoutes); // TODO: Create monitoring routes
// router.use('/integrations', authGuard, integrationsRoutes); // TODO: Create integrations routes

// 404 handler for undefined routes
router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

export default router;
