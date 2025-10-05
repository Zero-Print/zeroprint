import functionsTest from "firebase-functions-test";
import {createFirestoreMock} from "./utils/firestoreMock";

const firestoreMock = createFirestoreMock();

jest.mock("../lib/firebase", () => ({
  db: firestoreMock.db,
  admin: {
    storage: () => ({}),
  },
  auth: {
    verifyIdToken: jest.fn(),
  },
}));

jest.mock("../lib/auditService", () => ({
  logAudit: jest.fn(),
  logUserActivity: jest.fn(),
}));

import {getMSMETrends} from "../advanced/advancedFunctions";

const fft = functionsTest({projectId: "zeroprint-test"});
const wrappedGetMSMETrends = fft.wrap(getMSMETrends);

describe("MSME ESG Trends", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    firestoreMock.reset({
      // Organization with member test-user
      "organizations/org-1": {orgId: "org-1", ownerId: "owner-1", members: ["test-user"]},
      // Reports for three months
      "msmeReports/r1": {
        reportId: "r1",
        orgId: "org-1",
        month: 1,
        year: 2025,
        data: {energyConsumption: 1000, waterUsage: 500, wasteGenerated: 200, scope3Emissions: 50},
        metrics: {totalEmissions: 300, sustainabilityScore: 65},
      },
      "msmeReports/r2": {
        reportId: "r2",
        orgId: "org-1",
        month: 2,
        year: 2025,
        data: {energyConsumption: 1100, waterUsage: 520, wasteGenerated: 210, scope3Emissions: 60},
        metrics: {totalEmissions: 310, sustainabilityScore: 66},
      },
      "msmeReports/r3": {
        reportId: "r3",
        orgId: "org-1",
        month: 3,
        year: 2025,
        data: {energyConsumption: 900, waterUsage: 480, wasteGenerated: 190, scope3Emissions: 40},
        metrics: {totalEmissions: 290, sustainabilityScore: 67},
      },
    });
  });

  afterAll(() => {
    fft.cleanup();
  });

  it("computes trends and percentage changes", async () => {
    const resp: any = await wrappedGetMSMETrends({data: {orgId: "org-1"}, auth: {uid: "test-user"}} as any);
    expect(resp.status).toBe("success");
    expect(resp.data.months).toEqual(["2025-01", "2025-02", "2025-03"]);
    expect(resp.data.series.totalEmissions.length).toBe(3);
    // pct change should be computed between last two months
    expect(resp.data.pctChanges.totalEmissions).not.toBeUndefined();
    // scope3 totals present
    expect(resp.data.series.scope3Emissions[0]).toBe(50);
  });
});


