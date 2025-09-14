const functions = require("firebase-functions");
const admin = require("firebase-admin");
const PDFDocument = require("pdfkit"); // Node-friendly PDF generation

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require("./serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

/**
 * GET /api/msme/report/generate-pdf
 * Query: userId
 * Generates ESG-lite PDF for given MSME user
 */
exports.generateMSMEReportPDF = functions.https.onRequest(async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "userId query param required" });

    // Fetch MSME profile
    const profileSnap = await db.collection("msmeProfiles").doc(userId).get();
    if (!profileSnap.exists) return res.status(404).json({ error: "MSME profile not found" });
    const profile = profileSnap.data();

    // Fetch energy logs
    const energyLogsSnap = await db.collection("msmeEnergyLogs").where("userId", "==", userId).get();
    const energyLogs = energyLogsSnap.docs.map(d => d.data());

    // Fetch waste logs
    const wasteLogsSnap = await db.collection("msmeWasteLogs").where("userId", "==", userId).get();
    const wasteLogs = wasteLogsSnap.docs.map(d => d.data());

    // Create PDF
    const doc = new PDFDocument({ margin: 40 });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfData);
    });

    // PDF Header
    doc.fontSize(20).text("ESG-lite Report", { align: "center" });
    doc.moveDown();

    // Company Info
    doc.fontSize(12).text(`Company: ${profile.name}`);
    doc.text(`Sector: ${profile.sector}`);
    doc.text(`Location: ${profile.location}`);
    doc.moveDown();

    // Energy Table
    if (energyLogs.length > 0) {
      doc.fontSize(14).text("Energy Usage:", { underline: true });
      energyLogs.forEach(log => {
        doc.fontSize(12).text(`${log.month}: ${log.energyUsed} kWh`);
      });
      doc.moveDown();
    }

    // Waste Table
    if (wasteLogs.length > 0) {
      doc.fontSize(14).text("Waste Generation:", { underline: true });
      wasteLogs.forEach(log => {
        doc.fontSize(12).text(`${log.month}: ${log.wasteGenerated} kg`);
      });
      doc.moveDown();
    }

    doc.end();

  } catch (err) {
    console.error("❌ Error generating MSME PDF:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/dashboard/data
 * Provides summary data for dashboard
 */
exports.getAdminDashboardData = functions.https.onRequest(async (req, res) => {
  try {
    // Total MSMEs
    const profilesSnap = await db.collection("msmeProfiles").get();
    const totalMSMEs = profilesSnap.size;

    // Energy average
    const energySnap = await db.collection("msmeEnergyLogs").get();
    const energyData = energySnap.docs.map(d => d.data().energyUsed);
    const avgEnergy = energyData.length > 0
      ? energyData.reduce((a, b) => a + b, 0) / energyData.length
      : 0;

    // Waste average
    const wasteSnap = await db.collection("msmeWasteLogs").get();
    const wasteData = wasteSnap.docs.map(d => d.data().wasteGenerated);
    const avgWaste = wasteData.length > 0
      ? wasteData.reduce((a, b) => a + b, 0) / wasteData.length
      : 0;

    return res.json({ totalMSMEs, avgEnergy, avgWaste });
  } catch (err) {
    console.error("❌ Error fetching dashboard data:", err);
    return res.status(500).json({ error: err.message });
  }
});