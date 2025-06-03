const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listtasks')
    .setDescription('List your study tasks'),

  async execute(interaction) {
    db.all(`SELECT * FROM tasks WHERE user_id = ?`, [interaction.user.id], (err, rows) => {
      if (err || !rows.length) {
        return interaction.reply('No tasks found.');
      }

      const list = rows.map(row => `${row.completed ? '✅' : '🕒'} ${row.description}`).join('\n');
      interaction.reply(`📝 **Your Tasks**:\n${list}`);
    });
  },

  // Prefix command handler
  async prefix(message) {
    db.all(`SELECT * FROM tasks WHERE user_id = ?`, [message.author.id], (err, rows) => {
      if (err || !rows.length) {
        return message.reply('No tasks found.');
      }

      const list = rows.map(row => `${row.completed ? '✅' : '🕒'} ${row.description}`).join('\n');
      message.reply(`📝 **Your Tasks**:\n${list}`);
    });
  }
};
