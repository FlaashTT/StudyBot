const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("start")
    .setDescription(
      "Set up Welcome, Study Zone, Off-topic, Voice and Staff categories, channels, and roles"
    ),

  async execute(interaction) {
    const guild = interaction.guild;
    const staffRole = guild.roles.cache.find((r) => r.name === "Staff");
    if (!staffRole || !interaction.member.roles.cache.has(staffRole.id)) {
      return interaction.reply({
        content: "❌ Only Staff can use this command.",
        ephemeral: true,
      });
    }

    // Mensagem de confirmação
    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_start_yes")
        .setLabel("Sim, eliminar tudo")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("confirm_start_no")
        .setLabel("Não")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      content:
        "⚠️ **Atenção:** Este comando vai eliminar todos os cargos (exceto Staff), categorias e canais criados pelo bot. Tens a certeza que queres continuar?",
      components: [confirmRow],
      ephemeral: true,
    });

    // Espera pela resposta do utilizador
    const filter = (i) =>
      i.user.id === interaction.user.id &&
      (i.customId === "confirm_start_yes" || i.customId === "confirm_start_no");
    let confirmation;
    try {
      confirmation = await interaction.channel.awaitMessageComponent({
        filter,
        time: 15000,
      });
    } catch {
      await interaction.editReply({
        content: "❌ Tempo de confirmação expirado.",
        components: [],
        ephemeral: true,
      });
      return;
    }
    if (confirmation.customId === "confirm_start_no") {
      await confirmation.update({
        content: "❌ Operação cancelada.",
        components: [],
        ephemeral: true,
      });
      return;
    }
    await confirmation.update({
      content: "⏳ A configurar o servidor...",
      components: [],
      ephemeral: true,
    });

    await setupGuild(guild, async (msg) => await interaction.followUp(msg));
  },

  async prefix(message) {
    const guild = message.guild;
    const staffRole = guild.roles.cache.find((r) => r.name === "Staff");
    if (!staffRole || !message.member.roles.cache.has(staffRole.id)) {
      return message.reply("❌ Only Staff can use this command.");
    }

    // Envia embed de aviso para confirmação
    const confirmEmbed = new EmbedBuilder()
      .setTitle("⚠️ Attention!")
      .setDescription(
        "This command will delete all roles (except Staff), categories and channels created by the bot.\n\nReply **yes** to continue or **no** to cancel."
      )
      .setColor(0xed4245);

    await message.reply({ embeds: [confirmEmbed] });

    // Aguarda resposta do utilizador
    const filter = (m) =>
      m.author.id === message.author.id &&
      ["yes", "no"].includes(m.content.toLowerCase());
    try {
      const collected = await message.channel.awaitMessages({
        filter,
        max: 1,
        time: 15000,
        errors: ["time"],
      });
      const resposta = collected.first().content.toLowerCase();
      if (resposta !== "yes") {
        return message.reply("❌ Operation cancelled.");
      }
    } catch {
      return message.reply("❌ Confirmation time expired.");
    }

    await message.reply("⏳ Setting up the server...");

    await setupGuild(guild, async (msg) => await message.reply(msg));
  },
};

