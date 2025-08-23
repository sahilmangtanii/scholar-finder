// models/Notification.js
const mongoose = require('mongoose');



const notificationSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true },
  scholarshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' }, // To track which scholarship it's about
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) } // auto-expire in 3 days
});

// Optional: TTL index for auto-deletion after `expiresAt`
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
