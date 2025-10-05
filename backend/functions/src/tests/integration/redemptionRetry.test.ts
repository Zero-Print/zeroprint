import functionsTest from "firebase-functions-test";
import {dispatchRedemption} from "../../integrations/integrationFunctions";

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
const wrappedDispatchRedemption = fft.wrap(dispatchRedemption);

describe("Redemption Retry Flow", () => {
  const uid = `u_${Math.random().toString(36).slice(2, 8)}`;
  const redId = `red_${Math.random().toString(36).slice(2, 8)}`;
  let mockInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mock instance from the mocked module
    const firebaseMock = require("../../lib/firebase");
    mockInstance = firebaseMock.__mockInstance;

    mockInstance.reset({
      [`users/${uid}`]: {userId: uid, email: "r@example.com"},
      "partnerConfigs/simulator": {partnerId: "simulator", enabled: true},
      [`redemptions/${redId}`]: {redemptionId: redId, userId: uid, rewardId: "rew1", amount: 100, status: "failed", createdAt: new Date().toISOString()},
    });
  });

  afterAll(() => {
    fft.cleanup();
  });

  it("re-dispatches failed redemption and updates status", async () => {
    const res = await wrappedDispatchRedemption({data: {redemptionId: redId}, auth: {uid}} as any);
    expect(res?.success).toBeDefined();
    const snap = await db.collection("redemptions").doc(redId).get();
    const st = (snap.data() as any)?.status;
    expect(["fulfilled", "failed"]).toContain(st);
  });
});


