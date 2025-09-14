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
 * Rule Engine JSON
 * - Waste scenario example
 */
const RULE_ENGINE = {
  waste: {
    high: { min: 80, reward: 10, message: "Great job! You sorted most of your waste." },
    medium: { min: 50, reward: 5, message: "Good try! You can improve sorting further." },
    low: { min: 0, reward: 0, message: "Needs improvement. Try sorting better next time." }
  }
};

/**
 * Helper: Award HealCoins (same style as game_logic.js)
 */
async function awardHealCoins(userId, amount, reason) {
  const walletRef = db.collection("wallets").doc(userId);

  await db.runTransaction(async (t) => {
    const walletDoc = await t.get(walletRef);
    if (!walletDoc.exists) throw new Error("Wallet not found!");

    const currentBalance = walletDoc.data().balance || 0;
    const newBalance = currentBalance + amount;

    t.update(walletRef, {
      balance: newBalance,
      lifetimeEarned: (walletDoc.data().lifetimeEarned || 0) + amount,
      lastUpdated: new Date(),
    });

    // Transaction history
    const txRef = walletRef.collection("transactions").doc();
    t.set(txRef, {
      type: "earn",
      amount,
      reason,
      createdAt: new Date(),
      createdBy: "system",
      status: "posted",
    });
  });
}

/**
 * POST /api/simulation/digital-twin
 * Body: { userId, scenario, parameters }
 */
exports.runSimulation = functions.https.onRequest(async (req, res) => {
  try {
    const { userId, scenario, parameters } = req.body;

    if (!userId || !scenario || !parameters) {
      return res.status(400).json({ error: "userId, scenario, and parameters required" });
    }

    // Currently support only "waste" scenario
    if (scenario !== "waste") {
      return res.status(400).json({ error: "Unsupported scenario" });
    }

    // Calculate percentage
    const total = parameters.totalWaste || 0;
    const sorted = parameters.sortedWaste || 0;
    const percent = total > 0 ? (sorted / total) * 100 : 0;

    // Apply Rule Engine
    let result = RULE_ENGINE.waste.low;
    if (percent >= RULE_ENGINE.waste.high.min) {
      result = RULE_ENGINE.waste.high;
    } else if (percent >= RULE_ENGINE.waste.medium.min) {
      result = RULE_ENGINE.waste.medium;
    }

    // Save result in Firestore
    const simRef = db.collection("simulationData").doc();
    await simRef.set({
      userId,
      scenario,
      parameters,
      percent,
      message: result.message,
      healCoinsAwarded: result.reward,
      createdAt: new Date(),
    });

    //  Also award HealCoins into wallet if reward > 0
    if (result.reward > 0) {
      await awardHealCoins(userId, result.reward, `Simulation Reward: ${scenario}`);
    }

    return res.json({
      success: true,
      scenario,
      score: percent,
      message: result.message,
      healCoinsAwarded: result.reward,
    });
  } catch (err) {
    console.error("❌ Simulation error:", err);
    return res.status(500).json({ error: err.message });
  }
});