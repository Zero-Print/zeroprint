/**
 * Webhook Security Utilities
 * HMAC signature verification for partner webhooks
 */

import * as crypto from "crypto";
import {getSecretValue} from "./secrets";

// Razorpay webhook signature verification
export async function verifyRazorpayWebhook(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("Razorpay webhook verification error:", error);
    return false;
  }
}

// Generic HMAC signature verification
export async function verifyHMACSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: string = "sha256"
): Promise<boolean> {
  try {
    const expectedSignature = crypto
      .createHmac(algorithm, secret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("HMAC signature verification error:", error);
    return false;
  }
}

// Partner webhook verification
export async function verifyPartnerWebhook(
  partnerId: string,
  payload: string,
  signature: string,
  timestamp: number
): Promise<boolean> {
  try {
    // Get partner secret
    const secret = await getSecretValue(`partner_${partnerId}_webhook_secret`);
    if (!secret) {
      console.error(`No webhook secret found for partner: ${partnerId}`);
      return false;
    }

    // Check timestamp (prevent replay attacks)
    const now = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(now - timestamp);
    if (timeDiff > 300) { // 5 minutes tolerance
      console.error("Webhook timestamp too old or too far in future");
      return false;
    }

    // Verify signature
    const payloadToSign = `${payload}.${timestamp}`;
    return await verifyHMACSignature(payloadToSign, signature, secret);
  } catch (error) {
    console.error("Partner webhook verification error:", error);
    return false;
  }
}

// Generate webhook signature (for testing)
export function generateWebhookSignature(
  payload: string,
  secret: string,
  algorithm: string = "sha256"
): string {
  return crypto
    .createHmac(algorithm, secret)
    .update(payload)
    .digest("hex");
}

// Webhook security middleware
export function createWebhookSecurityMiddleware(partnerId: string) {
  return async (req: any, res: any, next: any) => {
    try {
      const signature = req.headers["x-signature"] || req.headers["x-webhook-signature"];
      const timestamp = req.headers["x-timestamp"] || req.headers["x-webhook-timestamp"];

      if (!signature || !timestamp) {
        return res.status(401).json({
          success: false,
          error: "Missing webhook signature or timestamp",
          message: "Webhook requests must include signature and timestamp headers",
        });
      }

      const payload = JSON.stringify(req.body);
      const isValid = await verifyPartnerWebhook(
        partnerId,
        payload,
        signature,
        parseInt(timestamp)
      );

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: "Invalid webhook signature",
          message: "Webhook signature verification failed",
        });
      }

      next();
    } catch (error) {
      console.error("Webhook security middleware error:", error);
      return res.status(500).json({
        success: false,
        error: "Webhook verification failed",
        message: "Internal error during webhook verification",
      });
    }
  };
}

// Razorpay webhook security middleware
export function createRazorpayWebhookMiddleware() {
  return async (req: any, res: any, next: any) => {
    try {
      const signature = req.headers["x-razorpay-signature"];
      if (!signature) {
        return res.status(401).json({
          success: false,
          error: "Missing Razorpay signature",
          message: "Razorpay webhook requests must include signature header",
        });
      }

      const payload = JSON.stringify(req.body);
      const secret = await getSecretValue("razorpay_webhook_secret");
      if (!secret) {
        return res.status(500).json({
          success: false,
          error: "Webhook secret not configured",
          message: "Razorpay webhook secret not found",
        });
      }

      const isValid = await verifyRazorpayWebhook(payload, signature, secret);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: "Invalid Razorpay signature",
          message: "Razorpay webhook signature verification failed",
        });
      }

      next();
    } catch (error) {
      console.error("Razorpay webhook middleware error:", error);
      return res.status(500).json({
        success: false,
        error: "Webhook verification failed",
        message: "Internal error during Razorpay webhook verification",
      });
    }
  };
}

// Export webhook security utilities
export const webhookSecurity = {
  verifyRazorpayWebhook,
  verifyHMACSignature,
  verifyPartnerWebhook,
  generateWebhookSignature,
  createWebhookSecurityMiddleware,
  createRazorpayWebhookMiddleware,
};
