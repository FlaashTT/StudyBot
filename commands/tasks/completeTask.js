const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('donetask')
    .setDescription('Mark a task as done')
    .addIntegerOption(opt =>
      opt.setName('id').setDescription('ID of the task').setRequired(true)),

  async execute(interaction) {
    const id = interaction.options.getInteger('id');

    db.run(`UPDATE tasks SET completed = 1 WHERE id = ? AND user_id = ?`,
      [id, interaction.user.id],
      function (err) {
        if (err || this.changes === 0) {
          return interaction.reply('❌ Task not found or already completed.');
        }

        interaction.reply(`✅ Task ${id} marked as completed!`);
      }
    );
  },

  // Prefix command handler
  async prefix(message, args) {
    const id = parseInt(args[0], 10);
    if (isNaN(id)) {
      return message.reply('❌ Use: !donetask <id>');
    }

    db.run(`UPDATE tasks SET completed = 1 WHERE id = ? AND user_id = ?`,
      [id, message.author.id],
      function (err) {
        if (err || this.changes === 0) {
          return message.reply('❌ Task not found or already completed.');
        }
        message.reply(`✅ Task ${id} marked as completed!`);
      }
    );
  }
};
