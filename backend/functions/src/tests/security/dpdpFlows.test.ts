import functionsTest from "firebase-functions-test";
import {createFirestoreMock} from "../utils/firestoreMock";
import {exportUserData, deleteUserAccount} from "../../security/securityFunctions";

const firestoreMock = createFirestoreMock();

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
  };
});

const fft = functionsTest({projectId: "zeroprint-test"});
const wrappedExportUserData = fft.wrap(exportUserData);
const wrappedDeleteUserAccount = fft.wrap(deleteUserAccount);

describe("DPDP Flows", () => {
  const uid = `u_${Math.random().toString(36).slice(2, 8)}`;

  beforeEach(() => {
    jest.clearAllMocks();
    firestoreMock.reset({
      [`users/${uid}`]: {userId: uid, email: "t@example.com", name: "Test"},
      [`wallets/${uid}`]: {walletId: uid, entityId: uid, healCoins: 10, inrBalance: 0, createdAt: new Date().toISOString(), lastUpdated: new Date().toISOString(), isActive: true},
      [`carbonLogs/c_${uid}`]: {logId: `c_${uid}`, userId: uid, co2Saved: 1, timestamp: new Date().toISOString()},
    });
  });

  afterAll(() => {
    fft.cleanup();
  });

  it("exports user data", async () => {
    const res = await wrappedExportUserData({data: {userId: uid}, auth: {uid}} as any);
    expect(res?.success).toBe(true);
    expect(res?.data).toBeTruthy();
    expect(res?.data?.wallets).toBeDefined();
  });

  it("deletes user account (anonymize)", async () => {
    const res = await wrappedDeleteUserAccount({data: {userId: uid}, auth: {uid}} as any);
    expect(res?.success).toBe(true);

    // The actual database update behavior is tested in integration tests
    // This unit test just verifies the function returns success
  });
});


