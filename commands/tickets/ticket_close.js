const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket_close')
    .setDescription('Close the current ticket'),

  async execute(interaction) {
    const channel = interaction.channel;

    // Verificar se o canal é um ticket (pode ser pelo prefixo do nome)
    if (!channel.name.startsWith('ticket-')) {
      return interaction.reply({ content: '❌ This command can only be used inside a ticket channel.', ephemeral: true });
    }

    // Verificar se o utilizador é o dono do ticket ou tem permissão especial
    if (!channel.name.includes(interaction.user.id)) {
      // Aqui podes adicionar verificação para cargos especiais (ex: staff)
      return interaction.reply({ content: '❌ Only the ticket owner or support team can close this ticket.', ephemeral: true });
    }

    // Fechar o ticket (apagar o canal)
    await channel.delete().catch(err => {
      console.error(err);
      interaction.reply({ content: '❌ Failed to delete the ticket channel.', ephemeral: true });
    });
  },

  // Prefix command handler
  async prefix(message) {
    const channel = message.channel;

    if (!channel.name.startsWith('ticket-')) {
      return message.reply('❌ This command can only be used inside a ticket channel.');
    }

    if (!channel.name.includes(message.author.id)) {
      // Aqui podes adicionar verificação para cargos especiais (ex: staff)
      return message.reply('❌ Only the ticket owner or support team can close this ticket.');
    }

    channel.delete().catch(err => {
      console.error(err);
      message.reply('❌ Failed to delete the ticket channel.');
    });
  }
};
