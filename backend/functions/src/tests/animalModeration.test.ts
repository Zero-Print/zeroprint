import functionsTest from "firebase-functions-test";
import {createFirestoreMock} from "./utils/firestoreMock";

const firestoreMock = createFirestoreMock();

const storageFactory = jest.fn(() => ({
  bucket: () => ({
    file: jest.fn(() => ({
      getSignedUrl: jest.fn(async () => ["https://upload-signed-url"]),
    })),
  }),
}));

jest.mock("../lib/firebase", () => ({
  db: firestoreMock.db,
  admin: {
    storage: storageFactory,
    firestore: {FieldValue: {arrayUnion: (...args: any[]) => ({__op: "arrayUnion", args})}},
  },
  auth: {
    verifyIdToken: jest.fn(),
  },
}));

jest.mock("../lib/auditService", () => ({
  logAudit: jest.fn(),
  logUserActivity: jest.fn(),
}));

import {approveAnimalModeration, getAnimalProofUploadUrl} from "../trackers/trackerFunctions";

const fft = functionsTest({projectId: "zeroprint-test"});
const wrappedApprove = fft.wrap(approveAnimalModeration);
const wrappedGetUpload = fft.wrap(getAnimalProofUploadUrl);

describe("Animal moderation and proof upload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    firestoreMock.reset({
      // user and wallet
      "users/u1": {userId: "u1", role: "citizen"},
      "wallets/u1": {walletId: "u1", entityId: "u1", healCoins: 0, inrBalance: 0, isActive: true},
      // existing 4 approvals to cross badge threshold for Animal Ally on 5th
      "moderationQueue/a1": {moderationId: "a1", userId: "u1", status: "approved", coinsToAward: 2},
      "moderationQueue/a2": {moderationId: "a2", userId: "u1", status: "approved", coinsToAward: 2},
      "moderationQueue/a3": {moderationId: "a3", userId: "u1", status: "approved", coinsToAward: 2},
      "moderationQueue/a4": {moderationId: "a4", userId: "u1", status: "approved", coinsToAward: 2},
      // pending moderation to approve now
      "moderationQueue/mod_5": {moderationId: "mod_5", userId: "u1", logId: "log1", status: "pending", coinsToAward: 10},
      "animalWelfareLogs/log1": {logId: "log1", userId: "u1", actions: ["feeding"], verified: false},
    });
  });

  afterAll(() => {
    fft.cleanup();
  });

  it("approves moderation, credits coins, and issues badge", async () => {
    // const ctx = { auth: { uid: "admin", token: { admin: true } }, rawRequest: { ip: "127.0.0.1", get: () => "jest" } } as any;
    const resp: any = await wrappedApprove({data: {moderationId: "mod_5"}, auth: {uid: "admin", token: {admin: true}}} as any);
    expect(resp.success).toBe(true);

    // Check wallet updated
    const wallet = firestoreMock.store.get("wallets/u1");
    expect(wallet.healCoins).toBe(10);

    // Check badges
    const user = firestoreMock.store.get("users/u1");
    expect(user.badges).toEqual(expect.arrayContaining(["Animal Ally"]));
  });

  it("returns signed URL for proof upload and records path", async () => {
    // const ctx = { auth: { uid: "u1" }, rawRequest: { ip: "127.0.0.1", get: () => "jest" } } as any;
    const res: any = await wrappedGetUpload({data: {userId: "u1", logId: "log1", filename: "proof.jpg", contentType: "image/jpeg"}, auth: {uid: "u1"}} as any);
    expect(res.success).toBe(true);
    expect(res.data.uploadUrl).toContain("https://");
    // path recorded on log
    const log = firestoreMock.store.get("animalWelfareLogs/log1");
    expect(log.proofPaths).toBeDefined();
  });
});


