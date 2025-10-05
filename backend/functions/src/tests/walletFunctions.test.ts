import functionsTest from "firebase-functions-test";
import {HttpsError} from "firebase-functions/v2/https";
import {logAudit, logUserActivity} from "../lib/auditService";
import {DAILY_EARN_LIMIT, MONTHLY_REDEEM_LIMIT} from "../lib/securityHelpers";

// Mock setup - create mock inside the jest.mock function
jest.mock("../lib/firebase", () => {
  const {createFirestoreMock} = require("./utils/firestoreMock");
  const mock = createFirestoreMock();
  const storageFactory = jest.fn(() => ({bucket: () => ({
    file: jest.fn(() => ({
      save: jest.fn(async () => undefined),
      getSignedUrl: jest.fn(async () => ["https://signed-url.example"]),
    })),
  })}));
  return {
    db: mock.db,
    admin: {
      storage: storageFactory,
    },
    auth: {
      verifyIdToken: jest.fn(),
    },
    // Export the mock instance so we can access it in tests
    __mockInstance: mock,
  };
});

jest.mock("../lib/auditService", () => ({
  logAudit: jest.fn(),
  logUserActivity: jest.fn(),
}));

// Import the functions after mocks are set up
import {earnCoins, redeemCoins} from "../wallet/walletFunctions";

const fft = functionsTest({projectId: "zeroprint-test"});

const wrappedEarnCoins = fft.wrap(earnCoins);
const wrappedRedeemCoins = fft.wrap(redeemCoins);

describe("walletFunctions", () => {
  let mockInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mock instance from the mocked module
    const firebaseMock = require("../lib/firebase");
    mockInstance = firebaseMock.__mockInstance;

    // Reset the mock data
    mockInstance.reset({
      "users/test-user": {
        userId: "test-user",
        isActive: true,
        role: "citizen",
      },
      "games/test-game": {
        gameId: "test-game",
        isActive: true,
        title: "Eco Quiz",
      },
    });
  });

  afterAll(() => {
    fft.cleanup();
  });

  it("awards HealCoins when validation succeeds", async () => {
    const response = await wrappedEarnCoins({
      data: {userId: "test-user", gameId: "test-game", coins: 50},
      auth: {uid: "test-user"},
    } as any);

    expect(response.status).toBe("success");
    expect(response.data.updatedWallet.healCoins).toBe(50);

    const walletDoc = mockInstance.store.get("wallets/test-user");
    expect(walletDoc).toBeDefined();
    expect(walletDoc.healCoins).toBe(50);

    expect(logAudit).toHaveBeenCalledWith(
      "earnCoins",
      "test-user",
      "test-user",
      {},
      expect.objectContaining({
        coins: 50,
        gameId: "test-game",
        gameTitle: "Eco Quiz",
        newBalance: 50,
      }),
      "walletFunctions"
    );
    expect(logUserActivity).toHaveBeenCalledWith(
      "test-user",
      "earnCoins",
      expect.objectContaining({
        coins: 50,
        gameId: "test-game",
        gameTitle: "Eco Quiz",
      }),
      "walletFunctions"
    );
  });

  it("rejects earning when daily cap exceeded", async () => {
    const today = new Date().toISOString();
    mockInstance.store.set("auditLogs/log-1", {
      userId: "test-user",
      action: "earnCoins",
      details: {coins: DAILY_EARN_LIMIT - 10},
      timestamp: today,
    });

    await expect(
      wrappedEarnCoins({
        data: {userId: "test-user", gameId: "test-game", coins: 20},
        auth: {uid: "test-user"},
      } as any)
    ).rejects.toEqual(expect.objectContaining({
      code: "resource-exhausted",
    }));
  });

  it("prevents redemption when balance is insufficient", async () => {
    mockInstance.store.set("wallets/test-user", {
      walletId: "test-user",
      entityId: "test-user",
      healCoins: 25,
      inrBalance: 0,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isActive: true,
      dailyEarnLimit: DAILY_EARN_LIMIT,
      monthlyEarnLimit: MONTHLY_REDEEM_LIMIT,
    });

    await expect(
      wrappedRedeemCoins({
        data: {userId: "test-user", amount: 50},
        auth: {uid: "test-user"},
      } as any)
    ).rejects.toThrowError(HttpsError);
  });
});
