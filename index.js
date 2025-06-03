require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers, // já tens
    GatewayIntentBits.GuildMessageReactions, // opcional, mas útil
    GatewayIntentBits.GuildMessageTyping, // opcional
    GatewayIntentBits.GuildVoiceStates, // opcional
    GatewayIntentBits.GuildPresences, // opcional
    GatewayIntentBits.GuildModeration, // opcional
    GatewayIntentBits.GuildEmojisAndStickers, // opcional
    GatewayIntentBits.GuildIntegrations, // opcional
    GatewayIntentBits.GuildWebhooks, // opcional
    GatewayIntentBits.GuildInvites, // opcional
    GatewayIntentBits.GuildScheduledEvents, // opcional
    GatewayIntentBits.AutoModerationConfiguration, // opcional
    GatewayIntentBits.AutoModerationExecution // opcional
  ]
});

const deployInfoPath = path.join(__dirname, 'json', 'last_deploy.json');
let lastDeploy = 0;
if (fs.existsSync(deployInfoPath)) {
  const data = JSON.parse(fs.readFileSync(deployInfoPath, 'utf8'));
  lastDeploy = data.lastDeploy || 0;
}

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
for (const entry of fs.readdirSync(foldersPath)) {
  const entryPath = path.join(foldersPath, entry);
  if (fs.statSync(entryPath).isDirectory()) {
    // Carrega comandos das subpastas
    for (const file of fs.readdirSync(entryPath).filter(f => f.endsWith('.js'))) {
      const command = require(path.join(entryPath, file));
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.warn(`[WARNING] The command at ${path.join(entryPath, file)} is missing "data" or "execute".`);
      }
    }
  } else if (entry.endsWith('.js')) {
    // Carrega comandos diretamente na pasta commands
    const command = require(entryPath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`[WARNING] The command at ${entryPath} is missing "data" or "execute".`);
    }
  }
}

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  // Handler para o botão de registro
  if (interaction.isButton() && interaction.customId === 'register_student') {
    const studentRole = interaction.guild.roles.cache.find(r => r.name === 'Student');
    if (!studentRole) return interaction.reply({ content: '❌ Student role not found.', ephemeral: true });

    let hasRole = interaction.member.roles.cache.has(studentRole.id);

    // Alterna o cargo
    if (hasRole) {
      await interaction.member.roles.remove(studentRole);
      await interaction.reply({ content: '❌ Student role removed. You no longer have access to the study channels.', ephemeral: true });
    } else {
      await interaction.member.roles.add(studentRole);
      await interaction.reply({ content: '✅ Student role added! You now have access to the study channels.', ephemeral: true });
    }

    // Atualiza o botão, título e descrição do embed
    const newLabel = hasRole ? 'Get Student Role' : 'Remove Student Role';
    const newStyle = hasRole ? ButtonStyle.Success : ButtonStyle.Danger;
    const newTitle = hasRole ? '📝 Register as Student' : '❌ Remove Student Role';
    const newDescription = hasRole
      ? 'Click the button below to get access to the study channels!'
      : 'Click the button below to remove your access to the study channels.';

    const regEmbed = new EmbedBuilder()
      .setTitle(newTitle)
      .setDescription(newDescription)
      .setColor(0x57F287);

    const regRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('register_student')
        .setLabel(newLabel)
        .setStyle(newStyle)
    );

    try {
      await interaction.message.edit({ embeds: [regEmbed], components: [regRow] });
    } catch (e) {
      // Ignora se não conseguir editar (por exemplo, se não for a mensagem original)
    }
    return;
  }

  // Handler para comandos slash
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  // Bloqueia comandos se não passou 1 hora desde o último deploy
  const now = Date.now();
  const cooldownAmount = 60 * 60 * 1000; // 1 hora em ms
  if (now < lastDeploy + cooldownAmount) {
    const remaining = Math.ceil((lastDeploy + cooldownAmount - now) / (60 * 1000));
    return interaction.reply({
      content: `⏳ Os comandos só podem ser usados daqui a ${remaining} minutos após o último deploy.`,
      ephemeral: true
    });
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ Error executing command.', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
    }
  }
});

const PREFIX = process.env.PREFIX || '!';
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Supondo que carregaste o comando como client.commands.set('faq_add', require('./commands/faq/faq_add.js'))
  const command = client.commands.get(commandName);
  if (command && typeof command.prefix === 'function') {
    await command.prefix(message, args);
  }
});

require('./utils/reminderChecker');
module.exports = { client };

client.login(process.env.DISCORD_TOKEN);
