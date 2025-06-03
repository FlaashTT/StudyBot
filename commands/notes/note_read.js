const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('note_read')
    .setDescription('Read a note by its ID')
    .addIntegerOption(option =>
      option.setName('id')
        .setDescription('ID of the note to read')
        .setRequired(true)),
  async execute(interaction) {
    const userId = interaction.user.id;
    const id = interaction.options.getInteger('id');

    db.get('SELECT title, content, created_at FROM notes WHERE id = ? AND user_id = ?', [id, userId], (err, row) => {
      if (err) {
        console.error(err);
        return interaction.reply({ content: '❌ Failed to read the note.', ephemeral: true });
      }
      if (!row) {
        return interaction.reply({ content: 'No note found with that ID.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle(row.title)
        .setDescription(row.content)
        .setFooter({ text: `Created at: ${new Date(row.created_at).toLocaleString()}` })
        .setColor(0x5865F2);

      interaction.reply({ embeds: [embed], ephemeral: true });
    });
  },

  // Prefix command handler
  async prefix(message, args) {
    const userId = message.author.id;
    const id = parseInt(args[0], 10);
    if (isNaN(id)) {
      return message.reply('❌ Use: !note_read <id>');
    }

    db.get('SELECT title, content, created_at FROM notes WHERE id = ? AND user_id = ?', [id, userId], (err, row) => {
      if (err) {
        console.error(err);
        return message.reply('❌ Failed to read the note.');
      }
      if (!row) {
        return message.reply('No note found with that ID.');
      }

      const embed = new EmbedBuilder()
        .setTitle(row.title)
        .setDescription(row.content)
        .setFooter({ text: `Created at: ${new Date(row.created_at).toLocaleString()}` })
        .setColor(0x5865F2);

      message.reply({ embeds: [embed] });
    });
  }
};
