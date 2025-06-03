const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resource_view')
    .setDescription('View your saved resources'),
  
  async execute(interaction) {
    const userId = interaction.user.id;

    db.all('SELECT id, title, type FROM resources WHERE user_id = ?', [userId], (err, rows) => {
      if (err) {
        console.error(err);
        return interaction.reply({ content: '❌ Failed to retrieve resources.', ephemeral: true });
      }

      if (rows.length === 0) {
        return interaction.reply({ content: 'You have no saved resources.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle(`${interaction.user.username}'s Resources`)
        .setColor(0x5865F2)
        .setDescription(rows.map(r => `**ID:** ${r.id} — **${r.type.toUpperCase()}** — **Title:** ${r.title}`).join('\n'));

      interaction.reply({ embeds: [embed], ephemeral: true });
    });
  },

  // Prefix command handler
  async prefix(message) {
    const userId = message.author.id;

    db.all('SELECT id, title, type FROM resources WHERE user_id = ?', [userId], (err, rows) => {
      if (err) {
        console.error(err);
        return message.reply('❌ Failed to retrieve resources.');
      }

      if (rows.length === 0) {
        return message.reply('You have no saved resources.');
      }

      const embed = new EmbedBuilder()
        .setTitle(`${message.author.username}'s Resources`)
        .setColor(0x5865F2)
        .setDescription(rows.map(r => `**ID:** ${r.id} — **${r.type.toUpperCase()}** — **Title:** ${r.title}`).join('\n'));

      message.reply({ embeds: [embed] });
    });
  }
};
