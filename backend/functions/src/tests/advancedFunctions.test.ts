import functionsTest from "firebase-functions-test";
import {createFirestoreMock} from "./utils/firestoreMock";

const firestoreMock = createFirestoreMock();

const storageFileMock = {
  save: jest.fn(async () => undefined),
  getSignedUrl: jest.fn(async () => ["https://signed-report"]),
};

const storageBucketMock = {
  file: jest.fn(() => storageFileMock),
};

const storageFactory = jest.fn(() => ({bucket: () => storageBucketMock}));

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

import {logAudit, logUserActivity} from "../lib/auditService";

// Import the functions after mocks are set up
import {generateMSMEReport} from "../advanced/advancedFunctions";

const fft = functionsTest({projectId: "zeroprint-test"});

const wrappedGenerateMSMEReport = fft.wrap(generateMSMEReport);

describe("advancedFunctions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    firestoreMock.reset({
      "organizations/org-1": {
        orgId: "org-1",
        ownerId: "test-user",
        members: ["test-user"],
        name: "Test Org",
      },
    });
  });

  afterAll(() => {
    fft.cleanup();
  });

  it("generates MSME report and uploads PDF", async () => {
    const response = await wrappedGenerateMSMEReport({
      data: {
        orgId: "org-1",
        month: 1,
        year: 2025,
        data: {
          scope1Emissions: 100,
          scope2Emissions: 200,
          energyConsumption: 5000,
          waterUsage: 1200,
          wasteGenerated: 400,
          wasteRecycled: 200,
          employeeCount: 50,
          sustainabilityInitiatives: ["Solar", "Recycling"],
          certifications: ["ISO"],
        },
      },
      auth: {uid: "test-user"},
    } as any);

    expect(response.status).toBe("success");
    expect(response.data.report.pdfUrl).toBe("https://signed-report");

    const hasReport = Array.from(firestoreMock.store.keys()).some((key) => key.startsWith("msmeReports/"));
    expect(hasReport).toBe(true);
    expect(storageBucketMock.file).toHaveBeenCalled();
    expect(storageFileMock.save).toHaveBeenCalled();
    expect(storageFileMock.getSignedUrl).toHaveBeenCalled();
    expect(logAudit).toHaveBeenCalledWith(
      "generateMSMEReport",
      "test-user",
      expect.any(String),
      {},
      expect.objectContaining({
        orgId: "org-1",
        month: 1,
        year: 2025,
        totalEmissions: 300,
        sustainabilityScore: 86,
      }),
      "advancedFunctions"
    );
    expect(logUserActivity).toHaveBeenCalledWith(
      "test-user",
      "msmeReportGenerated",
      expect.objectContaining({
        orgId: "org-1",
        month: 1,
        year: 2025,
        sustainabilityScore: 86,
      }),
      "advancedFunctions"
    );
  });
});
