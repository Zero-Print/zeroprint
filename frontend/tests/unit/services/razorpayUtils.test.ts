import { RazorpayUtils } from '../../../src/services/razorpayUtils';
import crypto from 'crypto';

// Mock crypto for signature verification
jest.mock('crypto', () => ({
  createHmac: jest.fn(),
}));

// Mock environment variables
const mockEnv = {
  RAZORPAY_KEY_ID: 'rzp_test_1234567890',
  RAZORPAY_KEY_SECRET: 'test_secret_key_1234567890',
  RAZORPAY_WEBHOOK_SECRET: 'webhook_secret_1234567890',
};

// Mock audit service
jest.mock('../../../src/lib/auditService', () => ({
  logAudit: jest.fn(),
  logUserActivity: jest.fn(),
}));

describe.skip('RazorpayUtils', () => {
  let razorpayUtils: RazorpayUtils;
  let mockHmac: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup crypto mock
    mockHmac = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn(),
    };
    (crypto.createHmac as jest.Mock).mockReturnValue(mockHmac);

    // Set environment variables
    Object.assign(process.env, mockEnv);

    razorpayUtils = new RazorpayUtils();
  });

  afterEach(() => {
    // Clean up environment variables
    Object.keys(mockEnv).forEach(key => {
      delete process.env[key];
    });
  });

  describe('Order Creation', () => {
    it('should create a valid Razorpay order', async () => {
      const orderData = {
        amount: 50000, // ₹500 in paise
        currency: 'INR',
        receipt: 'subscription_premium_123',
        notes: {
          userId: 'test-citizen-1',
          subscriptionType: 'premium',
          planId: 'plan_premium_monthly',
        },
      };

      // Mock Razorpay API response
      const mockRazorpayOrder = {
        id: 'order_1234567890',
        entity: 'order',
        amount: orderData.amount,
        amount_paid: 0,
        amount_due: orderData.amount,
        currency: orderData.currency,
        receipt: orderData.receipt,
        status: 'created',
        attempts: 0,
        notes: orderData.notes,
        created_at: Math.floor(Date.now() / 1000),
      };

      // Mock the Razorpay instance
      const mockRazorpayInstance = {
        orders: {
          create: jest.fn().mockResolvedValue(mockRazorpayOrder),
        },
      };

      (razorpayUtils as any).razorpayInstance = mockRazorpayInstance;

      const result = await razorpayUtils.createOrder(orderData);

      expect(mockRazorpayInstance.orders.create).toHaveBeenCalledWith(orderData);
      expect(result).toEqual(mockRazorpayOrder);
      expect(result.id).toBe('order_1234567890');
      expect(result.amount).toBe(orderData.amount);
      expect(result.status).toBe('created');
    });

    it('should handle order creation failure', async () => {
      const orderData = {
        amount: 50000,
        currency: 'INR',
        receipt: 'test_receipt_123',
      };

      const mockRazorpayInstance = {
        orders: {
          create: jest.fn().mockRejectedValue(new Error('Invalid API key')),
        },
      };

      (razorpayUtils as any).razorpayInstance = mockRazorpayInstance;

      await expect(razorpayUtils.createOrder(orderData)).rejects.toThrow('Invalid API key');

      // Verify audit logging for failure
      const { logAudit } = require('../../../src/lib/auditService');
      expect(logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'RAZORPAY_ORDER_CREATION_FAILED',
          details: expect.objectContaining({
            error: 'Invalid API key',
            orderData,
          }),
        })
      );
    });

    it('should validate order amount and currency', async () => {
      const invalidOrderData = {
        amount: -100, // Negative amount
        currency: 'USD', // Invalid currency for Indian context
        receipt: 'invalid_order_123',
      };

      await expect(razorpayUtils.createOrder(invalidOrderData)).rejects.toThrow(
        'Invalid order data'
      );
    });

    it('should generate unique receipt numbers', () => {
      const userId = 'test-citizen-1';
      const subscriptionType = 'premium';

      const receipt1 = razorpayUtils.generateReceipt(userId, subscriptionType);
      const receipt2 = razorpayUtils.generateReceipt(userId, subscriptionType);

      expect(receipt1).toMatch(/^subscription_premium_test-citizen-1_\d+$/);
      expect(receipt2).toMatch(/^subscription_premium_test-citizen-1_\d+$/);
      expect(receipt1).not.toBe(receipt2); // Should be unique
    });
  });

  describe('Payment Signature Verification', () => {
    it('should verify valid payment signature', () => {
      const paymentData = {
        razorpay_order_id: 'order_1234567890',
        razorpay_payment_id: 'pay_1234567890',
        razorpay_signature: 'valid_signature_hash',
      };

      const expectedSignature = 'valid_signature_hash';
      mockHmac.digest.mockReturnValue(expectedSignature);

      const isValid = razorpayUtils.verifyPaymentSignature(paymentData);

      expect(crypto.createHmac).toHaveBeenCalledWith('sha256', mockEnv.RAZORPAY_KEY_SECRET);
      expect(mockHmac.update).toHaveBeenCalledWith(
        `${paymentData.razorpay_order_id}|${paymentData.razorpay_payment_id}`
      );
      expect(mockHmac.digest).toHaveBeenCalledWith('hex');
      expect(isValid).toBe(true);
    });

    it('should reject invalid payment signature', () => {
      const paymentData = {
        razorpay_order_id: 'order_1234567890',
        razorpay_payment_id: 'pay_1234567890',
        razorpay_signature: 'invalid_signature_hash',
      };

      const expectedSignature = 'valid_signature_hash';
      mockHmac.digest.mockReturnValue(expectedSignature);

      const isValid = razorpayUtils.verifyPaymentSignature(paymentData);

      expect(isValid).toBe(false);

      // Verify audit logging for invalid signature
      const { logAudit } = require('../../../src/lib/auditService');
      expect(logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'PAYMENT_SIGNATURE_VERIFICATION_FAILED',
          details: expect.objectContaining({
            orderId: paymentData.razorpay_order_id,
            paymentId: paymentData.razorpay_payment_id,
          }),
        })
      );
    });

    it('should handle missing signature data', () => {
      const incompletePaymentData = {
        razorpay_order_id: 'order_1234567890',
        // Missing payment_id and signature
      };

      expect(() => {
        razorpayUtils.verifyPaymentSignature(incompletePaymentData as any);
      }).toThrow('Missing required payment data');
    });
  });

  describe('Webhook Signature Verification', () => {
    it('should verify valid webhook signature', () => {
      const webhookBody = JSON.stringify({
        entity: 'event',
        account_id: 'acc_1234567890',
        event: 'payment.captured',
        contains: ['payment'],
        payload: {
          payment: {
            entity: {
              id: 'pay_1234567890',
              amount: 50000,
              status: 'captured',
            },
          },
        },
      });

      const webhookSignature = 'valid_webhook_signature';
      const expectedSignature = 'valid_webhook_signature';

      mockHmac.digest.mockReturnValue(expectedSignature);

      const isValid = razorpayUtils.verifyWebhookSignature(webhookBody, webhookSignature);

      expect(crypto.createHmac).toHaveBeenCalledWith('sha256', mockEnv.RAZORPAY_WEBHOOK_SECRET);
      expect(mockHmac.update).toHaveBeenCalledWith(webhookBody);
      expect(mockHmac.digest).toHaveBeenCalledWith('hex');
      expect(isValid).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const webhookBody = JSON.stringify({ event: 'payment.captured' });
      const webhookSignature = 'invalid_webhook_signature';
      const expectedSignature = 'valid_webhook_signature';

      mockHmac.digest.mockReturnValue(expectedSignature);

      const isValid = razorpayUtils.verifyWebhookSignature(webhookBody, webhookSignature);

      expect(isValid).toBe(false);

      // Verify audit logging for invalid webhook
      const { logAudit } = require('../../../src/lib/auditService');
      expect(logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'WEBHOOK_SIGNATURE_VERIFICATION_FAILED',
          details: expect.objectContaining({
            providedSignature: webhookSignature,
            expectedSignature,
          }),
        })
      );
    });
  });

  describe('Payment Processing', () => {
    it('should process successful payment', async () => {
      const paymentData = {
        razorpay_order_id: 'order_1234567890',
        razorpay_payment_id: 'pay_1234567890',
        razorpay_signature: 'valid_signature',
      };

      // Mock signature verification
      jest.spyOn(razorpayUtils, 'verifyPaymentSignature').mockReturnValue(true);

      // Mock payment fetch
      const mockPaymentDetails = {
        id: 'pay_1234567890',
        amount: 50000,
        currency: 'INR',
        status: 'captured',
        order_id: 'order_1234567890',
        method: 'card',
        created_at: Math.floor(Date.now() / 1000),
      };

      const mockRazorpayInstance = {
        payments: {
          fetch: jest.fn().mockResolvedValue(mockPaymentDetails),
        },
      };

      (razorpayUtils as any).razorpayInstance = mockRazorpayInstance;

      const result = await razorpayUtils.processPayment(paymentData);

      expect(result.success).toBe(true);
      expect(result.paymentDetails).toEqual(mockPaymentDetails);
      expect(result.verified).toBe(true);

      // Verify audit logging for successful payment
      const { logAudit } = require('../../../src/lib/auditService');
      expect(logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'PAYMENT_PROCESSED_SUCCESSFULLY',
          details: expect.objectContaining({
            paymentId: paymentData.razorpay_payment_id,
            orderId: paymentData.razorpay_order_id,
            amount: mockPaymentDetails.amount,
          }),
        })
      );
    });

    it('should handle payment processing failure', async () => {
      const paymentData = {
        razorpay_order_id: 'order_1234567890',
        razorpay_payment_id: 'pay_1234567890',
        razorpay_signature: 'invalid_signature',
      };

      // Mock signature verification failure
      jest.spyOn(razorpayUtils, 'verifyPaymentSignature').mockReturnValue(false);

      const result = await razorpayUtils.processPayment(paymentData);

      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.error).toBe('Invalid payment signature');
    });
  });

  describe('Webhook Processing', () => {
    it('should process payment.captured webhook', async () => {
      const webhookPayload = {
        entity: 'event',
        account_id: 'acc_1234567890',
        event: 'payment.captured',
        contains: ['payment'],
        payload: {
          payment: {
            entity: {
              id: 'pay_1234567890',
              amount: 50000,
              currency: 'INR',
              status: 'captured',
              order_id: 'order_1234567890',
              notes: {
                userId: 'test-citizen-1',
                subscriptionType: 'premium',
              },
            },
          },
        },
      };

      const webhookSignature = 'valid_webhook_signature';

      // Mock signature verification
      jest.spyOn(razorpayUtils, 'verifyWebhookSignature').mockReturnValue(true);

      // Mock subscription service
      const mockSubscriptionService = {
        activateSubscription: jest.fn().mockResolvedValue({
          id: 'sub_1234567890',
          status: 'active',
        }),
      };

      (razorpayUtils as any).subscriptionService = mockSubscriptionService;

      const result = await razorpayUtils.processWebhook(webhookPayload, webhookSignature);

      expect(result.success).toBe(true);
      expect(result.processed).toBe(true);
      expect(mockSubscriptionService.activateSubscription).toHaveBeenCalledWith(
        'test-citizen-1',
        'premium',
        expect.objectContaining({
          paymentId: 'pay_1234567890',
          orderId: 'order_1234567890',
          amount: 50000,
        })
      );
    });

    it('should handle payment.failed webhook', async () => {
      const webhookPayload = {
        entity: 'event',
        account_id: 'acc_1234567890',
        event: 'payment.failed',
        contains: ['payment'],
        payload: {
          payment: {
            entity: {
              id: 'pay_failed_1234567890',
              amount: 50000,
              status: 'failed',
              order_id: 'order_1234567890',
              error_code: 'BAD_REQUEST_ERROR',
              error_description: 'Payment failed due to insufficient funds',
            },
          },
        },
      };

      const webhookSignature = 'valid_webhook_signature';

      jest.spyOn(razorpayUtils, 'verifyWebhookSignature').mockReturnValue(true);

      const result = await razorpayUtils.processWebhook(webhookPayload, webhookSignature);

      expect(result.success).toBe(true);
      expect(result.processed).toBe(true);

      // Verify audit logging for failed payment
      const { logAudit } = require('../../../src/lib/auditService');
      expect(logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'PAYMENT_FAILED',
          details: expect.objectContaining({
            paymentId: 'pay_failed_1234567890',
            errorCode: 'BAD_REQUEST_ERROR',
            errorDescription: 'Payment failed due to insufficient funds',
          }),
        })
      );
    });

    it('should reject webhook with invalid signature', async () => {
      const webhookPayload = {
        entity: 'event',
        event: 'payment.captured',
      };

      const webhookSignature = 'invalid_signature';

      jest.spyOn(razorpayUtils, 'verifyWebhookSignature').mockReturnValue(false);

      const result = await razorpayUtils.processWebhook(webhookPayload, webhookSignature);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid webhook signature');
    });
  });

  describe('Refund Processing', () => {
    it('should process refund successfully', async () => {
      const refundData = {
        paymentId: 'pay_1234567890',
        amount: 25000, // Partial refund
        reason: 'Customer request',
        notes: {
          userId: 'test-citizen-1',
          refundType: 'partial',
        },
      };

      const mockRefundResponse = {
        id: 'rfnd_1234567890',
        entity: 'refund',
        amount: refundData.amount,
        currency: 'INR',
        payment_id: refundData.paymentId,
        status: 'processed',
        created_at: Math.floor(Date.now() / 1000),
      };

      const mockRazorpayInstance = {
        payments: {
          refund: jest.fn().mockResolvedValue(mockRefundResponse),
        },
      };

      (razorpayUtils as any).razorpayInstance = mockRazorpayInstance;

      const result = await razorpayUtils.processRefund(refundData);

      expect(mockRazorpayInstance.payments.refund).toHaveBeenCalledWith(refundData.paymentId, {
        amount: refundData.amount,
        notes: refundData.notes,
      });
      expect(result).toEqual(mockRefundResponse);

      // Verify audit logging
      const { logAudit } = require('../../../src/lib/auditService');
      expect(logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'REFUND_PROCESSED',
          details: expect.objectContaining({
            refundId: mockRefundResponse.id,
            paymentId: refundData.paymentId,
            amount: refundData.amount,
            reason: refundData.reason,
          }),
        })
      );
    });

    it('should handle refund failure', async () => {
      const refundData = {
        paymentId: 'pay_invalid_1234567890',
        amount: 50000,
        reason: 'Test refund',
      };

      const mockRazorpayInstance = {
        payments: {
          refund: jest.fn().mockRejectedValue(new Error('Payment not found')),
        },
      };

      (razorpayUtils as any).razorpayInstance = mockRazorpayInstance;

      await expect(razorpayUtils.processRefund(refundData)).rejects.toThrow('Payment not found');

      // Verify audit logging for failure
      const { logAudit } = require('../../../src/lib/auditService');
      expect(logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'REFUND_FAILED',
          details: expect.objectContaining({
            paymentId: refundData.paymentId,
            error: 'Payment not found',
          }),
        })
      );
    });
  });

  describe('Utility Functions', () => {
    it('should convert amount to paise correctly', () => {
      expect(razorpayUtils.convertToPaise(100)).toBe(10000);
      expect(razorpayUtils.convertToPaise(500.5)).toBe(50050);
      expect(razorpayUtils.convertToPaise(0)).toBe(0);
    });

    it('should convert amount from paise correctly', () => {
      expect(razorpayUtils.convertFromPaise(10000)).toBe(100);
      expect(razorpayUtils.convertFromPaise(50050)).toBe(500.5);
      expect(razorpayUtils.convertFromPaise(0)).toBe(0);
    });

    it('should validate Indian mobile number', () => {
      expect(razorpayUtils.validateIndianMobile('9876543210')).toBe(true);
      expect(razorpayUtils.validateIndianMobile('+919876543210')).toBe(true);
      expect(razorpayUtils.validateIndianMobile('1234567890')).toBe(false); // Invalid prefix
      expect(razorpayUtils.validateIndianMobile('98765432')).toBe(false); // Too short
    });

    it('should format currency correctly', () => {
      expect(razorpayUtils.formatCurrency(50000)).toBe('₹500.00');
      expect(razorpayUtils.formatCurrency(100)).toBe('₹1.00');
      expect(razorpayUtils.formatCurrency(0)).toBe('₹0.00');
    });
  });
});
