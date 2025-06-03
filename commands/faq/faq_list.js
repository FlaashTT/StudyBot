const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('faq_list')
    .setDescription('List all FAQ entries'),

  async execute(interaction) {
    try {
      const rows = await db.all('SELECT id, question FROM faqs');
      if (rows.length === 0) {
        return interaction.reply('No FAQs found.');
      }

      const list = rows.map(r => `**${r.id}.** ${r.question}`).join('\n');
      await interaction.reply(`📚 FAQs:\n${list}`);
    } catch (error) {
      console.error(error);
      await interaction.reply('❌ Failed to fetch FAQs.');
    }
  },

  // Prefix command handler
  async prefix(message) {
    try {
      const rows = await db.all('SELECT id, question FROM faqs');
      if (rows.length === 0) {
        return message.reply('No FAQs found.');
      }

      const list = rows.map(r => `**${r.id}.** ${r.question}`).join('\n');
      await message.reply(`📚 FAQs:\n${list}`);
    } catch (error) {
      console.error(error);
      await message.reply('❌ Failed to fetch FAQs.');
    }
  }
};
