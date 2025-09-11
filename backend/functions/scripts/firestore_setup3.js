const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function setupFirestoreWeek3() {
  try {
    const demoUserId = "demoUser123";

    // ---- Simulation Data ----
    await db
      .collection("simulationData")
      .doc("sim1")
      .set({
        userId: demoUserId,
        inputs: {
          energyUsage: 120, // kWh
          wasteGenerated: 3, // kg
        },
        outputs: {
          co2Saved: 12, // kg
          waterSaved: 25, // liters
        },
        createdAt: new Date(),
        createdBy: "system",
      });

    await db
      .collection("simulationData")
      .doc("sim2")
      .set({
        userId: demoUserId,
        inputs: {
          energyUsage: 80,
          wasteGenerated: 1.5,
        },
        outputs: {
          co2Saved: 8,
          waterSaved: 15,
        },
        createdAt: new Date(),
        createdBy: "system",
      });

    await db.collection("gameScores").doc("game1").set({
      userId: demoUserId,
      gameType: "quiz",
      score: 80,
      createdAt: new Date(),
    });

    console.log("✅ Week 3 Firestore setup complete!");
  } catch (err) {
    console.error("❌ Error setting up Firestore (Week 3):", err);
  }
}

setupFirestoreWeek3();
