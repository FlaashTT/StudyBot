const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cancelreminder')
    .setDescription('Cancel a reminder by ID')
    .addIntegerOption(opt =>
      opt.setName('id').setDescription('Reminder ID').setRequired(true)),

  async execute(interaction) {
    const id = interaction.options.getInteger('id');

    db.run(`DELETE FROM reminders WHERE id = ? AND user_id = ?`,
      [id, interaction.user.id],
      function (err) {
        if (err || this.changes === 0) {
          return interaction.reply('❌ Reminder not found.');
        }

        interaction.reply(`🗑️ Reminder ${id} cancelled.`);
      });
  },

  // Prefix command handler
  async prefix(message, args) {
    const id = parseInt(args[0], 10);
    if (isNaN(id)) {
      return message.reply('❌ Use: !cancelreminder <id>');
    }

    db.run(`DELETE FROM reminders WHERE id = ? AND user_id = ?`,
      [id, message.author.id],
      function (err) {
        if (err || this.changes === 0) {
          return message.reply('❌ Reminder not found.');
        }
        message.reply(`🗑️ Reminder ${id} cancelled.`);
      });
  }
};
