const checkReminders = require('../utils/reminderChecker');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Bot ready as ${client.user.tag}`);
    setInterval(() => checkReminders(client), 60_000);
  }
};
