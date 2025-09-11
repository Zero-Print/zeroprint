const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

/**
 * GET /api/wallet/balance
 * Body: { userId }
 */
exports.getWalletBalance = functions.https.onRequest(async (req, res) => {
  try {
    const { userId } = req.query; 
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const walletRef = db.collection("wallets").doc(userId);
    const walletSnap = await walletRef.get();

    if (!walletSnap.exists) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    return res.json(walletSnap.data());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/wallet/history
 * Body: { userId }
 */
exports.getWalletHistory = functions.https.onRequest(async (req, res) => {
  try {
    const { userId } = req.query; // GET request query param
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const transactionsSnap = await db
      .collection("wallets")
      .doc(userId)
      .collection("transactions")
      .orderBy("createdAt", "desc")
      .get();

    if (transactionsSnap.empty) {
      return res.json([]);
    }

    const transactions = transactionsSnap.docs.map(doc => doc.data());
    return res.json(transactions);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
