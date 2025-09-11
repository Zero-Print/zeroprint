const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// ---- Helper: Add HealCoins when user wins a game ----
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

// ---- API: Quiz Submit ----
exports.submitQuiz = functions.https.onRequest(async (req, res) => {
  try {
    const { userId, answers } = req.body;

    if (!userId || !answers) {
      return res.status(400).json({ error: "userId and answers are required" });
    }

    // Example quiz answer key
    const correctAnswers = ["A", "C", "B", "D", "A"];
    let score = 0;

    answers.forEach((ans, i) => {
      if (ans === correctAnswers[i]) score++;
    });

    // Store score in Firestore
    const gameRef = db.collection("gameScores").doc();
    await gameRef.set({
      userId,
      gameType: "quiz",
      score,
      total: correctAnswers.length,
      createdAt: new Date(),
    });

    // Award coins if score >= 3
    if (score >= 3) {
      await awardHealCoins(userId, 20, "Quiz Reward");
    }

    return res.json({ message: "Quiz submitted", score });
  } catch (err) {
    console.error("❌ Quiz submit error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ---- API: Waste Sorting Submit ----
exports.submitWaste = functions.https.onRequest(async (req, res) => {
  try {
    const { userId, selectedBin, correctBin } = req.body;

    if (!userId || !selectedBin || !correctBin) {
      return res.status(400).json({ error: "userId, selectedBin, and correctBin are required" });
    }

    const isCorrect = selectedBin === correctBin;

    // Save result in Firestore
    const gameRef = db.collection("gameScores").doc();
    await gameRef.set({
      userId,
      gameType: "waste",
      correct: isCorrect,
      selectedBin,
      correctBin,
      createdAt: new Date(),
    });

    // Award coins if correct
    if (isCorrect) {
      await awardHealCoins(userId, 10, "Waste Sorting Reward");
    }

    return res.json({ message: "Waste sorting submitted", correct: isCorrect });
  } catch (err) {
    console.error("❌ Waste submit error:", err);
    return res.status(500).json({ error: err.message });
  }
});
