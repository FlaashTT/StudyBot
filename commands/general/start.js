const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Set up Welcome and Study Zone categories, channels, and roles'),

  async execute(interaction) {
    const guild = interaction.guild;

    // Remove cargos antigos Staff e Student se existirem
    let oldStaff = guild.roles.cache.find(r => r.name === 'Staff');
    if (oldStaff) await oldStaff.delete('StudyBot setup command: removing old Staff role');
    let oldStudent = guild.roles.cache.find(r => r.name === 'Student');
    if (oldStudent) await oldStudent.delete('StudyBot setup command: removing old Student role');

    // Remove categorias antigas e canais filhos se existirem
    let oldWelcome = guild.channels.cache.find(c => c.name === 'Welcome' && c.type === 4);
    if (oldWelcome) {
      for (const channel of guild.channels.cache.filter(ch => ch.parentId === oldWelcome.id).values()) {
        await channel.delete();
      }
      await oldWelcome.delete();
    }
    let oldStudy = guild.channels.cache.find(c => c.name === 'Study Zone' && c.type === 4);
    if (oldStudy) {
      for (const channel of guild.channels.cache.filter(ch => ch.parentId === oldStudy.id).values()) {
        await channel.delete();
      }
      await oldStudy.delete();
    }

    // Cria o cargo Staff
    let staffRole = await guild.roles.create({
      name: 'Staff',
      color: 'Orange',
      reason: 'StudyBot setup command',
    });

    // Cria o cargo Student
    let studentRole = await guild.roles.create({
      name: 'Student',
      color: 'Green',
      reason: 'StudyBot setup command',
    });

    // Cria a categoria Welcome (everyone pode ver)
    const welcomeCategory = await guild.channels.create({
      name: 'Welcome',
      type: 4, // Categoria
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
        }
      ]
    });

    // Cria canais em Welcome
    const registroChannel = await guild.channels.create({ name: '📝│registro', type: 0, parent: welcomeCategory.id });
    const rulesChannel = await guild.channels.create({ name: '📜│rules', type: 0, parent: welcomeCategory.id });

    // Envia embed de regras
    await rulesChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("📜 Server Rules")
          .setDescription([
            "1. Be respectful to everyone.",
            "2. No spam or advertising.",
            "3. Use the correct channels for each topic.",
            "4. Follow Discord's Terms of Service.",
            "5. Have fun and help each other!"
          ].join('\n'))
          .setColor(0x5865F2)
      ]
    });

    // Envia embed com botão no registro
    const regEmbed = new EmbedBuilder()
      .setTitle('📝 Register as Student')
      .setDescription('Click the button below to get access to the study channels!')
      .setColor(0x57F287);

    const regRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('register_student')
        .setLabel('Get Student Role')
        .setStyle(ButtonStyle.Success)
    );

    await registroChannel.send({ embeds: [regEmbed], components: [regRow] });

    // Cria a categoria Study Zone (apenas Staff e Student podem ver)
    const studyCategory = await guild.channels.create({
      name: 'Study Zone',
      type: 4, // Categoria
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: staffRole.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        },
        {
          id: studentRole.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        }
      ]
    });

    // Canais em Study Zone
    await guild.channels.create({ name: '📚│general-study', type: 0, parent: studyCategory.id });
    await guild.channels.create({ name: '📝│tasks', type: 0, parent: studyCategory.id });
    await guild.channels.create({ name: '⏰│reminders', type: 0, parent: studyCategory.id });

    await interaction.reply('✅ Old roles and categories removed. New Welcome and Study Zone categories, channels, Staff and Student roles created!');
  },

  // Prefix command handler
  async prefix(message) {
    const guild = message.guild;
    if (!guild) return message.reply('❌ This command can only be used on a server.');

    // Remove cargos antigos Staff e Student se existirem
    let oldStaff = guild.roles.cache.find(r => r.name === 'Staff');
    if (oldStaff) await oldStaff.delete('StudyBot setup command: removing old Staff role');
    let oldStudent = guild.roles.cache.find(r => r.name === 'Student');
    if (oldStudent) await oldStudent.delete('StudyBot setup command: removing old Student role');

    // Remove categorias antigas e canais filhos se existirem
    let oldWelcome = guild.channels.cache.find(c => c.name === 'Welcome' && c.type === 4);
    if (oldWelcome) {
      for (const channel of guild.channels.cache.filter(ch => ch.parentId === oldWelcome.id).values()) {
        await channel.delete();
      }
      await oldWelcome.delete();
    }
    let oldStudy = guild.channels.cache.find(c => c.name === 'Study Zone' && c.type === 4);
    if (oldStudy) {
      for (const channel of guild.channels.cache.filter(ch => ch.parentId === oldStudy.id).values()) {
        await channel.delete();
      }
      await oldStudy.delete();
    }

    // Cria o cargo Staff
    let staffRole = await guild.roles.create({
      name: 'Staff',
      color: 'Orange',
      reason: 'StudyBot setup command',
    });

    // Cria o cargo Student
    let studentRole = await guild.roles.create({
      name: 'Student',
      color: 'Green',
      reason: 'StudyBot setup command',
    });

    // Cria a categoria Welcome (everyone pode ver)
    const welcomeCategory = await guild.channels.create({
      name: 'Welcome',
      type: 4, // Categoria
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
        }
      ]
    });

    // Cria canais em Welcome
    const registroChannel = await guild.channels.create({ name: '📝│registro', type: 0, parent: welcomeCategory.id });
    const rulesChannel = await guild.channels.create({ name: '📜│rules', type: 0, parent: welcomeCategory.id });

    // Envia embed de regras
    await rulesChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("📜 Server Rules")
          .setDescription([
            "1. Be respectful to everyone.",
            "2. No spam or advertising.",
            "3. Use the correct channels for each topic.",
            "4. Follow Discord's Terms of Service.",
            "5. Have fun and help each other!"
          ].join('\n'))
          .setColor(0x5865F2)
      ]
    });

    // Envia embed com botão no registro
    const regEmbed = new EmbedBuilder()
      .setTitle('📝 Register as Student')
      .setDescription('Click the button below to get access to the study channels!')
      .setColor(0x57F287);

    const regRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('register_student')
        .setLabel('Get Student Role')
        .setStyle(ButtonStyle.Success)
    );

    await registroChannel.send({ embeds: [regEmbed], components: [regRow] });

    // Cria a categoria Study Zone (apenas Staff e Student podem ver)
    const studyCategory = await guild.channels.create({
      name: 'Study Zone',
      type: 4, // Categoria
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: staffRole.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        },
        {
          id: studentRole.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        }
      ]
    });

    // Canais em Study Zone
    await guild.channels.create({ name: '📚│general-study', type: 0, parent: studyCategory.id });
    await guild.channels.create({ name: '📝│tasks', type: 0, parent: studyCategory.id });
    await guild.channels.create({ name: '⏰│reminders', type: 0, parent: studyCategory.id });

    await message.reply('✅ Old roles and categories removed. New Welcome and Study Zone categories, channels, Staff and Student roles created!');
  }
};