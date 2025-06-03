const db = require('../database/db');

module.exports = {
  name: 'messageCreate',
  execute(message) {
    if (message.author.bot) return;

    const userId = message.author.id;

    db.get(`SELECT * FROM users WHERE user_id = ?`, [userId], (err, row) => {
      if (!row) {
        db.run(`INSERT INTO users (user_id, xp, level) VALUES (?, ?, ?)`, [userId, 10, 1]);
      } else {
        const newXP = row.xp + 10;
        let levelUp = false;
        let newLevel = row.level;

        if (newXP >= row.level * 100) {
          newLevel++;
          levelUp = true;
        }

        db.run(`UPDATE users SET xp = ?, level = ? WHERE user_id = ?`,
          [newXP, newLevel, userId]);

        if (levelUp) {
          message.channel.send(`🎉 ${message.author} has reached level ${newLevel}!`);
        }
      }
    });
  }
};
