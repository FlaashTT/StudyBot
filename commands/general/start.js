const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Set up a study category and channels'),

  async execute(interaction) {
    const guild = interaction.guild;
    const category = await guild.channels.create({
      name: 'Study Zone',
      type: 4 // Categoria
    });

    await guild.channels.create({ name: '📚│general-study', type: 0, parent: category.id });
    await guild.channels.create({ name: '📝│tasks', type: 0, parent: category.id });
    await guild.channels.create({ name: '⏰│reminders', type: 0, parent: category.id });

    await interaction.reply('✅ Study category and channels created!');
  },

  // Prefix command handler
  async prefix(message) {
    const guild = message.guild;
    if (!guild) return message.reply('❌ This command can only be used on a server.');

    const category = await guild.channels.create({
      name: 'Study Zone',
      type: 4 // Categoria
    });

    await guild.channels.create({ name: '📚│general-study', type: 0, parent: category.id });
    await guild.channels.create({ name: '📝│tasks', type: 0, parent: category.id });
    await guild.channels.create({ name: '⏰│reminders', type: 0, parent: category.id });

    await message.reply('✅ Study category and channels created!');
  }
};