// Função partilhada para setup (evita duplicação)
async function setupGuild(guild, replyFn) {
  // Remove todos os cargos exceto Staff e @everyone
  for (const role of guild.roles.cache.values()) {
    if (role.name !== "Staff" && role.name !== "@everyone" && role.editable) {
      await role.delete("StudyBot setup command: removing old roles");
    }
  }

  // Remove todas as categorias e canais criados pelo bot
  const categoriesToRemove = [
    "Welcome",
    "Study Zone",
    "Off-topic",
    "Voice Channels",
    "Staff",
  ];
  for (const catName of categoriesToRemove) {
    let cat = guild.channels.cache.find(
      (c) => c.name === catName && c.type === 4
    );
    if (cat) {
      for (const channel of guild.channels.cache
        .filter((ch) => ch.parentId === cat.id)
        .values()) {
        await channel.delete();
      }
      await cat.delete();
    }
  }

  // Garante que o cargo Staff existe (não apaga nem recria se já existir)
  let staffRoleFinal = guild.roles.cache.find((r) => r.name === "Staff");
  if (!staffRoleFinal) {
    staffRoleFinal = await guild.roles.create({
      name: "Staff",
      color: "Orange",
      hoist: true,
      mentionable: true,
      reason: "StudyBot setup command",
    });
  }

  // Cria o cargo Student
  let studentRole = guild.roles.cache.find((r) => r.name === "Student");
  if (!studentRole) {
    studentRole = await guild.roles.create({
      name: "Student",
      color: "Green",
      hoist: true,
      mentionable: true,
      reason: "StudyBot setup command",
    });
  }

  // --- Welcome ---
  const welcomeCategory = await guild.channels.create({
    name: "Welcome",
    type: 4,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ],
  });

  // Canais em Welcome
  const registroChannel = await guild.channels.create({
    name: "📝│registro",
    type: 0,
    parent: welcomeCategory.id,
  });
  const rulesChannel = await guild.channels.create({
    name: "📜│rules",
    type: 0,
    parent: welcomeCategory.id,
  });
  const ticketChannel = await guild.channels.create({
    name: "🎫│ticket",
    type: 0,
    parent: welcomeCategory.id,
  });
  await guild.channels.create({
    name: "📢│announcements",
    type: 0,
    parent: welcomeCategory.id,
  });
  await guild.channels.create({
    name: "👋│introductions",
    type: 0,
    parent: welcomeCategory.id,
  });

  // Envia embed de regras
  await rulesChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("📜 Server Rules")
        .setDescription(
          [
            "📍 Do not mention staff roles without reason or incorrectly.",
            "📍 Discriminatory content, attempts to promote hate speech, swearing, inappropriate nicknames or avatars will not be tolerated and will be judged by the staff team.",
            "📍 Do not mention other servers (regardless of platform).",
            "📍 Avoid sending repeated or meaningless content, including images.",
            "Example: shdadghashdgagsdahgdhasdgahsdgahsdghasgdhgahd",
            "📍 Use the correct channels for your content and respect the channel topics.",
            "📍 It is strictly forbidden to send messages/images/videos that break the law or Discord's Terms of Service.",
            "📍 Avoid causing confusion or drama. Problems should be resolved in private.",
            "📍 Do not play loud sounds in voice channels.",
            "Examples: Screaming, videos, etc.",
            "📍 Do not try to deceive anyone with nicknames or messages. (Permanent ban)",
            "📍 It is forbidden to use multiple accounts by the same user without staff authorization within TEAMDX.",
            "📍 Appeals or reports must be made exclusively on our platform, such as tickets or private messages, and only by the accused.",
            "❓ Any questions or need help? Please go to the tickets channel.",
          ].join("\n")
        )
        .setColor(0x5865f2)
        .setFooter({ text: "STUDY ◦ © All rights reserved" }),
    ],
  });

  // Envia embed com botão no registro
  const regEmbed = new EmbedBuilder()
    .setTitle("📝 Register as Student")
    .setDescription(
      "Click the button below to get access to the study channels!"
    )
    .setColor(0x57f287);

  const regRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("register_student")
      .setLabel("Get Student Role")
      .setStyle(ButtonStyle.Success)
  );

  await registroChannel.send({ embeds: [regEmbed], components: [regRow] });

  // Envia embed com botão para abrir ticket
  const ticketEmbed = new EmbedBuilder()
    .setTitle("🎫 Need Help?")
    .setDescription(
      "Click the button below to open a support ticket with the staff team."
    )
    .setColor(0x5865f2);

  const ticketRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("Open Ticket")
      .setStyle(ButtonStyle.Primary)
  );

  await ticketChannel.send({
    embeds: [ticketEmbed],
    components: [ticketRow],
  });

  // --- Study Zone ---
  const studyCategory = await guild.channels.create({
    name: "Study Zone",
    type: 4,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: staffRoleFinal.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ManageRoles,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.MuteMembers,
          PermissionFlagsBits.DeafenMembers,
          PermissionFlagsBits.MoveMembers,
          PermissionFlagsBits.ManageGuild,
        ],
      },
      {
        id: studentRole.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.CreatePublicThreads,
          PermissionFlagsBits.CreatePrivateThreads,
          PermissionFlagsBits.UseExternalEmojis,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.AddReactions,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.UseApplicationCommands,
          PermissionFlagsBits.UseExternalStickers,
          PermissionFlagsBits.MentionEveryone,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.MentionRoles,
          PermissionFlagsBits.Connect,
          PermissionFlagsBits.Speak,
          PermissionFlagsBits.UseVoiceActivity,
          PermissionFlagsBits.Stream,
        ],
      },
    ],
  });

  await guild.channels.create({
    name: "📚│general-study",
    type: 0,
    parent: studyCategory.id,
  });
  await guild.channels.create({
    name: "📝│tasks",
    type: 0,
    parent: studyCategory.id,
  });
  await guild.channels.create({
    name: "⏰│reminders",
    type: 0,
    parent: studyCategory.id,
  });
  await guild.channels.create({
    name: "📖│resources",
    type: 0,
    parent: studyCategory.id,
  });
  await guild.channels.create({
    name: "🤝│study-groups",
    type: 0,
    parent: studyCategory.id,
  });
  await guild.channels.create({
    name: "🧑‍🏫│tutoring",
    type: 0,
    parent: studyCategory.id,
  });

  // --- Off-topic ---
  const offTopicCategory = await guild.channels.create({
    name: "Off-topic",
    type: 4,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: staffRoleFinal.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: studentRole.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.UseExternalEmojis,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.AddReactions,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.UseApplicationCommands,
          PermissionFlagsBits.UseExternalStickers,
          PermissionFlagsBits.MentionEveryone,
          PermissionFlagsBits.MentionRoles,
          PermissionFlagsBits.Connect,
          PermissionFlagsBits.Speak,
          PermissionFlagsBits.UseVoiceActivity,
          PermissionFlagsBits.Stream,
        ],
      },
    ],
  });

  await guild.channels.create({
    name: "💬│off-topic",
    type: 0,
    parent: offTopicCategory.id,
  });
  await guild.channels.create({
    name: "🎮│games",
    type: 0,
    parent: offTopicCategory.id,
  });
  await guild.channels.create({
    name: "😂│memes",
    type: 0,
    parent: offTopicCategory.id,
  });
  await guild.channels.create({
    name: "📸│media",
    type: 0,
    parent: offTopicCategory.id,
  });

  // --- Voice Channels ---
  const voiceCategory = await guild.channels.create({
    name: "Voice Channels",
    type: 4,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: staffRoleFinal.id,
        allow: [PermissionFlagsBits.ViewChannel],
        allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      },
      {
        id: studentRole.id,
        allow: [PermissionFlagsBits.ViewChannel],
        allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      },
    ],
  });

  await guild.channels.create({
    name: "🔊│General Voice",
    type: 2,
    parent: voiceCategory.id,
  });
  await guild.channels.create({
    name: "📚│Study Room 1",
    type: 2,
    parent: voiceCategory.id,
  });
  await guild.channels.create({
    name: "📚│Study Room 2",
    type: 2,
    parent: voiceCategory.id,
  });
  await guild.channels.create({
    name: "🗣️│Questions in Voice",
    type: 2,
    parent: voiceCategory.id,
  });
  await guild.channels.create({
    name: "🎤│Presentations",
    type: 2,
    parent: voiceCategory.id,
  });

  // --- Staff (private) ---
  const staffCategory = await guild.channels.create({
    name: "Staff",
    type: 4,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: staffRoleFinal.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ManageRoles,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.MuteMembers,
          PermissionFlagsBits.DeafenMembers,
          PermissionFlagsBits.MoveMembers,
          PermissionFlagsBits.ManageGuild,
        ],
      },
    ],
  });

  await guild.channels.create({
    name: "🛡️│staff-chat",
    type: 0,
    parent: staffCategory.id,
  });
  await guild.channels.create({
    name: "🛠️│staff-logs",
    type: 0,
    parent: staffCategory.id,
  });
  await guild.channels.create({
    name: "📋│staff-tasks",
    type: 0,
    parent: staffCategory.id,
  });

  await replyFn(
    "✅ Estrutura criada: Welcome, Study Zone, Off-topic, Voice Channels e Staff, com todas as funcionalidades e canais recomendados!"
  );
}
