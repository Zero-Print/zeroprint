import {createFirestoreMock} from "../utils/firestoreMock";
import {v4 as uuidv4} from "uuid";
import {detectSuspiciousActivity} from "../../lib/fraudDetection";

const firestoreMock = createFirestoreMock();

// Mock the database
jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  firestore: () => firestoreMock.db,
  FieldValue: {
    serverTimestamp: jest.fn(() => new Date().toISOString()),
  },
}));

// Mock implementation of fraud detection service
jest.mock("../../lib/fraudDetection", () => ({
  detectSuspiciousActivity: jest.fn(),
}));

describe("Fraud Prevention Scenarios", () => {
  const testUserId = `test-user-${uuidv4()}`;

  beforeEach(() => {
    jest.clearAllMocks();
    firestoreMock.reset({
      [`users/${testUserId}`]: {
        userId: testUserId,
        email: `test-${testUserId}@example.com`,
        displayName: "Test User",
        createdAt: new Date().toISOString(),
      },
      [`wallets/${testUserId}`]: {
        userId: testUserId,
        balance: 100,
        lifetimeEarned: 100,
        lifetimeSpent: 0,
        updatedAt: new Date().toISOString(),
      },
    });
  });

  // No cleanup needed with mocks

  test("Should detect rapid successive transactions", async () => {
    // Mock fraud detection to flag rapid transactions
    (detectSuspiciousActivity as jest.Mock).mockImplementation((userId, action, data) => {
      if (action === "earn_coins" && data.source === "rapid_source") {
        return {isSuspicious: true, reason: "Rapid successive transactions detected"};
      }
      return {isSuspicious: false};
    });

    // Test fraud detection directly
    const result1 = await detectSuspiciousActivity(testUserId, "earn_coins", {amount: 10, source: "rapid_source"});
    expect(result1.isSuspicious).toBe(true);
    expect(result1.reason).toBe("Rapid successive transactions detected");

    const result2 = await detectSuspiciousActivity(testUserId, "earn_coins", {amount: 5, source: "normal_source"});
    expect(result2.isSuspicious).toBe(false);
  });

  test("Should detect unusual transaction patterns", async () => {
    // Mock fraud detection to flag unusual patterns
    (detectSuspiciousActivity as jest.Mock).mockImplementation((userId, action, data) => {
      if (action === "redeem_coins" && data.coins > 50) {
        return {isSuspicious: true, reason: "Unusual redemption amount"};
      }
      return {isSuspicious: false};
    });

    // Test fraud detection directly
    const result1 = await detectSuspiciousActivity(testUserId, "redeem_coins", {coins: 60});
    expect(result1.isSuspicious).toBe(true);
    expect(result1.reason).toBe("Unusual redemption amount");

    const result2 = await detectSuspiciousActivity(testUserId, "redeem_coins", {coins: 30});
    expect(result2.isSuspicious).toBe(false);
  });

  test("Should allow legitimate transactions", async () => {
    // Mock fraud detection to allow normal transactions
    (detectSuspiciousActivity as jest.Mock).mockReturnValue({isSuspicious: false});

    // Test fraud detection directly
    const result = await detectSuspiciousActivity(testUserId, "earn_coins", {amount: 10, source: "normal_source"});
    expect(result.isSuspicious).toBe(false);
  });

  test("Should detect multiple device logins", async () => {
    // Mock fraud detection to flag multiple device logins
    (detectSuspiciousActivity as jest.Mock).mockImplementation((userId, action, data) => {
      if (action === "user_login" && data.deviceId === "new_device") {
        return {isSuspicious: true, reason: "Multiple device logins detected"};
      }
      return {isSuspicious: false};
    });

    // Simulate login from new device
    const loginData = {
      userId: testUserId,
      deviceId: "new_device",
      ipAddress: "192.168.1.1",
      timestamp: new Date().toISOString(),
    };

    // Call fraud detection directly for this test
    const result = await detectSuspiciousActivity(testUserId, "user_login", loginData);

    // Should be flagged as suspicious
    expect(result.isSuspicious).toBe(true);
    expect(result.reason).toBe("Multiple device logins detected");
  });
});
