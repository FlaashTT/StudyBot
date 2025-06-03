require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const foldersPath = path.join(__dirname, 'commands');

// Lê todos os comandos nas pastas e subpastas
for (const entry of fs.readdirSync(foldersPath)) {
  const entryPath = path.join(foldersPath, entry);
  if (fs.statSync(entryPath).isDirectory()) {
    for (const file of fs.readdirSync(entryPath).filter(f => f.endsWith('.js'))) {
      const command = require(path.join(entryPath, file));
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
      } else {
        console.warn(`[WARNING] O comando ${path.join(entryPath, file)} está sem "data" ou "execute".`);
      }
    }
  } else if (entry.endsWith('.js')) {
    const command = require(entryPath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.warn(`[WARNING] O comando ${entryPath} está sem "data" ou "execute".`);
    }
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🧹 A eliminar comandos slash antigos...');
    const existingCommands = await rest.get(
      Routes.applicationCommands(process.env.CLIENT_ID)
    );

    for (const cmd of existingCommands) {
      await rest.delete(
        Routes.applicationCommand(process.env.CLIENT_ID, cmd.id)
      );
      console.log(`❌ Comando antigo removido: ${cmd.name}`);
    }

    console.log(`📦 A registar ${commands.length} novos comandos...`);
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('✅ Comandos registados com sucesso.');

    // Guarda a hora do último deploy
    const dataDir = path.join(__dirname, 'json');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    fs.writeFileSync(
      path.join(dataDir, 'last_deploy.json'),
      JSON.stringify({ lastDeploy: Date.now() })
    );
  } catch (error) {
    console.error('❌ Erro ao registar comandos:', error);
  }
})();


