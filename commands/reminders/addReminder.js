const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addreminder')
    .setDescription('Add a reminder')
    .addStringOption(opt =>
      opt.setName('message').setDescription('Reminder message').setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('minutes').setDescription('In how many minutes?').setRequired(true)),

  async execute(interaction) {
    const message = interaction.options.getString('message');
    const minutes = interaction.options.getInteger('minutes');
    const remindAt = Date.now() + minutes * 60000;

    db.run('INSERT INTO reminders (user_id, message, remind_at) VALUES (?, ?, ?)',
      [interaction.user.id, message, remindAt]);

    await interaction.reply(`🔔 Reminder set for ${minutes} minutes from now.`);
  },

  // Prefix command handler
  async prefix(message, args) {
    const reminderMsg = args.slice(0, -1).join(' ');
    const minutes = parseInt(args[args.length - 1], 10);

    if (!reminderMsg || isNaN(minutes)) {
      return message.reply('❌ Use: !addreminder <message> <minutes>');
    }

    const remindAt = Date.now() + minutes * 60000;

    db.run('INSERT INTO reminders (user_id, message, remind_at) VALUES (?, ?, ?)',
      [message.author.id, reminderMsg, remindAt]);

    await message.reply(`🔔 Reminder set for ${minutes} minutes from now.`);
  }
};
