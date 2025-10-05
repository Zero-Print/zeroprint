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
}));

import {addKindnessAction, updateKindnessAction, listKindnessActions, getKindnessActionById} from "../animal/kindnessFunctions";

const fft = functionsTest({projectId: "zeroprint-test"});
const wrappedAdd = fft.wrap(addKindnessAction);
const wrappedUpdate = fft.wrap(updateKindnessAction);
const wrappedList = fft.wrap(listKindnessActions);
const wrappedGet = fft.wrap(getKindnessActionById);

describe("Kindness Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    firestoreMock.reset({});
  });

  afterAll(() => {
    fft.cleanup();
  });

  it("adds, updates, lists and gets kindness actions", async () => {
    // const adminCtx = { auth: { uid: "admin", token: { admin: true } }, rawRequest: { ip: "127.0.0.1", get: () => "jest" } } as any;

    // add
    const addResp: any = await wrappedAdd({data: {title: "Feed Strays", regionTags: ["IN-DL"], baseCoins: 5, isActive: true}, auth: {uid: "admin", token: {admin: true}}} as any);
    expect(addResp.success).toBe(true);
    const id = addResp.data.id;
    const stored = firestoreMock.store.get(`kindnessActions/${id}`);
    expect(stored.title).toBe("Feed Strays");

    // update
    const upd: any = await wrappedUpdate({data: {id, updates: {isActive: false}}, auth: {uid: "admin", token: {admin: true}}} as any);
    expect(upd.success).toBe(true);
    const updated = firestoreMock.store.get(`kindnessActions/${id}`);
    expect(updated.isActive).toBe(false);

    // list region filter - add another active action for testing
    firestoreMock.store.set("kindnessActions/k2", {id: "k2", title: "Plant Trees", regionTags: ["IN-KA"], baseCoins: 8, isActive: true, createdAt: new Date().toISOString()});
    // Add another action in the same region as the first one
    firestoreMock.store.set("kindnessActions/k3", {id: "k3", title: "Water Plants", regionTags: ["IN-DL"], baseCoins: 3, isActive: true, createdAt: new Date().toISOString()});

    const listResp: any = await wrappedList({data: {region: "IN-DL"}, auth: {uid: "u1"}} as any);
    expect(listResp.success).toBe(true);
    expect(listResp.data.find((a: any) => a.id === "k3")).toBeDefined(); // Should find the active action in IN-DL
    expect(listResp.data.find((a: any) => a.id === "k2")).toBeUndefined(); // Should not find action in IN-KA

    // get by id
    const getResp: any = await wrappedGet({data: {id}, auth: {uid: "u1"}} as any);
    expect(getResp.success).toBe(true);
    expect(getResp.data.id).toBe(id);
  });
});


