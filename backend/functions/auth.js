require("dotenv").config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register API
exports.register = functions.https.onRequest(async (req, res) => {
  try {
    const { email, password, displayName, phoneNumber } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: "Email, password, and displayName required" });
    }

    // Check if user exists
    const existingUsers = await db.collection("users").where("email", "==", email).get();
    if (!existingUsers.empty) {
      return res.status(400).json({ error: "User already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    const userRef = db.collection("users").doc();
    await userRef.set({
      email,
      password: hashed,
      displayName,
      phoneNumber: phoneNumber || null,
      role: "citizen",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({ userId: userRef.id, email, displayName });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Login API
exports.login = functions.https.onRequest(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email & password required" });
    }

    const usersSnap = await db.collection("users").where("email", "==", email).get();
    if (usersSnap.empty) return res.status(404).json({ error: "User not found" });

    const userDoc = usersSnap.docs[0];
    const valid = await bcrypt.compare(password, userDoc.data().password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { uid: userDoc.id, email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token, userId: userDoc.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
