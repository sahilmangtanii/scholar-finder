// utils/cleanupNotifications.js
const cron = require('node-cron');
const Notification = require('../models/Notification');

// Run every day at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  try {
    const result = await Notification.deleteMany({
      read: true,
      createdAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } // older than 5 days
    });

    console.log(`🧹 Deleted ${result.deletedCount} old read notifications.`);
  } catch (err) {
    console.error('❌ Error deleting old notifications:', err);
  }
});
