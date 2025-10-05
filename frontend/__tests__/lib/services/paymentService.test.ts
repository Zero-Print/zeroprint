import { PaymentService } from '@/lib/services/paymentService';
import api from '@/lib/apiClient';

// Mock the API client
jest.mock('@/lib/apiClient');
const mockApi = api as jest.Mocked<typeof api>;

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    jest.clearAllMocks();
    paymentService = new PaymentService();
  });

  describe('Payment Processing', () => {
    it('should process payment successfully', async () => {
      const paymentData = {
        amount: 100,
        currency: 'INR',
        orderId: 'order123',
        customerId: 'customer123',
      };

      const mockResponse = {
        success: true,
        data: {
          paymentId: 'payment123',
          status: 'completed',
          amount: 100,
          orderId: 'order123',
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await paymentService.processPayment(paymentData);

      expect(mockApi.post).toHaveBeenCalledWith('/payments/process', paymentData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle payment processing errors', async () => {
      const paymentData = {
        amount: 100,
        currency: 'INR',
        orderId: 'order123',
        customerId: 'customer123',
      };

      const errorResponse = {
        success: false,
        error: 'Payment failed',
        details: 'Insufficient funds',
      };

      mockApi.post.mockResolvedValue(errorResponse);

      await expect(paymentService.processPayment(paymentData)).rejects.toThrow('Payment failed');
    });

    it('should validate payment data before processing', async () => {
      const invalidPaymentData = {
        amount: -100, // Invalid amount
        currency: 'INR',
        orderId: 'order123',
        customerId: 'customer123',
      };

      await expect(paymentService.processPayment(invalidPaymentData)).rejects.toThrow('Invalid payment data');
    });
  });

  describe('Subscription Management', () => {
    it('should create subscription successfully', async () => {
      const subscriptionData = {
        planId: 'premium',
        customerId: 'customer123',
        paymentMethodId: 'pm123',
      };

      const mockResponse = {
        success: true,
        data: {
          subscriptionId: 'sub123',
          status: 'active',
          planId: 'premium',
          currentPeriodEnd: '2024-12-01T00:00:00Z',
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await paymentService.createSubscription(subscriptionData);

      expect(mockApi.post).toHaveBeenCalledWith('/subscriptions', subscriptionData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should cancel subscription successfully', async () => {
      const subscriptionId = 'sub123';
      const mockResponse = {
        success: true,
        data: {
          subscriptionId,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
        },
      };

      mockApi.delete.mockResolvedValue(mockResponse);

      const result = await paymentService.cancelSubscription(subscriptionId);

      expect(mockApi.delete).toHaveBeenCalledWith(`/subscriptions/${subscriptionId}`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should update subscription successfully', async () => {
      const subscriptionId = 'sub123';
      const updateData = {
        planId: 'enterprise',
      };

      const mockResponse = {
        success: true,
        data: {
          subscriptionId,
          planId: 'enterprise',
          status: 'active',
        },
      };

      mockApi.put.mockResolvedValue(mockResponse);

      const result = await paymentService.updateSubscription(subscriptionId, updateData);

      expect(mockApi.put).toHaveBeenCalledWith(`/subscriptions/${subscriptionId}`, updateData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Refund Processing', () => {
    it('should process refund successfully', async () => {
      const refundData = {
        paymentId: 'payment123',
        amount: 50,
        reason: 'customer_request',
      };

      const mockResponse = {
        success: true,
        data: {
          refundId: 'refund123',
          paymentId: 'payment123',
          amount: 50,
          status: 'completed',
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await paymentService.processRefund(refundData);

      expect(mockApi.post).toHaveBeenCalledWith('/refunds', refundData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle partial refunds', async () => {
      const refundData = {
        paymentId: 'payment123',
        amount: 25, // Partial refund
        reason: 'partial_return',
      };

      const mockResponse = {
        success: true,
        data: {
          refundId: 'refund123',
          paymentId: 'payment123',
          amount: 25,
          status: 'completed',
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await paymentService.processRefund(refundData);

      expect(result.amount).toBe(25);
    });

    it('should validate refund amount', async () => {
      const refundData = {
        paymentId: 'payment123',
        amount: 200, // Exceeds original payment
        reason: 'customer_request',
      };

      await expect(paymentService.processRefund(refundData)).rejects.toThrow('Refund amount exceeds payment amount');
    });
  });

  describe('Payment History', () => {
    it('should fetch payment history successfully', async () => {
      const customerId = 'customer123';
      const mockResponse = {
        success: true,
        data: {
          payments: [
            {
              id: 'payment1',
              amount: 100,
              status: 'completed',
              createdAt: '2024-01-01T00:00:00Z',
            },
            {
              id: 'payment2',
              amount: 50,
              status: 'pending',
              createdAt: '2024-01-02T00:00:00Z',
            },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await paymentService.getPaymentHistory(customerId, { page: 1, limit: 10 });

      expect(mockApi.get).toHaveBeenCalledWith(`/payments/history/${customerId}`, {
        params: { page: 1, limit: 10 },
      });
      expect(result.payments).toHaveLength(2);
      expect(result.pagination).toBeDefined();
    });

    it('should handle empty payment history', async () => {
      const customerId = 'customer123';
      const mockResponse = {
        success: true,
        data: {
          payments: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await paymentService.getPaymentHistory(customerId);

      expect(result.payments).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('Webhook Handling', () => {
    it('should verify webhook signature', () => {
      const payload = '{"event": "payment.completed"}';
      const signature = 'valid_signature';
      const secret = 'webhook_secret';

      const isValid = paymentService.verifyWebhookSignature(payload, signature, secret);

      expect(isValid).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const payload = '{"event": "payment.completed"}';
      const signature = 'invalid_signature';
      const secret = 'webhook_secret';

      const isValid = paymentService.verifyWebhookSignature(payload, signature, secret);

      expect(isValid).toBe(false);
    });

    it('should process payment webhook events', async () => {
      const webhookData = {
        event: 'payment.completed',
        data: {
          paymentId: 'payment123',
          status: 'completed',
          amount: 100,
        },
      };

      const mockResponse = { success: true };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await paymentService.processWebhook(webhookData);

      expect(mockApi.post).toHaveBeenCalledWith('/webhooks/payment', webhookData);
      expect(result).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockApi.post.mockRejectedValue(new Error('Network error'));

      const paymentData = {
        amount: 100,
        currency: 'INR',
        orderId: 'order123',
        customerId: 'customer123',
      };

      await expect(paymentService.processPayment(paymentData)).rejects.toThrow('Network error');
    });

    it('should retry failed requests', async () => {
      const paymentData = {
        amount: 100,
        currency: 'INR',
        orderId: 'order123',
        customerId: 'customer123',
      };

      // Mock first call to fail, second to succeed
      mockApi.post
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({ success: true, data: { paymentId: 'payment123' } });

      const result = await paymentService.processPayment(paymentData);

      expect(mockApi.post).toHaveBeenCalledTimes(2);
      expect(result.paymentId).toBe('payment123');
    });
  });
});
