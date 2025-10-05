/**
 * Subscriptions HTTP Routes
 * Handles subscription plans and Razorpay checkout
 */

import {Router, Request, Response} from "express";
import {subscriptionsService} from "../../services/subscriptionsService";
import {ApiResponse} from "../../lib/apiResponse";
import {authGuard, adminGuard} from "../../middleware/authGuard";

const router = Router();

// GET /subscriptions/plans - Get subscription plans (no auth required)
router.get("/plans", async (req: Request, res: Response) => {
  try {
    const response = await subscriptionsService.getSubscriptionPlans();
    return res.json(response);
  } catch (error) {
    console.error("Get plans error:", error);
    return res.status(500).json(ApiResponse.error("Failed to get subscription plans"));
  }
});

// Apply auth guard to protected routes
router.use(authGuard);

// POST /subscriptions/checkout - Create checkout session
router.post("/checkout", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json(ApiResponse.error("User not authenticated", "401"));
    }

    const {planId, userEmail, userName} = req.body;

    if (!planId || !userEmail || !userName) {
      return res.status(400).json(ApiResponse.error("Missing required fields", "400"));
    }

    const response = await subscriptionsService.createCheckoutOrder(
      userId,
      planId,
      userEmail,
      userName
    );
    return res.json(response);
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json(ApiResponse.error("Failed to create checkout session"));
  }
});

// GET /subscriptions/status - Get user subscription status
router.get("/status", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json(ApiResponse.error("User not authenticated", "401"));
    }

    const response = await subscriptionsService.getSubscriptionStatus(userId);
    return res.json(response);
  } catch (error) {
    console.error("Subscription status error:", error);
    return res.status(500).json(ApiResponse.error("Failed to get subscription status"));
  }
});

// POST /subscriptions/cancel - Cancel subscription
router.post("/cancel", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json(ApiResponse.error("User not authenticated", "401"));
    }

    const {subscriptionId, reason} = req.body;

    if (!subscriptionId) {
      return res.status(400).json(ApiResponse.error("Subscription ID is required", "400"));
    }

    const response = await subscriptionsService.cancelSubscription(userId, subscriptionId, reason);
    return res.json(response);
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return res.status(500).json(ApiResponse.error("Failed to cancel subscription"));
  }
});

// Admin routes
router.use(adminGuard);

// TODO: Implement getAllSubscriptions method in SubscriptionsService
// router.get('/admin/all', async (req: Request, res: Response) => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 50;
//     const status = req.query.status as string;
//     const userId = req.query.userId as string;
//     const planId = req.query.planId as string;
//     const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
//     const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

//     const filters = {
//       status,
//       userId,
//       planId,
//       dateFrom,
//       dateTo,
//     };

//     const response = await subscriptionsService.getAllSubscriptions(page, limit, filters);
//     res.json(response);
//   } catch (error) {
//     console.error('Get all subscriptions error:', error);
//     res.status(500).json(ApiResponse.error('Failed to get subscriptions'));
//   }
// });

// GET /subscriptions/admin/analytics - Get subscription analytics (admin only)
router.get("/admin/analytics", async (req: Request, res: Response) => {
  try {
    const response = await subscriptionsService.getSubscriptionAnalytics();
    res.json(response);
  } catch (error) {
    console.error("Subscription analytics error:", error);
    res.status(500).json(ApiResponse.error("Failed to get subscription analytics"));
  }
});

// TODO: Implement getAllSubscriptions method in SubscriptionsService
// router.post('/admin/export', async (req: Request, res: Response) => {
//   try {
//     const { format = 'csv', filters = {} } = req.body;

//     // Get all subscriptions with filters
//     const response = await subscriptionsService.getAllSubscriptions(1, 10000, filters);

//     if (!response.success || !response.data) {
//       return res.status(500).json(ApiResponse.error('Failed to fetch subscriptions for export'));
//     }

//     const { subscriptions } = response.data;

//     if (format === 'csv') {
//       // Convert to CSV
//       const csv = convertSubscriptionsToCSV(subscriptions);
//       res.setHeader('Content-Type', 'text/csv');
//       res.setHeader('Content-Disposition', 'attachment; filename="subscriptions.csv"');
//       res.send(csv);
//     } else {
//       // Return JSON
//       res.setHeader('Content-Type', 'application/json');
//       res.setHeader('Content-Disposition', 'attachment; filename="subscriptions.json"');
//       res.json(subscriptions);
//     }
//   } catch (error) {
//     console.error('Export subscriptions error:', error);
//     res.status(500).json(ApiResponse.error('Failed to export subscriptions'));
//   }
// });

// TODO: Helper function to convert subscriptions to CSV (unused for now)
// function convertSubscriptionsToCSV(subscriptions: any[]): string {
//   if (subscriptions.length === 0) return '';

//   const headers = [
//     'ID',
//     'User ID',
//     'Plan ID',
//     'Status',
//     'Amount',
//     'Currency',
//     'Created At',
//     'Activated At',
//     'Expires At',
//     'Payment ID',
//     'Plan Name',
//   ];

//   const rows = subscriptions.map(sub => [
//     sub.id,
//     sub.userId,
//     sub.planId,
//     sub.status,
//     sub.amount,
//     sub.currency,
//     sub.createdAt,
//     sub.activatedAt || '',
//     sub.expiresAt || '',
//     sub.razorpayPaymentId || '',
//     sub.metadata?.planName || '',
//   ]);

//   const csvContent = [headers, ...rows]
//     .map(row => row.map(field => `"${field}"`).join(','))
//     .join('\n');

//   return csvContent;
// }

export default router;
