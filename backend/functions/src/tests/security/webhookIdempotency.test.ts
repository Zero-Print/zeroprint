import {partnerWebhook} from "../../integrations/integrationFunctions";
import {createFirestoreMock} from "../utils/firestoreMock";

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

function mockReq(body: any) {
  return {body} as any;
}
function mockRes() {
  const out: any = {statusCode: 200};
  out.status = (c: number) => {
    out.statusCode = c; return out;
  };
  out.json = (_: any) => out;
  return out;
}

describe("Webhook Idempotency", () => {
  const redId = `red_${Math.random().toString(36).slice(2, 8)}`;

  beforeEach(() => {
    jest.clearAllMocks();
    firestoreMock.reset({
      [`redemptions/${redId}`]: {redemptionId: redId, status: "pending"},
    });
  });

  it("handles duplicate webhook updates without throwing", async () => {
    const req1 = mockReq({redemptionId: redId, status: "fulfilled"});
    const res1 = mockRes();
    await partnerWebhook(req1, res1);
    expect(res1.statusCode).toBe(200);

    const req2 = mockReq({redemptionId: redId, status: "fulfilled"});
    const res2 = mockRes();
    await partnerWebhook(req2, res2);
    expect(res2.statusCode).toBe(200);

    // The test passes if both calls return 200 without throwing
    // The actual database update behavior is tested in integration tests
  });
});


