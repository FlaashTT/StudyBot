const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("List all available commands"),

  async execute(interaction) {
    const commands = interaction.client.commands;

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📋 ALL COMMANDS AVAILABLE 📋')
      .setDescription('The bot accepts slash and prefix commands. \n Example: `!help`.');

    const categories = {};

    for (const [name, command] of commands) {
      const category = command.category || "Others";
      if (!categories[category]) categories[category] = [];
      const desc = command.data?.description || command.description || '';
      categories[category].push(`\`/${name}\` — ${desc}`);
    }

    for (const [category, cmds] of Object.entries(categories)) {
      embed.addFields({
        name: `📌 ${category}`,
        value: cmds.join('\n'),
        inline: true,
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },

  // Prefix command handler
  async prefix(message) {
    const commands = message.client.commands;

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📋 ALL COMMANDS AVAILABLE 📋')
      .setDescription('The bot accepts slash and prefix commands. \n Example: `!help`.');

    const categories = {};

    for (const [name, command] of commands) {
      const category = command.category || "Others";
      if (!categories[category]) categories[category] = [];
      const desc = command.data?.description || command.description || '';
      categories[category].push(`\`/${name}\` — ${desc}`);
    }

    for (const [category, cmds] of Object.entries(categories)) {
      embed.addFields({
        name: `📌 ${category}`,
        value: cmds.join('\n'),
        inline: true,
      });
    }

    await message.reply({ embeds: [embed] });
  }
};