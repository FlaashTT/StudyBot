const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('note_delete')
    .setDescription('Delete a note by its ID')
    .addIntegerOption(option =>
      option.setName('id')
        .setDescription('ID of the note to delete')
        .setRequired(true)),
  async execute(interaction) {
    const userId = interaction.user.id;
    const id = interaction.options.getInteger('id');

    db.run('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId], function(err) {
      if (err) {
        console.error(err);
        return interaction.reply({ content: '❌ Failed to delete the note.', ephemeral: true });
      }
      if (this.changes === 0) {
        return interaction.reply({ content: 'No note found with that ID.', ephemeral: true });
      }

      interaction.reply({ content: '✅ Note deleted successfully.', ephemeral: true });
    });
  },

  // Prefix command handler
  async prefix(message, args) {
    const userId = message.author.id;
    const id = parseInt(args[0], 10);
    if (isNaN(id)) {
      return message.reply('❌ Use: !note_delete <id>');
    }

    db.run('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId], function(err) {
      if (err) {
        console.error(err);
        return message.reply('❌ Failed to delete the note.');
      }
      if (this.changes === 0) {
        return message.reply('No note found with that ID.');
      }
      message.reply('✅ Note deleted successfully.');
    });
  }
};
