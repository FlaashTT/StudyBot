const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('faq_remove')
    .setDescription('Remove a FAQ entry by ID')
    .addIntegerOption(option =>
      option.setName('id')
        .setDescription('ID of the FAQ to remove')
        .setRequired(true)),

  async execute(interaction) {
    const id = interaction.options.getInteger('id');

    try {
      const result = await db.run('DELETE FROM faqs WHERE id = ?', [id]);
      if (result.changes === 0) {
        return interaction.reply(`❌ No FAQ found with ID ${id}.`);
      }
      await interaction.reply(`✅ FAQ with ID ${id} removed.`);
    } catch (error) {
      console.error(error);
      await interaction.reply('❌ Failed to remove FAQ.');
    }
  },

  // Prefix command handler
  async prefix(message, args) {
    const id = parseInt(args[0], 10);
    if (isNaN(id)) {
      return message.reply('❌ Use: !faq_remove <id>');
    }
    try {
      const result = await db.run('DELETE FROM faqs WHERE id = ?', [id]);
      if (result.changes === 0) {
        return message.reply(`❌ No FAQ found with ID ${id}.`);
      }
      await message.reply(`✅ FAQ with ID ${id} removed.`);
    } catch (error) {
      console.error(error);
      await message.reply('❌ Failed to remove FAQ.');
    }
  }
};
