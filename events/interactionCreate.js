module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Só processa comandos slash
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`Comando ${interaction.commandName} não encontrado!`);
      return interaction.reply({ content: '❌ Command not found.', ephemeral: true });
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Erro ao executar o comando ${interaction.commandName}:`, error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: '❌ There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ There was an error while executing this command!', ephemeral: true });
      }
    }
  },
};
