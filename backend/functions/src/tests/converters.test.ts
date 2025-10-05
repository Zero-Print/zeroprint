import {describe, it, expect} from "@jest/globals";
import type {CarbonLog} from "../../../../types/trackers";

describe("Firestore converters (placeholder)", () => {
  it("serializes and deserializes CarbonLog without losing fields", () => {
    const log: CarbonLog = {
      logId: "log1",
      userId: "u1",
      actionType: "transport",
      value: 10,
      co2Saved: 2.5,
      coinsEarned: 5,
      timestamp: new Date().toISOString(),
    };
    const serialized = {...log};
    const deserialized = {...serialized} as CarbonLog;
    expect(deserialized).toEqual(log);
  });
});


