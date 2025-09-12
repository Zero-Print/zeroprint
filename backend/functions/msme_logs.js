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
 * POST /api/msme/profile/create
 * Body: { userId, name, sector, location }
 */
exports.createMSMEProfile = functions.https.onRequest(async (req, res) => {
  try {
    const { userId, name, sector, location } = req.body;

    if (!userId || !name || !sector || !location) {
      return res.status(400).json({ error: "userId, name, sector, and location are required" });
    }

    const profileRef = db.collection("msmeProfiles").doc(userId);
    await profileRef.set({
      userId,
      name,
      sector,
      location,
      createdAt: new Date(),
    });

    return res.json({ success: true, message: "MSME profile created" });
  } catch (err) {
    console.error("❌ Error creating MSME profile:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/msme/log/energy
 * Body: { userId, month, energyUsed }
 */
exports.logEnergy = functions.https.onRequest(async (req, res) => {
  try {
    const { userId, month, energyUsed } = req.body;

    if (!userId || !month || !energyUsed) {
      return res.status(400).json({ error: "userId, month, and energyUsed required" });
    }

    const logRef = db.collection("msmeEnergyLogs").doc();
    await logRef.set({
      userId,
      month,
      energyUsed, // kWh
      createdAt: new Date(),
    });

    return res.json({ success: true, message: "Energy log saved" });
  } catch (err) {
    console.error("❌ Error logging energy:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/msme/log/waste
 * Body: { userId, month, wasteGenerated }
 */
exports.logWaste = functions.https.onRequest(async (req, res) => {
  try {
    const { userId, month, wasteGenerated } = req.body;

    if (!userId || !month || !wasteGenerated) {
      return res.status(400).json({ error: "userId, month, and wasteGenerated required" });
    }

    const logRef = db.collection("msmeWasteLogs").doc();
    await logRef.set({
      userId,
      month,
      wasteGenerated, // kg
      createdAt: new Date(),
    });

    return res.json({ success: true, message: "Waste log saved" });
  } catch (err) {
    console.error("❌ Error logging waste:", err);
    return res.status(500).json({ error: err.message });
  }
});
