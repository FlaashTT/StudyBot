const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('faq_add')
    .setDescription('Add a new FAQ entry')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Question')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('answer')
        .setDescription('Answer')
        .setRequired(true)),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const answer = interaction.options.getString('answer');

    try {
      await db.run('INSERT INTO faqs (question, answer) VALUES (?, ?)', [question, answer]);
      await interaction.reply(`✅ FAQ added:\n**Q:** ${question}\n**A:** ${answer}`);
    } catch (error) {
      console.error(error);
      await interaction.reply('❌ Failed to add FAQ.');
    }
  },

  // Prefix command handler
  async prefix(message, args) {
    const question = args[0];
    const answer = args.slice(1).join(' ');
    if (!question || !answer) {
      return message.reply('❌ Use: !faq_add <question> <answer>');
    }
    try {
      await db.run('INSERT INTO faqs (question, answer) VALUES (?, ?)', [question, answer]);
      await message.reply(`✅ FAQ added:\n**Q:** ${question}\n**A:** ${answer}`);
    } catch (error) {
      console.error(error);
      await message.reply('❌ Failed to add FAQ.');
    }
  }
};
