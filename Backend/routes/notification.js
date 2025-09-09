const express = require('express');
const router = express.Router();
const Scholarship = require('../models/Scholarship');
const User = require('../models/user');
const Notification = require('../models/Notification'); // Adjust the path as necessary
const verifyFirebaseToken = require("../middleware/auth");
async function getMatchedUsersForScholarship(scholarship) {
  const e = scholarship.eligibility || {};
  const query = [];

  if (e.gender) {
    query.push({ $or: [ { gender: e.gender }, { gender: null }, { gender: { $exists: false } } ] });
  }
  if (e.state) {
    query.push({ $or: [ { state: e.state }, { state: null }, { state: { $exists: false } } ] });
  }
  if (e.incomeStatus) {
    query.push({ $or: [ { incomeStatus: e.incomeStatus }, { incomeStatus: null }, { incomeStatus: { $exists: false } } ] });
  }
  if (e.category) {
    query.push({ $or: [ { category: e.category }, { category: null }, { category: { $exists: false } } ] });
  }
  if (e.yearOfStudy) {
    query.push({ $or: [ { yearOfStudy: e.yearOfStudy }, { yearOfStudy: null }, { yearOfStudy: { $exists: false } } ] });
  }
  if (e.educationLevel) {
    query.push({ $or: [ { educationLevel: e.educationLevel }, { educationLevel: null }, { educationLevel: { $exists: false } } ] });
  }
  if (e.recentDegree) {
    query.push({ $or: [ { recentDegree: e.recentDegree }, { recentDegree: null }, { recentDegree: { $exists: false } } ] });
  }
  if (e.gpa != null) {
    query.push({
      $or: [
        { gpa: { $gte: e.gpa } },
        { gpa: null },
        { gpa: { $exists: false } }
      ]
    });
  }

  console.log('User matching query:', JSON.stringify(query, null, 2)); // 🔍 Debug
  return await User.find({ $and: query });
}
router.get('/send-deadline-reminders', async (req, res) => {
  try {
    console.log("⏰ Reminder job running (IST)");

    const now = new Date();

    // Convert "now" to IST
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + IST_OFFSET);

    // Start of today in IST
    const startIST = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
    // End = +3 days (in IST)
    const endIST = new Date(startIST);
    endIST.setDate(endIST.getDate() + 3);

    console.log("🔍 Checking deadlines between:", startIST, "and", endIST);

    const upcoming = await Scholarship.find({
      deadline: { $gte: startIST, $lte: endIST }
    });

    console.log('📌 Found scholarships:', upcoming.length);

    for (const scholarship of upcoming) {
      const users = await getMatchedUsersForScholarship(scholarship);

      for (const user of users) {
        const alreadyNotified = await Notification.exists({
          firebaseUid: user.firebaseUid,
          scholarshipId: scholarship._id
        });

        if (alreadyNotified) continue;

        await Notification.create({
          firebaseUid: user.firebaseUid,
          scholarshipId: scholarship._id,
          message: `Reminder: The scholarship "${scholarship.title}" is due on ${scholarship.deadline.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}.`,
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        });
      }
    }

    res.status(200).json({ message: 'Reminders sent successfully (IST)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending reminders' });
  }
});



router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid; // decoded from token by middleware
    const notifications = await Notification.find({ firebaseUid }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// utils/cleanupNotifications.js



// PATCH /api/notifications/mark-all-read
router.patch('/mark-all-read', verifyFirebaseToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { firebaseUid: req.firebaseUid, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Failed to mark all notifications as read", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;