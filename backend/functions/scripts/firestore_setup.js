const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function setupFirestoreWeek1() {
  try {
    // ---- Users ----
    await db.collection("users").doc("demoUser123").set({
      displayName: "Demo User",
      email: "demo@example.com",
      role: "citizen",
      phoneNumber: "9999999999",  
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // ---- Wallets ----
    const walletRef = db.collection("wallets").doc("demoUser123");
    await walletRef.set({
      userId: "demoUser123",
      balance: 0,
      lifetimeEarned: 0,
      lifetimeRedeemed: 0,
      lastUpdated: new Date(),
    });

    // Initial transaction
    await walletRef.collection("transactions").doc("tx001").set({
      type: "earn",
      amount: 0,
      reason: "initial",
      createdAt: new Date(),
      createdBy: "system",
      status: "posted",
    });

    // ---- Events ----
    await db.collection("events").doc("welcomeEvent").set({
      title: "Welcome to ZeroPrint",
      description: "First event for new users",
      createdAt: new Date(),
    });

    // ---- Scores ----
    await db.collection("scores").doc("demoScore").set({
      userId: "demoUser123",
      score: 10,
      createdAt: new Date(),
    });

    // ---- Settings ----
    await db.collection("settings").doc("healcoinRates").set({
      conversionRate: 1,
      updatedAt: new Date(),
    });

    console.log("✅ Week 1 Firestore setup complete!");
  } catch (err) {
    console.error("❌ Error setting up Firestore:", err);
  }
}

// Run setup
setupFirestoreWeek1();
