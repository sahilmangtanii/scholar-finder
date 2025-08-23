const admin = require("firebase-admin");
const User = require("../models/user"); // Your Mongoose user model
const serviceAccount = require("../config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// Middleware to verify token and attach UID
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUid = decoded.uid;
    next();
  } catch (err) {
    console.error("Token verification failed", err);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = verifyFirebaseToken;