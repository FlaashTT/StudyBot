const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resource_add')
    .setDescription('Add a study resource')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title of the resource')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of resource (link, video, pdf, resumo)')
        .setRequired(true)
        .addChoices(
          { name: 'Link', value: 'link' },
          { name: 'Video', value: 'video' },
          { name: 'PDF', value: 'pdf' },
          { name: 'Resumo', value: 'resumo' }
        ))
    .addStringOption(option =>
      option.setName('url')
        .setDescription('URL or location of the resource')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Optional description of the resource')
        .setRequired(false)),
  
  async execute(interaction) {
    const userId = interaction.user.id;
    const title = interaction.options.getString('title');
    const type = interaction.options.getString('type');
    const url = interaction.options.getString('url');
    const description = interaction.options.getString('description') || '';

    db.run(
      'INSERT INTO resources (user_id, title, type, url, description) VALUES (?, ?, ?, ?, ?)',
      [userId, title, type, url, description],
      function(err) {
        if (err) {
          console.error(err);
          return interaction.reply({ content: '❌ Failed to add the resource.', ephemeral: true });
        }
        interaction.reply({ content: `✅ Resource added with ID: ${this.lastID}`, ephemeral: true });
      }
    );
  },

  // Prefix command handler
  async prefix(message, args) {
    const userId = message.author.id;
    const [title, type, url, ...descArr] = args;
    const description = descArr.join(' ') || '';

    if (!title || !type || !url) {
      return message.reply('❌ Use: !resource_add <title> <type> <url> [description]');
    }

    // Validação simples do tipo
    const validTypes = ['link', 'video', 'pdf', 'resumo'];
    if (!validTypes.includes(type)) {
      return message.reply('❌ O tipo deve ser: link, video, pdf ou resumo.');
    }

    db.run(
      'INSERT INTO resources (user_id, title, type, url, description) VALUES (?, ?, ?, ?, ?)',
      [userId, title, type, url, description],
      function(err) {
        if (err) {
          console.error(err);
          return message.reply('❌ Failed to add the resource.');
        }
        message.reply(`✅ Resource added with ID: ${this.lastID}`);
      }
    );
  }
};
