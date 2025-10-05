import {converters} from "../../lib/typedFirestore";

describe("Firestore converters", () => {
  it("serializes/deserializes CarbonLog", () => {
    const data = {
      logId: "log1", userId: "u1", actionType: "transport", value: 10, co2Saved: 2.1, coinsEarned: 21, timestamp: "2025-01-01T00:00:00Z",
    };
    const toFs = converters.carbonLog.toFirestore(data as any);
    expect(toFs.co2Saved).toBe(2.1);
  });
});


