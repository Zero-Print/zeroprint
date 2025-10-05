import functionsTest from "firebase-functions-test";
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

import {generateWeeklyInsights, getSchoolWeeklyMoodAggregateBySection} from "../trackers/trackerFunctions";
import {logUserActivity} from "../lib/auditService";

const fft = functionsTest({projectId: "zeroprint-test"});

const wrappedGenerateWeeklyInsights = fft.wrap(generateWeeklyInsights);
const wrappedGetSchoolWeeklyMoodAggregateBySection = fft.wrap(getSchoolWeeklyMoodAggregateBySection);

describe("mentalHealth weekly insights", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const now = new Date();
    const today = now.toISOString();
    const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();

    firestoreMock.reset({
      "users/test-user": {userId: "test-user", role: "citizen"},
      // mood logs in window
      "mentalHealthLogs/m1": {userId: "test-user", mood: 7, ecoMindScore: 6, timestamp: today},
      "mentalHealthLogs/m2": {userId: "test-user", mood: 8, ecoMindScore: 7, timestamp: sixDaysAgo},
      // carbon logs in window
      "carbonLogs/c1": {userId: "test-user", co2Saved: 1.2, timestamp: today},
      "carbonLogs/c2": {userId: "test-user", co2Saved: 0.8, timestamp: sixDaysAgo},
    });
  });

  afterAll(() => {
    fft.cleanup();
  });

  it("generates weekly insight and saves it", async () => {
    const resp = await wrappedGenerateWeeklyInsights({
      data: {userId: "test-user"},
      auth: {uid: "test-user"},
    } as any);
    expect(resp.success).toBe(true);
    // verify weeklyInsights doc was created
    const hasInsight = Array.from(firestoreMock.store.keys()).some((k) => k.startsWith("weeklyInsights/"));
    expect(hasInsight).toBe(true);
    expect(logUserActivity).toHaveBeenCalledWith(
      "test-user",
      "weeklyInsightsGenerated",
      expect.objectContaining({avgMood: 7.5, ecoActions: 2}),
      "trackerFunctions"
    );
  });

  it("aggregates by section for admin", async () => {
    firestoreMock.store.set("users/u1", {userId: "u1", schoolId: "s1", classId: "10", section: "A"});
    firestoreMock.store.set("users/u2", {userId: "u2", schoolId: "s1", classId: "10", section: "B"});
    // Use a timestamp that's definitely within the last 7 days
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const timestamp = yesterday.toISOString();
    firestoreMock.store.set("mentalHealthLogs/l1", {userId: "u1", mood: 6, ecoMindScore: 5, timestamp});
    firestoreMock.store.set("mentalHealthLogs/l2", {userId: "u2", mood: 8, ecoMindScore: 7, timestamp});

    const res = await wrappedGetSchoolWeeklyMoodAggregateBySection({
      data: {schoolId: "s1"},
      auth: {uid: "admin", token: {admin: true}},
    } as any);
    expect(res.success).toBe(true);
    expect(res.data.groupCount).toBeGreaterThanOrEqual(1);
    expect(Object.keys(res.data.groups)).toEqual(expect.arrayContaining(["10-A", "10-B"]));
  });
});


