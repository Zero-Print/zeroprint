import { initializeTestApp, assertFails } from "@firebase/testing";

describe("Firestore Security Rules", () => {
  test("citizen cannot modify another user's wallet", async () => {
    const app = initializeTestApp({ projectId: "test", auth: { uid: "user1" }});
    const db = app.firestore();
    await expect(db.collection("wallets").doc("user2").update({ healCoins: 999 })).rejects.toThrow();
  });

  test("admin can access any wallet", async () => {
    const app = initializeTestApp({ 
      projectId: "test", 
      auth: { uid: "admin1", claims: { admin: true } }
    });
    const db = app.firestore();
    await expect(db.collection("wallets").doc("user1").get()).resolves.toBeDefined();
  });

  test("user cannot exceed maximum wallet balance", async () => {
    const app = initializeTestApp({ projectId: "test", auth: { uid: "user1" }});
    const db = app.firestore();
    await expect(
      db.collection("wallets").doc("user1").update({ healCoins: 100000 })
    ).rejects.toThrow();
  });

  test("user cannot create duplicate transactions", async () => {
    const app = initializeTestApp({ projectId: "test", auth: { uid: "user1" }});
    const db = app.firestore();
    const txnRef = db.collection("transactions");
    
    // First transaction should succeed
    await txnRef.add({
      id: "txn-123",
      userId: "user1",
      amount: 100,
      type: "credit",
      timestamp: new Date()
    });
    
    // Duplicate transaction should fail
    await expect(
      txnRef.add({
        id: "txn-123",
        userId: "user1",
        amount: 100,
        type: "credit",
        timestamp: new Date()
      })
    ).rejects.toThrow();
  });
});