const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('faq_search')
    .setDescription('Search FAQs by keyword')
    .addStringOption(option =>
      option.setName('keyword')
        .setDescription('Keyword to search for')
        .setRequired(true)),

  async execute(interaction) {
    const keyword = interaction.options.getString('keyword');

    try {
      const rows = await db.all('SELECT id, question, answer FROM faqs WHERE question LIKE ? OR answer LIKE ?', [`%${keyword}%`, `%${keyword}%`]);
      if (rows.length === 0) {
        return interaction.reply('No FAQs matched your search.');
      }

      const results = rows.map(r => `**${r.id}.** Q: ${r.question}\nA: ${r.answer}`).join('\n\n');
      await interaction.reply(`🔍 FAQs matching "${keyword}":\n${results}`);
    } catch (error) {
      console.error(error);
      await interaction.reply('❌ Failed to search FAQs.');
    }
  },

  // Prefix command handler
  async prefix(message, args) {
    const keyword = args.join(' ');
    if (!keyword) {
      return message.reply('❌ Use: !faq_search <keyword>');
    }
    try {
      const rows = await db.all(
        'SELECT id, question, answer FROM faqs WHERE question LIKE ? OR answer LIKE ?',
        [`%${keyword}%`, `%${keyword}%`]
      );
      if (rows.length === 0) {
        return message.reply('No FAQs matched your search.');
      }

      const results = rows.map(r => `**${r.id}.** Q: ${r.question}\nA: ${r.answer}`).join('\n\n');
      await message.reply(`🔍 FAQs matching "${keyword}":\n${results}`);
    } catch (error) {
      console.error(error);
      await message.reply('❌ Failed to search FAQs.');
    }
  }
};
