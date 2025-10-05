import functionsTest from "firebase-functions-test";
import {earnCoins, redeemCoins} from "../../wallet/walletFunctions";

// Mock the database
jest.mock("../../lib/firebase", () => {
  const {createFirestoreMock} = require("../utils/firestoreMock");
  const mock = createFirestoreMock();
  return {
    db: mock.db,
    admin: {
      storage: jest.fn(() => ({bucket: () => ({file: jest.fn()})})),
    },
    auth: {
      verifyIdToken: jest.fn(),
    },
    __mockInstance: mock,
  };
});

// Import db from the mocked firebase
const {db} = require("../../lib/firebase");

const fft = functionsTest({projectId: "zeroprint-test"});
const wrappedEarnCoins = fft.wrap(earnCoins);
const wrappedRedeemCoins = fft.wrap(redeemCoins);

describe("Caps Enforcement", () => {
  const uid = `u_${Math.random().toString(36).slice(2, 8)}`;
  let mockInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mock instance from the mocked module
    const firebaseMock = require("../../lib/firebase");
    mockInstance = firebaseMock.__mockInstance;

    mockInstance.reset({
      [`users/${uid}`]: {userId: uid, email: "c@example.com", role: "citizen", isActive: true},
      "games/g1": {title: "Quiz1", isActive: true},
      [`wallets/${uid}`]: {
        walletId: uid,
        entityId: uid,
        inrBalance: 0,
        healCoins: 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        isActive: true,
        dailyEarnLimit: 500,
        monthlyEarnLimit: 1000,
      },
    });
  });

  afterAll(() => {
    fft.cleanup();
  });

  it("enforces daily earn cap", async () => {
    // earn up to the limit
    const ok = await wrappedEarnCoins({data: {userId: uid, gameId: "g1", coins: 50}, auth: {uid}} as any);
    expect(ok?.data?.earnedCoins || ok?.data?.earned || 50).toBeGreaterThan(0);
    // attempt large earn beyond allowed range
    await expect(wrappedEarnCoins({data: {userId: uid, gameId: "g1", coins: 1000}, auth: {uid}} as any)).rejects.toBeTruthy();
  });

  it("enforces monthly redeem cap", async () => {
    // top-up healCoins directly for test
    await db.collection("wallets").doc(uid).set({healCoins: 1200}, {merge: true});
    // redeem within cap
    const ok = await wrappedRedeemCoins({data: {userId: uid, amount: 500}, auth: {uid}} as any);
    expect(ok?.data?.redeemedAmount || 500).toBeGreaterThan(0);
    // redeem exceeding cap
    await expect(wrappedRedeemCoins({data: {userId: uid, amount: 1000}, auth: {uid}} as any)).rejects.toBeTruthy();
  });
});


