const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Reusable function to add HealCoins
async function addHealCoins(userId, amount, reason) {
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

  // Add transaction
  const txId = `tx_${Date.now()}`;
  await walletRef.collection("transactions").doc(txId).set({
    type: "earn",
    amount,
    reason,
    createdAt: new Date(),
    createdBy: "system",
    status: "posted",
  });
}

/**
 * Log Mood Action
 * POST body: { userId, mood }
 */
exports.logMood = functions.https.onRequest(async (req, res) => {
  try {
    const { userId, mood } = req.body;
    if (!userId || !mood) {
      return res.status(400).json({ error: "userId and mood required" });
    }

    await db.collection("moodLogs").doc().set({
      userId,
      mood,
      createdAt: new Date(),
    });

    // Award 5 HealCoins
    await addHealCoins(userId, 5, "Mood log");

    return res.json({ success: true, message: "Mood logged & HealCoins added" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Log Kindness Action
 * POST body: { userId, action, description }
 */
exports.logKindness = functions.https.onRequest(async (req, res) => {
  try {
    const { userId, action, description } = req.body;
    if (!userId || !action) {
      return res.status(400).json({ error: "userId and action required" });
    }

    await db.collection("kindnessLogs").doc().set({
      userId,
      action,
      description: description || "",
      createdAt: new Date(),
    });

    // Award 10 HealCoins
    await addHealCoins(userId, 10, "Kindness log");

    return res.json({ success: true, message: "Kindness logged & HealCoins added" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
