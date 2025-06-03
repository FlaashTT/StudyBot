const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('note_view')
    .setDescription('View all your notes titles'),
  async execute(interaction) {
    const userId = interaction.user.id;

    db.all('SELECT id, title FROM notes WHERE user_id = ?', [userId], (err, rows) => {
      if (err) {
        console.error(err);
        return interaction.reply({ content: '❌ Failed to retrieve notes.', ephemeral: true });
      }

      if (rows.length === 0) {
        return interaction.reply({ content: 'You have no notes saved.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle(`${interaction.user.username}'s Notes`)
        .setColor(0x5865F2)
        .setDescription(rows.map(note => `**ID:** ${note.id} — **Title:** ${note.title}`).join('\n'));

      interaction.reply({ embeds: [embed], ephemeral: true });
    });
  },

  // Prefix command handler
  async prefix(message) {
    const userId = message.author.id;

    db.all('SELECT id, title FROM notes WHERE user_id = ?', [userId], (err, rows) => {
      if (err) {
        console.error(err);
        return message.reply('❌ Failed to retrieve notes.');
      }

      if (rows.length === 0) {
        return message.reply('You have no notes saved.');
      }

      const embed = new EmbedBuilder()
        .setTitle(`${message.author.username}'s Notes`)
        .setColor(0x5865F2)
        .setDescription(rows.map(note => `**ID:** ${note.id} — **Title:** ${note.title}`).join('\n'));

      message.reply({ embeds: [embed] });
    });
  }
};
