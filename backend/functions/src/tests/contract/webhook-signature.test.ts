/**
 * Webhook Signature Tests
 * Tests HMAC signature verification for partner webhooks
 */

import {describe, it, expect, beforeEach} from "@jest/globals";

// Mock the secrets module before importing webhookSecurity
const mockGetSecretValue = jest.fn();
jest.mock("../../lib/secrets", () => ({
  getSecretValue: mockGetSecretValue,
}));

import {
  verifyRazorpayWebhook,
  verifyHMACSignature,
  verifyPartnerWebhook,
  generateWebhookSignature,
} from "../../lib/webhookSecurity";

describe("Webhook Signature Tests", () => {
  const testSecret = "test-webhook-secret";
  const testPayload = JSON.stringify({test: "data", amount: 100});
  const testTimestamp = Math.floor(Date.now() / 1000);

  describe("Razorpay Webhook Verification", () => {
    it("should verify valid Razorpay webhook signature", async () => {
      const signature = generateWebhookSignature(testPayload, testSecret);
      const isValid = await verifyRazorpayWebhook(testPayload, signature, testSecret);

      expect(isValid).toBe(true);
    });

    it("should reject invalid Razorpay webhook signature", async () => {
      const invalidSignature = "invalid-signature";
      const isValid = await verifyRazorpayWebhook(testPayload, invalidSignature, testSecret);

      expect(isValid).toBe(false);
    });

    it("should reject Razorpay webhook with wrong secret", async () => {
      const signature = generateWebhookSignature(testPayload, testSecret);
      const wrongSecret = "wrong-secret";
      const isValid = await verifyRazorpayWebhook(testPayload, signature, wrongSecret);

      expect(isValid).toBe(false);
    });

    it("should handle empty payload", async () => {
      const emptyPayload = "";
      const signature = generateWebhookSignature(emptyPayload, testSecret);
      const isValid = await verifyRazorpayWebhook(emptyPayload, signature, testSecret);

      expect(isValid).toBe(true);
    });
  });

  describe("Generic HMAC Verification", () => {
    it("should verify valid HMAC signature with SHA256", async () => {
      const signature = generateWebhookSignature(testPayload, testSecret, "sha256");
      const isValid = await verifyHMACSignature(testPayload, signature, testSecret, "sha256");

      expect(isValid).toBe(true);
    });

    it("should verify valid HMAC signature with SHA1", async () => {
      const signature = generateWebhookSignature(testPayload, testSecret, "sha1");
      const isValid = await verifyHMACSignature(testPayload, signature, testSecret, "sha1");

      expect(isValid).toBe(true);
    });

    it("should reject invalid HMAC signature", async () => {
      const invalidSignature = "invalid-hmac-signature";
      const isValid = await verifyHMACSignature(testPayload, invalidSignature, testSecret);

      expect(isValid).toBe(false);
    });

    it("should handle different algorithms", async () => {
      const sha256Signature = generateWebhookSignature(testPayload, testSecret, "sha256");
      const sha1Signature = generateWebhookSignature(testPayload, testSecret, "sha1");

      const sha256Valid = await verifyHMACSignature(testPayload, sha256Signature, testSecret, "sha256");
      const sha1Valid = await verifyHMACSignature(testPayload, sha1Signature, testSecret, "sha1");

      expect(sha256Valid).toBe(true);
      expect(sha1Valid).toBe(true);
    });
  });

  describe("Partner Webhook Verification", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should verify valid partner webhook", async () => {
      const partnerId = "test-partner";
      const payloadToSign = `${testPayload}.${testTimestamp}`;
      const signature = generateWebhookSignature(payloadToSign, testSecret);

      mockGetSecretValue.mockResolvedValue(testSecret);

      const isValid = await verifyPartnerWebhook(partnerId, testPayload, signature, testTimestamp);

      expect(isValid).toBe(true);
      expect(mockGetSecretValue).toHaveBeenCalledWith(`partner_${partnerId}_webhook_secret`);
    });

    it("should reject partner webhook with old timestamp", async () => {
      const partnerId = "test-partner";
      const oldTimestamp = testTimestamp - 400; // 6+ minutes ago
      const payloadToSign = `${testPayload}.${oldTimestamp}`;
      const signature = generateWebhookSignature(payloadToSign, testSecret);

      mockGetSecretValue.mockResolvedValue(testSecret);

      const isValid = await verifyPartnerWebhook(partnerId, testPayload, signature, oldTimestamp);

      expect(isValid).toBe(false);
    });

    it("should reject partner webhook with future timestamp", async () => {
      const partnerId = "test-partner";
      const futureTimestamp = testTimestamp + 400; // 6+ minutes in future
      const payloadToSign = `${testPayload}.${futureTimestamp}`;
      const signature = generateWebhookSignature(payloadToSign, testSecret);

      mockGetSecretValue.mockResolvedValue(testSecret);

      const isValid = await verifyPartnerWebhook(partnerId, testPayload, signature, futureTimestamp);

      expect(isValid).toBe(false);
    });

    it("should reject partner webhook with missing secret", async () => {
      const partnerId = "test-partner";
      const payloadToSign = `${testPayload}.${testTimestamp}`;
      const signature = generateWebhookSignature(payloadToSign, testSecret);

      mockGetSecretValue.mockResolvedValue(null);

      const isValid = await verifyPartnerWebhook(partnerId, testPayload, signature, testTimestamp);

      expect(isValid).toBe(false);
    });

    it("should reject partner webhook with invalid signature", async () => {
      const partnerId = "test-partner";
      const invalidSignature = "invalid-signature";

      mockGetSecretValue.mockResolvedValue(testSecret);

      const isValid = await verifyPartnerWebhook(partnerId, testPayload, invalidSignature, testTimestamp);

      expect(isValid).toBe(false);
    });
  });

  describe("Signature Generation", () => {
    it("should generate consistent signatures for same input", () => {
      const signature1 = generateWebhookSignature(testPayload, testSecret);
      const signature2 = generateWebhookSignature(testPayload, testSecret);

      expect(signature1).toBe(signature2);
    });

    it("should generate different signatures for different payloads", () => {
      const payload1 = JSON.stringify({test: "data1"});
      const payload2 = JSON.stringify({test: "data2"});

      const signature1 = generateWebhookSignature(payload1, testSecret);
      const signature2 = generateWebhookSignature(payload2, testSecret);

      expect(signature1).not.toBe(signature2);
    });

    it("should generate different signatures for different secrets", () => {
      const secret1 = "secret1";
      const secret2 = "secret2";

      const signature1 = generateWebhookSignature(testPayload, secret1);
      const signature2 = generateWebhookSignature(testPayload, secret2);

      expect(signature1).not.toBe(signature2);
    });

    it("should generate different signatures for different algorithms", () => {
      const sha256Signature = generateWebhookSignature(testPayload, testSecret, "sha256");
      const sha1Signature = generateWebhookSignature(testPayload, testSecret, "sha1");

      expect(sha256Signature).not.toBe(sha1Signature);
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in payload", () => {
      const specialPayload = JSON.stringify({
        test: "data with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?",
        unicode: "🚀🎉💯",
        newlines: "line1\nline2\r\nline3",
      });

      const signature = generateWebhookSignature(specialPayload, testSecret);
      expect(signature).toBeDefined();
      expect(signature.length).toBeGreaterThan(0);
    });

    it("should handle very long payloads", () => {
      const longPayload = JSON.stringify({
        data: "x".repeat(10000), // 10KB payload
        timestamp: Date.now(),
      });

      const signature = generateWebhookSignature(longPayload, testSecret);
      expect(signature).toBeDefined();
      expect(signature.length).toBeGreaterThan(0);
    });

    it("should handle empty secret", () => {
      const emptySecret = "";
      const signature = generateWebhookSignature(testPayload, emptySecret);
      expect(signature).toBeDefined();
    });

    it("should handle very long secret", () => {
      const longSecret = "x".repeat(1000);
      const signature = generateWebhookSignature(testPayload, longSecret);
      expect(signature).toBeDefined();
    });
  });

  describe("Timing Attack Protection", () => {
    it("should use timing-safe comparison", async () => {
      const correctSignature = generateWebhookSignature(testPayload, testSecret);
      const wrongSignature = "wrong-signature";

      // Both should take similar time to verify (timing-safe comparison)
      const start1 = Date.now();
      await verifyHMACSignature(testPayload, correctSignature, testSecret);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await verifyHMACSignature(testPayload, wrongSignature, testSecret);
      const time2 = Date.now() - start2;

      // Times should be similar (within 10ms tolerance)
      expect(Math.abs(time1 - time2)).toBeLessThan(10);
    });
  });
});
