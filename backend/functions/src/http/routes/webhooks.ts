/**
 * Webhooks HTTP Routes
 * Handles external webhook integrations (Razorpay, etc.)
 */

import {Router, Request, Response} from "express";
import {subscriptionsService} from "../../services/subscriptionsService";
import {ApiResponse} from "../../lib/apiResponse";
import {loggingService} from "../../services/loggingService";

const router = Router();

// POST /webhooks/razorpay - Razorpay webhook handler
router.post("/razorpay", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;

    if (!signature) {
      return res.status(400).json(ApiResponse.error("Missing signature", "400"));
    }

    // Handle webhook
    await subscriptionsService.handleRazorpayWebhook(req.body, signature);

    return res.status(200).json({received: true});
  } catch (error) {
    console.error("Razorpay webhook error:", error);

    await loggingService.logError(
      "WebhookHandler",
      "RazorpayWebhookError",
      "Failed to process Razorpay webhook",
      error instanceof Error ? error.stack : undefined,
      undefined,
      "high",
      {body: JSON.stringify(req.body).substring(0, 200)}
    );

    return res.status(500).json(ApiResponse.error("Webhook processing failed"));
  }
});

// POST /webhooks/test - Test webhook endpoint
router.post("/test", async (req: Request, res: Response) => {
  try {
    const {event, data} = req.body;

    await loggingService.logActivity(
      "system",
      "test_webhook_received",
      {event, data},
      "webhooks"
    );

    res.json(ApiResponse.success({received: true, event, timestamp: new Date().toISOString()}));
  } catch (error) {
    console.error("Test webhook error:", error);
    res.status(500).json(ApiResponse.error("Test webhook failed"));
  }
});

// GET /webhooks/health - Webhook health check
router.get("/health", async (req: Request, res: Response) => {
  try {
    res.json(ApiResponse.success({
      status: "healthy",
      timestamp: new Date().toISOString(),
      endpoints: ["razorpay", "test"],
    }));
  } catch (error) {
    console.error("Webhook health check error:", error);
    res.status(500).json(ApiResponse.error("Webhook health check failed"));
  }
});

export default router;
