import functionsTest from "firebase-functions-test";
import {HttpsError} from "firebase-functions/v2/https";
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
}));

jest.mock("axios", () => ({get: jest.fn()}));
import axios from "axios";
import {logAudit, logUserActivity} from "../lib/auditService";

// Import the functions after mocks are set up
import {logCarbonAction, logMoodCheckin} from "../trackers/trackerFunctions";

const fft = functionsTest({projectId: "zeroprint-test"});

const wrappedLogCarbonAction = fft.wrap(logCarbonAction);
const wrappedLogMoodCheckin = fft.wrap(logMoodCheckin);

describe("trackerFunctions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    firestoreMock.reset({
      "users/test-user": {
        userId: "test-user",
        isActive: true,
      },
      "wallets/test-user": {
        walletId: "test-user",
        entityId: "test-user",
        healCoins: 0,
        inrBalance: 0,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isActive: true,
      },
    });
  });

  afterAll(() => {
    fft.cleanup();
  });

  it("logs carbon action and awards coins", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({data: {factor: 0.12}});
    const response = await wrappedLogCarbonAction({
      data: {userId: "test-user", actionType: "transport", value: 10},
      auth: {uid: "test-user"},
    } as any);

    expect(response.status).toBe("success");
    expect(logAudit).toHaveBeenCalledWith(
      "logCarbonAction",
      "test-user",
      expect.any(String),
      {},
      expect.objectContaining({
        actionType: "transport",
        co2Saved: 1.2,
        coinsAwarded: 12,
      }),
      "trackerFunctions"
    );
    expect(logUserActivity).toHaveBeenCalledWith(
      "test-user",
      "carbonActionLogged",
      expect.objectContaining({
        actionType: "transport",
        co2Saved: 1.2,
        coinsAwarded: 12,
      }),
      "trackerFunctions"
    );

    const hasCarbonLog = Array.from(firestoreMock.store.keys()).some((key) => key.startsWith("carbonLogs/"));
    expect(hasCarbonLog).toBe(true);
  });

  it("uses India state grid intensity for energy when API unavailable", async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error("network"));
    const resp = await wrappedLogCarbonAction({
      data: {userId: "test-user", actionType: "energy", value: 10, location: "DL"},
      auth: {uid: "test-user"},
    } as any);
    expect(resp.status).toBe("success");
    // Since DL=0.72, co2Saved ~ 7.2kg and coins >=1
    const carbonLogKey = Array.from(firestoreMock.store.keys()).find((k) => k.startsWith("carbonLogs/"))!;
    const log = firestoreMock.store.get(carbonLogKey);
    expect(log.source).toBe("mock");
    expect(log.isAuditable).toBe(false);
  });

  it("falls back to mock factors when API fails", async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error("network"));
    const response = await wrappedLogCarbonAction({
      data: {userId: "test-user", actionType: "transport", value: 5},
      auth: {uid: "test-user"},
    } as any);
    expect(response.status).toBe("success");
  });

  it("rejects extreme negative/invalid values", async () => {
    await expect(
      wrappedLogCarbonAction({
        data: {userId: "test-user", actionType: "energy", value: -1},
        auth: {uid: "test-user"},
      } as any)
    ).rejects.toEqual(expect.objectContaining({code: "invalid-argument"}));

    await expect(
      wrappedLogCarbonAction({
        data: {userId: "test-user", actionType: "energy", value: 999999999},
        auth: {uid: "test-user"},
      } as any)
    ).rejects.toEqual(expect.objectContaining({code: "invalid-argument"}));
  });

  it("prevents duplicate carbon logs within cooldown window", async () => {
    const timestamp = new Date().toISOString();
    firestoreMock.store.set("carbonLogs/log-1", {
      userId: "test-user",
      actionType: "transport",
      timestamp,
    });

    await expect(
      wrappedLogCarbonAction({
        data: {userId: "test-user", actionType: "transport", value: 5},
        auth: {uid: "test-user"},
      } as any)
    ).rejects.toEqual(expect.objectContaining({code: "already-exists"}));
  });

  it("rejects mood values outside allowed range", async () => {
    await expect(
      wrappedLogMoodCheckin({
        data: {userId: "test-user", mood: 15},
        auth: {uid: "test-user"},
      } as any)
    ).rejects.toThrowError(HttpsError);
  });
});
