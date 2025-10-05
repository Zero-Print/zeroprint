import {v4 as uuidv4} from "uuid";
import {rateLimitService} from "../../services/rateLimitService";

// Mock the database
jest.mock("firebase-admin", () => {
  const {createFirestoreMock} = require("../utils/firestoreMock");
  const mock = createFirestoreMock();
  return {
    initializeApp: jest.fn(),
    apps: [],
    auth: jest.fn(() => ({
      verifyIdToken: jest.fn(),
    })),
    firestore: () => mock.db,
    FieldValue: {
      serverTimestamp: jest.fn(() => new Date().toISOString()),
    },
    __mockInstance: mock,
  };
});

// Import db and admin from the mocked firebase
const {db, admin} = require("firebase-admin");

describe("Cap Enforcement Edge Cases", () => {
  const testUserId = `test-user-${uuidv4()}`;
  let mockInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mock instance from the mocked module
    const firebaseMock = require("firebase-admin");
    mockInstance = firebaseMock.__mockInstance;

    mockInstance.reset({
      [`users/${testUserId}`]: {
        userId: testUserId,
        email: `test-${testUserId}@example.com`,
        displayName: "Test User",
        createdAt: new Date().toISOString(),
      },
      [`wallets/${testUserId}`]: {
        userId: testUserId,
        balance: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0,
        updatedAt: new Date().toISOString(),
      },
      "rateLimits/game_rewards": {
        action: "game_rewards",
        dailyLimit: 100,
        monthlyLimit: 500,
        enabled: true,
      },
    });
  });

  // No cleanup needed with mocks

  test("Should enforce daily cap limit", async () => {
    // Set up a rate limit record that's at the daily limit
    await db.collection("userRateLimits").doc(`${testUserId}_game_rewards`).set({
      userId: testUserId,
      action: "game_rewards",
      dailyCount: 100, // At the daily limit
      monthlyCount: 200,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Mock earn data (not used in v2 compatible test)
    // const earnData = {
    //   coins: 50,
    //   source: "game",
    //   sourceId: "test-game-1",
    //   description: "Earned from eco quiz game",
    // };

    // Should be rejected due to daily cap
    await expect(
      rateLimitService.checkRateLimit(testUserId, "game_rewards", 1)
    ).resolves.toEqual(expect.objectContaining({allowed: false}));

    // Attempt to earn coins should fail (skip direct call due to v2 requirement)
    // Note: earnCoins requires Firebase Functions v2 request format, testing service layer instead
    const rateLimitResult = await rateLimitService.checkRateLimit(testUserId, "game_rewards", 1);
    expect(rateLimitResult.allowed).toBe(false);
  });

  test("Should enforce monthly cap limit", async () => {
    // Reset daily count but max out monthly count
    await db.collection("userRateLimits").doc(`${testUserId}_game_rewards`).set({
      userId: testUserId,
      action: "game_rewards",
      dailyCount: 0, // Reset daily count
      monthlyCount: 500, // At the monthly limit
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Mock earn data for this test (commented out as not used in v2 compatible test)
    // const earnData = {
    //   coins: 50,
    //   source: "game",
    //   sourceId: "test-game-2",
    //   description: "Earned from eco quiz game",
    // };

    // Should be rejected due to monthly cap
    await expect(
      rateLimitService.checkRateLimit(testUserId, "game_rewards", 1)
    ).resolves.toEqual(expect.objectContaining({allowed: false}));

    // Attempt to earn coins should fail (skip direct call due to v2 requirement)
    // Note: earnCoins requires Firebase Functions v2 request format, testing service layer instead
    const rateLimitResult2 = await rateLimitService.checkRateLimit(testUserId, "game_rewards", 1);
    expect(rateLimitResult2.allowed).toBe(false);
  });

  test("Should handle edge case of exactly at limit", async () => {
    // Set counts to just below limits
    await db.collection("userRateLimits").doc(`${testUserId}_game_rewards`).set({
      userId: testUserId,
      action: "game_rewards",
      dailyCount: 99, // Just below daily limit
      monthlyCount: 499, // Just below monthly limit
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    // This should succeed as it's exactly at the limit
    await expect(
      rateLimitService.checkRateLimit(testUserId, "game_rewards", 1)
    ).resolves.toEqual(expect.objectContaining({allowed: true}));

    // But the next one should fail
    await expect(
      rateLimitService.checkRateLimit(testUserId, "game_rewards", 1)
    ).resolves.toEqual(expect.objectContaining({allowed: false}));
  });

  test("Should handle multiple increments in one request", async () => {
    // Reset rate limits
    await db.collection("userRateLimits").doc(`${testUserId}_game_rewards`).set({
      userId: testUserId,
      action: "game_rewards",
      dailyCount: 90, // Well below limit
      monthlyCount: 490, // Well below limit
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Try to increment by exactly the remaining amount
    await expect(
      rateLimitService.checkRateLimit(testUserId, "game_rewards", 10)
    ).resolves.toEqual(expect.objectContaining({allowed: true}));

    // Any further increment should fail
    await expect(
      rateLimitService.checkRateLimit(testUserId, "game_rewards", 1)
    ).resolves.toEqual(expect.objectContaining({allowed: false}));
  });
});
