const express = require('express');
const router = express.Router();
const user = require('../models/user');
const verifyFirebaseToken = require("../middleware/auth");

router.post('/profile', async(req,res) =>{
  try{
    if (req.body.yearOfStudy === '') {
      delete req.body.yearOfStudy;
    }
    const User = new user(req.body);
    
    await User.save();
    res.status(201).json({message : "user added"});
  }
  catch(err){
    console.log(err);
    res.status(400).json({message: err.message});
  }
})

router.get("/profile", verifyFirebaseToken, async (req, res) => {
  try {
    const User = await user.findOne({ firebaseUid: req.firebaseUid }).lean();
    if (!User) return res.status(404).json({ error: "User not found" });

    res.json({
        //console.log("User data:", User), // Log the user data for debugging
      User
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



// PUT route to update profile
router.put('/profile', verifyFirebaseToken, async (req, res) => {
  const firebaseUid = req.firebaseUid;
  const updatedData = req.body;

  try {
    const User = await user.findOneAndUpdate(
      { firebaseUid: firebaseUid },
      updatedData,
      { new: true }
    );

    if (!User) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated successfully", User });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Server error while updating profile" });
  }
});

router.post("/checkUserProfile", async (req, res) => {
  try {
    const { email } = req.body;
    const User = await user.findOne({ email }).lean();
   if (!User) return res.status(200).json({ exists: false });

    res.json({ exists: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
