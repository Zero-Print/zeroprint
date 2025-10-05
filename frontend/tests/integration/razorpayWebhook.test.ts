import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  getDoc,
  setDoc,
  clearFirestoreData,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';
import crypto from 'crypto';
import { TEST_USERS, TEST_SUBSCRIPTIONS } from '../fixtures/seed-data';

// Firebase emulator configuration
const firebaseConfig = {
  projectId: 'zeroprint-test',
  apiKey: 'test-api-key',
  authDomain: 'zeroprint-test.firebaseapp.com',
  storageBucket: 'zeroprint-test.appspot.com',
  messagingSenderId: '123456789',
  appId: 'test-app-id',
};

// Mock Razorpay webhook secret
const WEBHOOK_SECRET = 'test_webhook_secret_123';

describe.skip('Razorpay Webhook Integration Tests', () => {
  let app: any;
  let db: any;
  let auth: any;
  let functions: any;

  beforeAll(async () => {
    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    functions = getFunctions(app);

    // Connect to emulators
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFunctionsEmulator(functions, 'localhost', 5001);
  });

  beforeEach(async () => {
    // Clear Firestore data before each test
    await clearFirestoreData(firebaseConfig.projectId);

    // Seed test data
    await seedTestData();
  });

  afterAll(async () => {
    // Clean up
    await clearFirestoreData(firebaseConfig.projectId);
  });

  const seedTestData = async () => {
    // Create test users in Auth
    for (const user of Object.values(TEST_USERS)) {
      try {
        await createUserWithEmailAndPassword(auth, user.email, 'testpassword123');
      } catch (error: any) {
        if (error.code !== 'auth/email-already-in-use') {
          throw error;
        }
      }
    }

    // Seed Firestore collections
    const batch = [];

    // Users
    for (const [userId, userData] of Object.entries(TEST_USERS)) {
      batch.push(setDoc(doc(db, 'users', userId), userData));
    }

    // Subscriptions
    for (const subscription of TEST_SUBSCRIPTIONS) {
      batch.push(setDoc(doc(db, 'subscriptions', subscription.id), subscription));
    }

    await Promise.all(batch);
  };

  const generateWebhookSignature = (payload: string): string => {
    return crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');
  };

  const createPaymentWebhookPayload = (overrides: any = {}) => {
    const defaultPayload = {
      entity: 'event',
      account_id: 'acc_test123',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: 'pay_test123',
            entity: 'payment',
            amount: 29900, // ₹299 in paise
            currency: 'INR',
            status: 'captured',
            order_id: 'order_test123',
            invoice_id: null,
            international: false,
            method: 'card',
            amount_refunded: 0,
            refund_status: null,
            captured: true,
            description: 'ZeroPrint Premium Subscription',
            card_id: 'card_test123',
            bank: null,
            wallet: null,
            vpa: null,
            email: 'test@example.com',
            contact: '+919876543210',
            notes: {
              userId: 'test-citizen-1',
              subscriptionType: 'premium',
              planId: 'plan_premium_monthly',
            },
            fee: 708, // Platform fee in paise
            tax: 108, // Tax in paise
            error_code: null,
            error_description: null,
            error_source: null,
            error_step: null,
            error_reason: null,
            acquirer_data: {
              rrn: '123456789012',
            },
            created_at: Math.floor(Date.now() / 1000),
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    };

    return { ...defaultPayload, ...overrides };
  };

  describe('Payment Captured Webhook', () => {
    it('should process successful payment and activate subscription', async () => {
      const userId = 'test-citizen-1';
      const webhookPayload = createPaymentWebhookPayload();
      const payloadString = JSON.stringify(webhookPayload);
      const signature = generateWebhookSignature(payloadString);

      // Call the webhook function
      const processWebhook = httpsCallable(functions, 'processPaymentWebhook');

      const result = await processWebhook({
        payload: webhookPayload,
        signature: `sha256=${signature}`,
        headers: {
          'x-razorpay-signature': `sha256=${signature}`,
        },
      });

      expect(result.data).toEqual({
        success: true,
        message: 'Payment processed successfully',
      });

      // Verify payment record was created
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('razorpayPaymentId', '==', webhookPayload.payload.payment.entity.id),
        limit(1)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);

      expect(paymentsSnapshot.docs).toHaveLength(1);
      const payment = paymentsSnapshot.docs[0].data();

      expect(payment.userId).toBe(userId);
      expect(payment.amount).toBe(299); // Amount in rupees
      expect(payment.currency).toBe('INR');
      expect(payment.status).toBe('captured');
      expect(payment.method).toBe('card');
      expect(payment.subscriptionType).toBe('premium');

      // Verify subscription was activated
      const subscriptionQuery = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const subscriptionSnapshot = await getDocs(subscriptionQuery);

      expect(subscriptionSnapshot.docs).toHaveLength(1);
      const subscription = subscriptionSnapshot.docs[0].data();

      expect(subscription.type).toBe('premium');
      expect(subscription.planId).toBe('plan_premium_monthly');
      expect(subscription.razorpayPaymentId).toBe(webhookPayload.payload.payment.entity.id);
      expect(subscription.status).toBe('active');
      expect(new Date(subscription.expiresAt)).toBeInstanceOf(Date);

      // Verify audit log was created
      const auditLogsQuery = query(
        collection(db, 'auditLogs'),
        where('userId', '==', userId),
        where('action', '==', 'PAYMENT_PROCESSED'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const auditLogsSnapshot = await getDocs(auditLogsQuery);

      expect(auditLogsSnapshot.docs).toHaveLength(1);
      const auditLog = auditLogsSnapshot.docs[0].data();

      expect(auditLog.details.paymentId).toBe(webhookPayload.payload.payment.entity.id);
      expect(auditLog.details.amount).toBe(299);
      expect(auditLog.details.subscriptionType).toBe('premium');

      // Verify activity log was created
      const activityLogsQuery = query(
        collection(db, 'activityLogs'),
        where('userId', '==', userId),
        where('action', '==', 'SUBSCRIPTION_ACTIVATED'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const activityLogsSnapshot = await getDocs(activityLogsQuery);

      expect(activityLogsSnapshot.docs).toHaveLength(1);
      const activityLog = activityLogsSnapshot.docs[0].data();

      expect(activityLog.details.subscriptionType).toBe('premium');
      expect(activityLog.details.paymentMethod).toBe('card');
    });

    it('should handle payment failure webhook', async () => {
      const userId = 'test-citizen-1';
      const webhookPayload = createPaymentWebhookPayload({
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              ...createPaymentWebhookPayload().payload.payment.entity,
              status: 'failed',
              error_code: 'BAD_REQUEST_ERROR',
              error_description: 'Payment failed due to insufficient funds',
              error_source: 'customer',
              error_step: 'payment_authentication',
              error_reason: 'payment_failed',
            },
          },
        },
      });

      const payloadString = JSON.stringify(webhookPayload);
      const signature = generateWebhookSignature(payloadString);

      const processWebhook = httpsCallable(functions, 'processPaymentWebhook');

      const result = await processWebhook({
        payload: webhookPayload,
        signature: `sha256=${signature}`,
        headers: {
          'x-razorpay-signature': `sha256=${signature}`,
        },
      });

      expect(result.data).toEqual({
        success: true,
        message: 'Payment failure processed',
      });

      // Verify payment record was created with failed status
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('razorpayPaymentId', '==', webhookPayload.payload.payment.entity.id),
        limit(1)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);

      expect(paymentsSnapshot.docs).toHaveLength(1);
      const payment = paymentsSnapshot.docs[0].data();

      expect(payment.status).toBe('failed');
      expect(payment.errorCode).toBe('BAD_REQUEST_ERROR');
      expect(payment.errorDescription).toBe('Payment failed due to insufficient funds');

      // Verify no subscription was activated
      const subscriptionQuery = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );
      const subscriptionSnapshot = await getDocs(subscriptionQuery);

      expect(subscriptionSnapshot.docs).toHaveLength(0);

      // Verify audit log for failed payment
      const auditLogsQuery = query(
        collection(db, 'auditLogs'),
        where('userId', '==', userId),
        where('action', '==', 'PAYMENT_FAILED'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const auditLogsSnapshot = await getDocs(auditLogsQuery);

      expect(auditLogsSnapshot.docs).toHaveLength(1);
      const auditLog = auditLogsSnapshot.docs[0].data();

      expect(auditLog.details.errorCode).toBe('BAD_REQUEST_ERROR');
      expect(auditLog.details.errorDescription).toBe('Payment failed due to insufficient funds');
    });

    it('should reject webhook with invalid signature', async () => {
      const webhookPayload = createPaymentWebhookPayload();
      const invalidSignature = 'sha256=invalid_signature_123';

      const processWebhook = httpsCallable(functions, 'processPaymentWebhook');

      await expect(
        processWebhook({
          payload: webhookPayload,
          signature: invalidSignature,
          headers: {
            'x-razorpay-signature': invalidSignature,
          },
        })
      ).rejects.toThrow('Invalid webhook signature');

      // Verify no payment record was created
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('razorpayPaymentId', '==', webhookPayload.payload.payment.entity.id)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);

      expect(paymentsSnapshot.docs).toHaveLength(0);
    });

    it('should handle duplicate webhook events', async () => {
      const userId = 'test-citizen-1';
      const webhookPayload = createPaymentWebhookPayload();
      const payloadString = JSON.stringify(webhookPayload);
      const signature = generateWebhookSignature(payloadString);

      const processWebhook = httpsCallable(functions, 'processPaymentWebhook');

      const webhookData = {
        payload: webhookPayload,
        signature: `sha256=${signature}`,
        headers: {
          'x-razorpay-signature': `sha256=${signature}`,
        },
      };

      // Process webhook first time
      const result1 = await processWebhook(webhookData);
      expect(result1.data.success).toBe(true);

      // Process same webhook again
      const result2 = await processWebhook(webhookData);
      expect(result2.data).toEqual({
        success: true,
        message: 'Webhook already processed',
      });

      // Verify only one payment record exists
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('razorpayPaymentId', '==', webhookPayload.payload.payment.entity.id)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);

      expect(paymentsSnapshot.docs).toHaveLength(1);

      // Verify only one subscription was created
      const subscriptionQuery = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        where('razorpayPaymentId', '==', webhookPayload.payload.payment.entity.id)
      );
      const subscriptionSnapshot = await getDocs(subscriptionQuery);

      expect(subscriptionSnapshot.docs).toHaveLength(1);
    });
  });

  describe('Refund Webhook', () => {
    it('should process refund and update subscription status', async () => {
      const userId = 'test-citizen-1';
      const paymentId = 'pay_test123';
      const refundId = 'rfnd_test123';

      // First create a successful payment and subscription
      const paymentPayload = createPaymentWebhookPayload({
        payload: {
          payment: {
            entity: {
              ...createPaymentWebhookPayload().payload.payment.entity,
              id: paymentId,
            },
          },
        },
      });

      let payloadString = JSON.stringify(paymentPayload);
      let signature = generateWebhookSignature(payloadString);

      const processWebhook = httpsCallable(functions, 'processPaymentWebhook');

      await processWebhook({
        payload: paymentPayload,
        signature: `sha256=${signature}`,
        headers: {
          'x-razorpay-signature': `sha256=${signature}`,
        },
      });

      // Now process refund webhook
      const refundPayload = {
        entity: 'event',
        account_id: 'acc_test123',
        event: 'refund.processed',
        contains: ['refund'],
        payload: {
          refund: {
            entity: {
              id: refundId,
              entity: 'refund',
              amount: 29900,
              currency: 'INR',
              payment_id: paymentId,
              notes: {
                reason: 'Customer requested cancellation',
              },
              receipt: null,
              acquirer_data: {
                arn: 'refund_arn_123',
              },
              created_at: Math.floor(Date.now() / 1000),
              batch_id: null,
              status: 'processed',
              speed_processed: 'normal',
              speed_requested: 'normal',
            },
          },
        },
        created_at: Math.floor(Date.now() / 1000),
      };

      payloadString = JSON.stringify(refundPayload);
      signature = generateWebhookSignature(payloadString);

      const refundResult = await processWebhook({
        payload: refundPayload,
        signature: `sha256=${signature}`,
        headers: {
          'x-razorpay-signature': `sha256=${signature}`,
        },
      });

      expect(refundResult.data).toEqual({
        success: true,
        message: 'Refund processed successfully',
      });

      // Verify refund record was created
      const refundsQuery = query(
        collection(db, 'refunds'),
        where('razorpayRefundId', '==', refundId),
        limit(1)
      );
      const refundsSnapshot = await getDocs(refundsQuery);

      expect(refundsSnapshot.docs).toHaveLength(1);
      const refund = refundsSnapshot.docs[0].data();

      expect(refund.userId).toBe(userId);
      expect(refund.amount).toBe(299);
      expect(refund.status).toBe('processed');
      expect(refund.razorpayPaymentId).toBe(paymentId);

      // Verify subscription was cancelled
      const subscriptionQuery = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        where('razorpayPaymentId', '==', paymentId),
        limit(1)
      );
      const subscriptionSnapshot = await getDocs(subscriptionQuery);

      expect(subscriptionSnapshot.docs).toHaveLength(1);
      const subscription = subscriptionSnapshot.docs[0].data();

      expect(subscription.status).toBe('cancelled');
      expect(subscription.cancelledAt).toBeDefined();
      expect(subscription.cancellationReason).toBe('refund_processed');

      // Verify audit log for refund
      const auditLogsQuery = query(
        collection(db, 'auditLogs'),
        where('userId', '==', userId),
        where('action', '==', 'REFUND_PROCESSED'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const auditLogsSnapshot = await getDocs(auditLogsQuery);

      expect(auditLogsSnapshot.docs).toHaveLength(1);
      const auditLog = auditLogsSnapshot.docs[0].data();

      expect(auditLog.details.refundId).toBe(refundId);
      expect(auditLog.details.amount).toBe(299);
      expect(auditLog.details.reason).toBe('Customer requested cancellation');
    });
  });

  describe('Subscription Webhook', () => {
    it('should handle subscription charged webhook', async () => {
      const userId = 'test-citizen-1';
      const subscriptionId = 'sub_test123';

      const subscriptionPayload = {
        entity: 'event',
        account_id: 'acc_test123',
        event: 'subscription.charged',
        contains: ['subscription', 'payment'],
        payload: {
          subscription: {
            entity: {
              id: subscriptionId,
              entity: 'subscription',
              plan_id: 'plan_premium_monthly',
              customer_id: 'cust_test123',
              status: 'active',
              current_start: Math.floor(Date.now() / 1000),
              current_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
              ended_at: null,
              quantity: 1,
              notes: {
                userId: userId,
              },
              charge_at: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
              start_at: Math.floor(Date.now() / 1000),
              end_at: Math.floor((Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000),
              auth_attempts: 0,
              total_count: 12,
              paid_count: 1,
              customer_notify: true,
              created_at: Math.floor(Date.now() / 1000),
              expire_by: Math.floor((Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000),
              short_url: 'https://rzp.io/i/test123',
              has_scheduled_changes: false,
              change_scheduled_at: null,
              source: 'dashboard',
              offer_id: null,
              remaining_count: 11,
            },
          },
          payment: {
            entity: {
              id: 'pay_subscription_test123',
              entity: 'payment',
              amount: 29900,
              currency: 'INR',
              status: 'captured',
              order_id: null,
              invoice_id: 'inv_test123',
              international: false,
              method: 'card',
              amount_refunded: 0,
              refund_status: null,
              captured: true,
              description: 'ZeroPrint Premium Subscription - Monthly',
              card_id: 'card_test123',
              email: 'test@example.com',
              contact: '+919876543210',
              notes: {
                userId: userId,
              },
              created_at: Math.floor(Date.now() / 1000),
            },
          },
        },
        created_at: Math.floor(Date.now() / 1000),
      };

      const payloadString = JSON.stringify(subscriptionPayload);
      const signature = generateWebhookSignature(payloadString);

      const processWebhook = httpsCallable(functions, 'processPaymentWebhook');

      const result = await processWebhook({
        payload: subscriptionPayload,
        signature: `sha256=${signature}`,
        headers: {
          'x-razorpay-signature': `sha256=${signature}`,
        },
      });

      expect(result.data).toEqual({
        success: true,
        message: 'Subscription charged successfully',
      });

      // Verify subscription renewal was recorded
      const subscriptionQuery = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        where('razorpaySubscriptionId', '==', subscriptionId),
        limit(1)
      );
      const subscriptionSnapshot = await getDocs(subscriptionQuery);

      expect(subscriptionSnapshot.docs).toHaveLength(1);
      const subscription = subscriptionSnapshot.docs[0].data();

      expect(subscription.status).toBe('active');
      expect(subscription.currentPeriodStart).toBeDefined();
      expect(subscription.currentPeriodEnd).toBeDefined();
      expect(subscription.paidCount).toBe(1);

      // Verify payment record for subscription charge
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('razorpayPaymentId', '==', 'pay_subscription_test123'),
        limit(1)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);

      expect(paymentsSnapshot.docs).toHaveLength(1);
      const payment = paymentsSnapshot.docs[0].data();

      expect(payment.type).toBe('subscription_renewal');
      expect(payment.subscriptionId).toBe(subscriptionId);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed webhook payload', async () => {
      const malformedPayload = {
        entity: 'event',
        // Missing required fields
      };

      const payloadString = JSON.stringify(malformedPayload);
      const signature = generateWebhookSignature(payloadString);

      const processWebhook = httpsCallable(functions, 'processPaymentWebhook');

      await expect(
        processWebhook({
          payload: malformedPayload,
          signature: `sha256=${signature}`,
          headers: {
            'x-razorpay-signature': `sha256=${signature}`,
          },
        })
      ).rejects.toThrow('Invalid webhook payload');
    });

    it('should handle webhook for non-existent user', async () => {
      const webhookPayload = createPaymentWebhookPayload({
        payload: {
          payment: {
            entity: {
              ...createPaymentWebhookPayload().payload.payment.entity,
              notes: {
                userId: 'non-existent-user',
                subscriptionType: 'premium',
              },
            },
          },
        },
      });

      const payloadString = JSON.stringify(webhookPayload);
      const signature = generateWebhookSignature(payloadString);

      const processWebhook = httpsCallable(functions, 'processPaymentWebhook');

      await expect(
        processWebhook({
          payload: webhookPayload,
          signature: `sha256=${signature}`,
          headers: {
            'x-razorpay-signature': `sha256=${signature}`,
          },
        })
      ).rejects.toThrow('User not found');
    });
  });

  describe('Webhook Security', () => {
    it('should validate webhook timestamp to prevent replay attacks', async () => {
      const webhookPayload = createPaymentWebhookPayload({
        created_at: Math.floor((Date.now() - 10 * 60 * 1000) / 1000), // 10 minutes ago
      });

      const payloadString = JSON.stringify(webhookPayload);
      const signature = generateWebhookSignature(payloadString);

      const processWebhook = httpsCallable(functions, 'processPaymentWebhook');

      await expect(
        processWebhook({
          payload: webhookPayload,
          signature: `sha256=${signature}`,
          headers: {
            'x-razorpay-signature': `sha256=${signature}`,
          },
        })
      ).rejects.toThrow('Webhook timestamp too old');
    });

    it('should rate limit webhook processing', async () => {
      const webhookPayload = createPaymentWebhookPayload();
      const payloadString = JSON.stringify(webhookPayload);
      const signature = generateWebhookSignature(payloadString);

      const processWebhook = httpsCallable(functions, 'processPaymentWebhook');

      const webhookData = {
        payload: webhookPayload,
        signature: `sha256=${signature}`,
        headers: {
          'x-razorpay-signature': `sha256=${signature}`,
        },
      };

      // Send multiple rapid requests
      const promises = Array(10)
        .fill(null)
        .map(() => processWebhook(webhookData));

      const results = await Promise.allSettled(promises);

      // Some requests should be rate limited
      const rateLimitedCount = results.filter(
        result =>
          result.status === 'rejected' && result.reason.message.includes('Rate limit exceeded')
      ).length;

      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });
});
