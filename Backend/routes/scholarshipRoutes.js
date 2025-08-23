// routes/scholarshipRoutes.js
const express = require('express');
const router = express.Router();
const Scholarship = require('../models/Scholarship');
const User = require('../models/user');
// router.post('/test', (req, res) => {
//   console.log("✅ Test route hit");
//   console.log("Data:", req.body);
//   res.send("Got it");
// });

router.post('/add', async (req, res) => {
  console.log("POST /add hit");
  console.log("BODY:", req.body);

  try {
    const {
      title,
      deadline,
      award,
      link, // ✅ If you added this in schema
      eligibility
    } = req.body;

    const scholarship = new Scholarship({
      title,
      deadline: deadline ? new Date(deadline) : null,
      award,
      link,
      eligibility: {
        text: eligibility?.text || "Not provided",
        educationLevel: eligibility?.educationLevel || null,
        yearOfStudy: eligibility?.yearOfStudy || null,
        gpa: eligibility?.gpa || null,
        recentDegree: eligibility?.recentDegree || null,
        state: eligibility?.state || null,
        incomeStatus: eligibility?.incomeStatus || null,
        category: eligibility?.category || null,
        gender: eligibility?.gender || null,
      }
    });

    await scholarship.save();
    res.status(201).json({ message: "Scholarship added!" });
  } catch (err) {
    console.error("Error saving scholarship:", err);
    res.status(400).json({ message: err.message });
  }
});

// GET /api/scholarships/title/:title
router.get('/title/:title', async (req, res) => {
  try {
    const title = decodeURIComponent(req.params.title);
    const scholarship = await Scholarship.findOne({ title });

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    res.status(200).json(scholarship);
  } catch (err) {
    console.error('Error fetching scholarship by title:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/scholarships/update-deadline
router.post('/update-deadline', async (req, res) => {
  const { title, deadline } = req.body;

  try {
    const updated = await Scholarship.findOneAndUpdate(
      { title },
      { $set: { deadline } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    res.status(200).json({ message: 'Deadline updated', scholarship: updated });
  } catch (err) {
    console.error('Error updating deadline:', err);
    res.status(500).json({ message: 'Failed to update deadline' });
  }
});

router.get('/match/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Convert current UTC time to IST by adding 5 hours 30 minutes
    const now = new Date();
const istStartOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const utcStart = new Date(istStartOfToday.getTime() - (330 * 60 * 1000)); 

    const matchedScholarships = await Scholarship.find({
      $and: [
        { deadline: { $gte: utcStart } },
        { $or: [{ 'eligibility.gpa': null }, { 'eligibility.gpa': { $lte: user.gpa } }] },
        { $or: [{ 'eligibility.gender': null }, { 'eligibility.gender': user.gender }] },
        { $or: [{ 'eligibility.state': null }, { 'eligibility.state': user.state }] },
        { $or: [{ 'eligibility.incomeStatus': null }, { 'eligibility.incomeStatus': user.incomeStatus }] },
        { $or: [{ 'eligibility.category': null }, { 'eligibility.category': user.category }] },
        { $or: [{ 'eligibility.yearOfStudy': null }, { 'eligibility.yearOfStudy': user.yearOfStudy }] },
        { $or: [{ 'eligibility.educationLevel': null }, { 'eligibility.educationLevel': user.educationLevel }] },
        { $or: [{ 'eligibility.recentDegree': null }, { 'eligibility.recentDegree': user.recentDegree }] }
      ]
    }).sort({ deadline: 1 });

    res.status(200).json(matchedScholarships);
  } catch (err) {
    console.error("Error in /match route:", err);
    res.status(500).json({ message: 'Error matching scholarships' });
  }
});



module.exports = router;