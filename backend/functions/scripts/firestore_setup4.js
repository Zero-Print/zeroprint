const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function setupFirestoreWeek4() {
  try {
    const demoUserId = "demoUser123";

    // ---- MSME Profile ----
    await db.collection("msmeProfiles").doc(demoUserId).set({
      userId: demoUserId,
      name: "Demo Manufacturing Unit",
      sector: "Textiles",
      location: "Indore, India",
      createdAt: new Date(),
    });

    // ---- Energy Logs ----
    await db.collection("msmeEnergyLogs").doc("energy1").set({
      userId: demoUserId,
      month: "2025-08",
      energyUsed: 1200, // kWh
      createdAt: new Date(),
    });

    await db.collection("msmeEnergyLogs").doc("energy2").set({
      userId: demoUserId,
      month: "2025-09",
      energyUsed: 1350,
      createdAt: new Date(),
    });

    // ---- Waste Logs ----
    await db.collection("msmeWasteLogs").doc("waste1").set({
      userId: demoUserId,
      month: "2025-08",
      wasteGenerated: 450, // kg
      createdAt: new Date(),
    });

    await db.collection("msmeWasteLogs").doc("waste2").set({
      userId: demoUserId,
      month: "2025-09",
      wasteGenerated: 500,
      createdAt: new Date(),
    });

    console.log("✅ Week 4 Firestore setup complete!");
  } catch (err) {
    console.error("❌ Error setting up Firestore (Week 4):", err);
  }
}

// Run setup
setupFirestoreWeek4();
