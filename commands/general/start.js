const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Set up Welcome and Study Zone categories, channels, and roles'),

  async execute(interaction) {
    const guild = interaction.guild;

    // Cria o cargo Staff se não existir
    let staffRole = guild.roles.cache.find(r => r.name === 'Staff');
    if (!staffRole) {
      staffRole = await guild.roles.create({
        name: 'Staff',
        color: 'Orange',
        reason: 'StudyBot setup command',
      });
    }

    // Cria o cargo Student se não existir
    let studentRole = guild.roles.cache.find(r => r.name === 'Student');
    if (!studentRole) {
      studentRole = await guild.roles.create({
        name: 'Student',
        color: 'Green',
        reason: 'StudyBot setup command',
      });
    }

    // Cria a categoria Welcome (everyone pode ver)
    let welcomeCategory = guild.channels.cache.find(c => c.name === 'Welcome' && c.type === 4);
    if (!welcomeCategory) {
      welcomeCategory = await guild.channels.create({
        name: 'Welcome',
        type: 4, // Categoria
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            allow: [PermissionFlagsBits.ViewChannel],
          }
        ]
      });
    }

    // Cria canais em Welcome
    await guild.channels.create({ name: '📝│registro', type: 0, parent: welcomeCategory.id });
    await guild.channels.create({ name: '📜│rules', type: 0, parent: welcomeCategory.id });
    

    // Cria a categoria Study Zone (apenas Staff e Student podem ver)
    let studyCategory = guild.channels.cache.find(c => c.name === 'Study Zone' && c.type === 4);
    if (!studyCategory) {
      studyCategory = await guild.channels.create({
        name: 'Study Zone',
        type: 4, // Categoria
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: staffRole.id,
            allow: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: studentRole.id,
            allow: [PermissionFlagsBits.ViewChannel],
          }
        ]
      });
    }

    // Canais em Study Zone
    await guild.channels.create({ name: '📚│general-study', type: 0, parent: studyCategory.id });
    await guild.channels.create({ name: '📝│tasks', type: 0, parent: studyCategory.id });
    await guild.channels.create({ name: '⏰│reminders', type: 0, parent: studyCategory.id });

    await interaction.reply('✅ Welcome and Study Zone categories, channels, Staff and Student roles created!');
  },

  // Prefix command handler
  async prefix(message) {
    const guild = message.guild;
    if (!guild) return message.reply('❌ This command can only be used on a server.');

    // Cria o cargo Staff se não existir
    let staffRole = guild.roles.cache.find(r => r.name === 'Staff');
    if (!staffRole) {
      staffRole = await guild.roles.create({
        name: 'Staff',
        color: 'Blue',
        reason: 'StudyBot setup command',
      });
    }

    // Cria o cargo Student se não existir
    let studentRole = guild.roles.cache.find(r => r.name === 'Student');
    if (!studentRole) {
      studentRole = await guild.roles.create({
        name: 'Student',
        color: 'Green',
        reason: 'StudyBot setup command',
      });
    }

    // Cria a categoria Welcome (everyone pode ver)
    let welcomeCategory = guild.channels.cache.find(c => c.name === 'Welcome' && c.type === 4);
    if (!welcomeCategory) {
      welcomeCategory = await guild.channels.create({
        name: 'Welcome',
        type: 4, // Categoria
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            allow: [PermissionFlagsBits.ViewChannel],
          }
        ]
      });
    }

    // Cria canais em Welcome
    await guild.channels.create({ name: '📝│registro', type: 0, parent: welcomeCategory.id });
    await guild.channels.create({ name: '📜│rules', type: 0, parent: welcomeCategory.id });

    // Cria a categoria Study Zone (apenas Staff e Student podem ver)
    let studyCategory = guild.channels.cache.find(c => c.name === 'Study Zone' && c.type === 4);
    if (!studyCategory) {
      studyCategory = await guild.channels.create({
        name: 'Study Zone',
        type: 4, // Categoria
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: staffRole.id,
            allow: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: studentRole.id,
            allow: [PermissionFlagsBits.ViewChannel],
          }
        ]
      });
    }

    // Canais em Study Zone
    await guild.channels.create({ name: '📚│general-study', type: 0, parent: studyCategory.id });
    await guild.channels.create({ name: '📝│tasks', type: 0, parent: studyCategory.id });
    await guild.channels.create({ name: '⏰│reminders', type: 0, parent: studyCategory.id });

    await message.reply('✅ Welcome and Study Zone categories, channels, Staff and Student roles created!');
  }
};