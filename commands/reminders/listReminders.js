const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listreminders')
    .setDescription('List your active reminders'),

  async execute(interaction) {
    db.all(`SELECT * FROM reminders WHERE user_id = ?`, [interaction.user.id], (err, rows) => {
      if (!rows || !rows.length) return interaction.reply('📭 You have no reminders.');

      const list = rows.map(r => `🕒 ID: ${r.id} | In: ${Math.ceil((r.remind_at - Date.now()) / 60000)} min | ${r.message}`).join('\n');
      interaction.reply(`📋 **Your Reminders:**\n${list}`);
    });
  },

  // Prefix command handler
  async prefix(message) {
    db.all(`SELECT * FROM reminders WHERE user_id = ?`, [message.author.id], (err, rows) => {
      if (!rows || !rows.length) return message.reply('📭 You have no reminders.');

      const list = rows.map(r => `🕒 ID: ${r.id} | In: ${Math.ceil((r.remind_at - Date.now()) / 60000)} min | ${r.message}`).join('\n');
      message.reply(`📋 **Your Reminders:**\n${list}`);
    });
  }
};
