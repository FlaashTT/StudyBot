const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('note_add')
    .setDescription('Add a new note')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title of your note')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('content')
        .setDescription('Content of your note')
        .setRequired(true)),

  async execute(interaction) {
    const userId = interaction.user.id;
    const title = interaction.options.getString('title');
    const content = interaction.options.getString('content');

    db.run('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)', [userId, title, content], function(err) {
      if (err) {
        console.error(err);
        return interaction.reply({ content: '❌ Failed to add the note.', ephemeral: true });
      }
      interaction.reply({ content: `✅ Note added with ID: ${this.lastID}`, ephemeral: true });
    });
  },

  // Prefix command handler
  async prefix(message, args) {
    const userId = message.author.id;
    const title = args[0];
    const content = args.slice(1).join(' ');
    if (!title || !content) {
      return message.reply('❌ Use: !note_add <title> <content>');
    }

    db.run('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)', [userId, title, content], function(err) {
      if (err) {
        console.error(err);
        return message.reply('❌ Failed to add the note.');
      }
      message.reply(`✅ Note added with ID: ${this.lastID}`);
    });
  }
};
