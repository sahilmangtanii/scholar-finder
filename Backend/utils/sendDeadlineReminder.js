module.exports = function setupDeadlineReminderJob() {
  const cron = require('node-cron');
  const axios = require('axios');

  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Cron running: sending reminders');
    try {
      await axios.get('http://localhost:5050/api/notifications/send-deadline-reminders');
      console.log('✅ API hit successfully');
    } catch (err) {
      console.error('❌ API error:', err.message);
    }
  });
};