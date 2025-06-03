const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resource_read')
    .setDescription('Show details of a resource by its ID')
    .addIntegerOption(option =>
      option.setName('id')
        .setDescription('ID of the resource to view')
        .setRequired(true)),
  
  async execute(interaction) {
    const userId = interaction.user.id;
    const id = interaction.options.getInteger('id');

    db.get('SELECT * FROM resources WHERE id = ? AND user_id = ?', [id, userId], (err, row) => {
      if (err) {
        console.error(err);
        return interaction.reply({ content: '❌ Failed to get the resource.', ephemeral: true });
      }
      if (!row) {
        return interaction.reply({ content: 'No resource found with that ID.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle(row.title)
        .addFields(
          { name: 'Type', value: row.type, inline: true },
          { name: 'URL', value: row.url, inline: false }
        )
        .setDescription(row.description || 'No description provided')
        .setFooter({ text: `Added on: ${new Date(row.created_at).toLocaleString()}` })
        .setColor(0x5865F2);

      interaction.reply({ embeds: [embed], ephemeral: true });
    });
  },

  // Prefix command handler
  async prefix(message, args) {
    const userId = message.author.id;
    const id = parseInt(args[0], 10);
    if (isNaN(id)) {
      return message.reply('❌ Use: !resource_read <id>');
    }

    db.get('SELECT * FROM resources WHERE id = ? AND user_id = ?', [id, userId], (err, row) => {
      if (err) {
        console.error(err);
        return message.reply('❌ Failed to get the resource.');
      }
      if (!row) {
        return message.reply('No resource found with that ID.');
      }

      const embed = new EmbedBuilder()
        .setTitle(row.title)
        .addFields(
          { name: 'Type', value: row.type, inline: true },
          { name: 'URL', value: row.url, inline: false }
        )
        .setDescription(row.description || 'No description provided')
        .setFooter({ text: `Added on: ${new Date(row.created_at).toLocaleString()}` })
        .setColor(0x5865F2);

      message.reply({ embeds: [embed] });
    });
  }
};
