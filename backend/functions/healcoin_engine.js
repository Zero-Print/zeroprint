const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

exports.addHealCoins = functions.https.onRequest(async (req, res) => {
  try {
    const { userId, amount, reason, idempotencyKey } = req.body;
    if (!userId || !amount || !reason || !idempotencyKey) {
      return res.status(400).json({ error: "userId, amount, reason, and idempotencyKey required" });
    }

    const walletRef = db.collection("wallets").doc(userId);
    const walletSnap = await walletRef.get();

    if (!walletSnap.exists) {
      await walletRef.set({
        userId,
        balance: amount,
        lifetimeEarned: amount,
        lifetimeRedeemed: 0,
        lastUpdated: new Date(),
      });
    } else {
      const data = walletSnap.data();
      await walletRef.update({
        balance: (data.balance || 0) + amount,
        lifetimeEarned: (data.lifetimeEarned || 0) + amount,
        lastUpdated: new Date(),
      });
    }

    // Transaction
    await walletRef.collection("transactions").doc(idempotencyKey).set({
      type: "earn",
      amount,
      reason,
      idempotencyKey,
      createdAt: new Date(),
      createdBy: "system",
      status: "posted",
    });

    return res.json({ success: true, added: amount });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
