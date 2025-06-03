require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
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
