const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function setupFirestoreWeek2() {
  try {
    const demoUserId = "demoUser123";

    // ---- Mood Logs ----
    await db.collection("moodLogs").doc("mood1").set({
      userId: demoUserId,
      mood: "happy",
      note: "Feeling great today!",
      createdAt: new Date(),
    });

    // ---- Kindness Logs ----
    await db.collection("kindnessLogs").doc("kindness1").set({
      userId: demoUserId,
      action: "Helped a friend with homework",
      createdAt: new Date(),
    });

    // ---- Wallet Update for testing ----
    const walletRef = db.collection("wallets").doc(demoUserId);
    await walletRef.update({
      balance: 50,
      lifetimeEarned: 50,
      lastUpdated: new Date(),
    });

    // Add a new transaction for kindness reward
    await walletRef.collection("transactions").doc("tx002").set({
      type: "earn",
      amount: 50,
      reason: "kindness reward",
      createdAt: new Date(),
      createdBy: "system",
      status: "posted",
    });

    console.log("✅ Week 2 Firestore setup complete!");
  } catch (err) {
    console.error("❌ Error setting up Firestore (Week 2):", err);
  }
}

// Run setup
setupFirestoreWeek2();
