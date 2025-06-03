const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resource_delete')
    .setDescription('Delete a resource by its ID')
    .addIntegerOption(option =>
      option.setName('id')
        .setDescription('ID of the resource to delete')
        .setRequired(true)),
  
  async execute(interaction) {
    const userId = interaction.user.id;
    const id = interaction.options.getInteger('id');

    db.run('DELETE FROM resources WHERE id = ? AND user_id = ?', [id, userId], function(err) {
      if (err) {
        console.error(err);
        return interaction.reply({ content: '❌ Failed to delete the resource.', ephemeral: true });
      }
      if (this.changes === 0) {
        return interaction.reply({ content: 'No resource found with that ID.', ephemeral: true });
      }
      interaction.reply({ content: '✅ Resource deleted successfully.', ephemeral: true });
    });
  },

  // Prefix command handler
  async prefix(message, args) {
    const userId = message.author.id;
    const id = parseInt(args[0], 10);
    if (isNaN(id)) {
      return message.reply('❌ Use: !resource_delete <id>');
    }

    db.run('DELETE FROM resources WHERE id = ? AND user_id = ?', [id, userId], function(err) {
      if (err) {
        console.error(err);
        return message.reply('❌ Failed to delete the resource.');
      }
      if (this.changes === 0) {
        return message.reply('No resource found with that ID.');
      }
      message.reply('✅ Resource deleted successfully.');
    });
  }
};
