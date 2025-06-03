const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket_open')
    .setDescription('Open a new ticket to ask a question'),

  async execute(interaction) {
    const guild = interaction.guild;
    const member = interaction.member;
    const categoryName = 'School Tickets';

    // Busca o cargo Staff
    const staffRole = guild.roles.cache.find(r => r.name === 'Staff');

    // Verificar se a categoria existe
    let category = guild.channels.cache.find(c => c.name === categoryName && c.type === ChannelType.GuildCategory);
    if (!category) {
      category = await guild.channels.create({
        name: categoryName,
        type: ChannelType.GuildCategory,
      });
    }

    // Verificar se o utilizador já tem um ticket aberto
    const existingChannel = guild.channels.cache.find(c =>
      c.name === `ticket-${member.user.username.toLowerCase()}-${member.id}` && c.parentId === category.id
    );
    if (existingChannel) {
      return interaction.reply({ content: '❌ You already have an open ticket.', ephemeral: true });
    }

    // Permissões do canal
    const permissionOverwrites = [
      {
        id: guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: member.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      }
    ];
    if (staffRole) {
      permissionOverwrites.push({
        id: staffRole.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      });
    }

    // Criar o canal do ticket
    const ticketChannel = await guild.channels.create({
      name: `ticket-${member.user.username.toLowerCase()}-${member.id}`,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites
    });

    await ticketChannel.send(`Hello ${member}, please describe your question or issue here. A member of the support team will assist you soon.`);
    interaction.reply({ content: `✅ Your ticket has been created: ${ticketChannel}`, ephemeral: true });
  },

  // Prefix command handler
  async prefix(message) {
    const guild = message.guild;
    const member = message.member;
    const categoryName = 'School Tickets';

    if (!guild) return message.reply('❌ This command can only be used in a server.');

    // Busca o cargo Staff
    const staffRole = guild.roles.cache.find(r => r.name === 'Staff');

    // Verificar se a categoria existe
    let category = guild.channels.cache.find(c => c.name === categoryName && c.type === ChannelType.GuildCategory);
    if (!category) {
      category = await guild.channels.create({
        name: categoryName,
        type: ChannelType.GuildCategory,
      });
    }

    // Verificar se o utilizador já tem um ticket aberto
    const existingChannel = guild.channels.cache.find(c =>
      c.name === `ticket-${member.user.username.toLowerCase()}-${member.id}` && c.parentId === category.id
    );
    if (existingChannel) {
      return message.reply('❌ You already have an open ticket.');
    }

    // Permissões do canal
    const permissionOverwrites = [
      {
        id: guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: member.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      }
    ];
    if (staffRole) {
      permissionOverwrites.push({
        id: staffRole.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      });
    }

    // Criar o canal do ticket
    const ticketChannel = await guild.channels.create({
      name: `ticket-${member.user.username.toLowerCase()}-${member.id}`,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites
    });

    await ticketChannel.send(`Hello ${member}, please describe your question or issue here. A member of the support team will assist you soon.`);
    message.reply(`✅ Your ticket has been created: ${ticketChannel}`);
  }
};