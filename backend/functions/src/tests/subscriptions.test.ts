import functionsTest from "firebase-functions-test";
// import { HttpsError } from "firebase-functions/v2/https";
import {createFirestoreMock} from "./utils/firestoreMock";

const firestoreMock = createFirestoreMock();

const storageFactory = jest.fn(() => ({
  bucket: () => ({
    file: jest.fn(() => ({
      save: jest.fn(),
      getSignedUrl: jest.fn(async () => ["https://signed"]),
    })),
  }),
}));

jest.mock("../lib/firebase", () => ({
  db: firestoreMock.db,
  admin: {
    storage: storageFactory,
  },
  auth: {
    verifyIdToken: jest.fn(),
  },
}));

jest.mock("../lib/auditService", () => ({
  logAudit: jest.fn(),
  logUserActivity: jest.fn(),
  logAuditEvent: jest.fn(),
}));

jest.mock("../lib/activityService", () => ({
  logUserActivity: jest.fn(),
}));

jest.mock("razorpay", () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: "order_test123",
        amount: 1000,
        currency: "INR",
        status: "created",
      }),
    },
  }));
});

import {logAuditEvent} from "../lib/auditService";
import {logUserActivity as logUserActivityFromActivityService} from "../lib/activityService";

// Import the functions after mocks are set up
import {createSubscription} from "../subscriptions/subscriptionFunctions";

const fft = functionsTest({projectId: "zeroprint-test"});

const wrappedCreateSubscription = fft.wrap(createSubscription);
// Note: processPaymentWebhook is an onRequest function, not onCall, so we can't wrap it with fft.wrap

describe("subscriptionFunctions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    firestoreMock.reset({
      "users/test-user": {
        userId: "test-user",
        isActive: true,
      },
    });
  });

  afterAll(() => {
    fft.cleanup();
  });

  it("creates subscription and payment records for valid plan", async () => {
    const response = await wrappedCreateSubscription({
      data: {planId: "citizen"},
      auth: {uid: "test-user"},
    } as any);

    expect(response.success).toBe(true);
    expect(response.data.subscriptionId).toBeDefined();

    const hasSubscription = Array.from(firestoreMock.store.keys()).some((key) => key.startsWith("subscriptions/"));
    const hasPayment = Array.from(firestoreMock.store.keys()).some((key) => key.startsWith("payments/"));

    expect(hasSubscription).toBe(true);
    expect(hasPayment).toBe(true);

    expect(logAuditEvent).toHaveBeenCalledWith(
      "subscription_initiated",
      "test-user",
      expect.any(String),
      {},
      expect.objectContaining({
        planId: "citizen",
        amount: 99,
        razorpayOrderId: "order_test123",
      }),
      "subscription"
    );

    expect(logUserActivityFromActivityService).toHaveBeenCalledWith(expect.objectContaining({
      action: "subscription_initiated",
      userId: "test-user",
      category: "payment",
      details: expect.objectContaining({
        planId: "citizen",
        planName: "Citizen Plan",
        amount: 99,
      }),
    }));
  }, 30000);

  it("rejects invalid plan IDs", async () => {
    const response = await wrappedCreateSubscription({
      data: {planId: "invalid"},
      auth: {uid: "test-user"},
    } as any);

    expect(response.success).toBe(false);
    expect(response.message).toContain("Invalid enum value");
  });

  // Note: processPaymentWebhook is an onRequest function that can't be easily tested with fft.wrap
  // This test would need to be rewritten to test the function directly
});
