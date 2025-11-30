const cron = require('node-cron');
const axios = require('axios');

module.exports = function setupDeadlineReminderJob() {
  cron.schedule(
    '0 0 * * *',
    async () => {
      console.log('⏰ Cron running at midnight IST: sending reminders');
      try {
        await axios.get(`${process.env.BACKEND_URL}/api/notifications/send-deadline-reminders`);
        console.log('✅ API hit successfully');
      } catch (err) {
        console.error('❌ API error:', err.message);
      }
    },
    {
      timezone: "Asia/Kolkata"
    }
  );
};
