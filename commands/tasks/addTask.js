const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addtask')
    .setDescription('Add a study task')
    .addStringOption(opt =>
      opt.setName('task').setDescription('Task description').setRequired(true)),

  async execute(interaction) {
    const task = interaction.options.getString('task');
    db.run(`INSERT INTO tasks (user_id, description, completed) VALUES (?, ?, 0)`,
      [interaction.user.id, task]);

    await interaction.reply(`📌 Task added: "${task}"`);
  },

  // Prefix command handler
  async prefix(message, args) {
    const task = args.join(' ');
    if (!task) {
      return message.reply('❌ Use: !addtask <task-description>');
    }
    db.run(`INSERT INTO tasks (user_id, description, completed) VALUES (?, ?, 0)`,
      [message.author.id, task]);
    await message.reply(`📌 Task added: "${task}"`);
  }
};
