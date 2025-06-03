const db = require('../database/db');
const { EmbedBuilder } = require('discord.js');

async function checkReminders(client) {
  const now = Date.now();

  db.all(`SELECT * FROM reminders WHERE remind_at <= ?`, [now], (err, rows) => {
    if (err) return;

    rows.forEach(row => {
      const user = client.users.cache.get(row.user_id);
      if (user) {
        user.send({ content: `🔔 Reminder: ${row.message}` }).catch(() => {});
      }

      db.run(`DELETE FROM reminders WHERE id = ?`, [row.id]);
    });
  });
}

module.exports = checkReminders;
