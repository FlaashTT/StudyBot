require("dotenv").config();
const fs = require("fs");
const path = require("path");
const {
  Client,
  GatewayIntentBits,
  Collection,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
  ],
});

const deployInfoPath = path.join(__dirname, "json", "last_deploy.json");
let lastDeploy = 0;
if (fs.existsSync(deployInfoPath)) {
  const data = JSON.parse(fs.readFileSync(deployInfoPath, "utf8"));
  lastDeploy = data.lastDeploy || 0;
}

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
for (const entry of fs.readdirSync(foldersPath)) {
  const entryPath = path.join(foldersPath, entry);
  if (fs.statSync(entryPath).isDirectory()) {
    for (const file of fs
      .readdirSync(entryPath)
      .filter((f) => f.endsWith(".js"))) {
      const command = require(path.join(entryPath, file));
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.warn(
          `[WARNING] The command at ${path.join(
            entryPath,
            file
          )} is missing "data" or "execute".`
        );
      }
    }
  } else if (entry.endsWith(".js")) {
    const command = require(entryPath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(
        `[WARNING] The command at ${entryPath} is missing "data" or "execute".`
      );
    }
  }
}

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  // Handler para o botão de registro
  if (interaction.isButton() && interaction.customId === "register_student") {
    const studentRole = interaction.guild.roles.cache.find(
      (r) => r.name === "Student"
    );
    if (!studentRole)
      return interaction.reply({
        content: "❌ Student role not found.",
        ephemeral: true,
      });

    let hasRole = interaction.member.roles.cache.has(studentRole.id);

    // Alterna o cargo
    if (hasRole) {
      await interaction.member.roles.remove(studentRole);
      await interaction.reply({
        content:
          "❌ Student role removed. You no longer have access to the study channels.",
        ephemeral: true,
      });
    } else {
      await interaction.member.roles.add(studentRole);
      await interaction.reply({
        content:
          "✅ Student role added! You now have access to the study channels.",
        ephemeral: true,
      });
    }

    // Atualiza o botão, título e descrição do embed
    const newLabel = hasRole ? "Get Student Role" : "Remove Student Role";
    const newStyle = hasRole ? ButtonStyle.Success : ButtonStyle.Danger;
    const newTitle = hasRole
      ? "📝 Register as Student"
      : "❌ Remove Student Role";
    const newDescription = hasRole
      ? "Click the button below to get access to the study channels!"
      : "Click the button below to remove your access to the study channels.";

    const regEmbed = new EmbedBuilder()
      .setTitle(newTitle)
      .setDescription(newDescription)
      .setColor(0x57f287);

    const regRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("register_student")
        .setLabel(newLabel)
        .setStyle(newStyle)
    );

    try {
      await interaction.message.edit({
        embeds: [regEmbed],
        components: [regRow],
      });
    } catch (e) {
      // Ignora se não conseguir editar (por exemplo, se não for a mensagem original)
    }
    return;
  }

  // Handler para o botão de ticket
  if (interaction.isButton() && interaction.customId === "open_ticket") {
    // Verifica se já existe um canal de ticket para o utilizador
    const existing = interaction.guild.channels.cache.find(
      (c) => c.name === `ticket-${interaction.user.id}`
    );
    if (existing) {
      return interaction.reply({
        content: "❗ You already have an open ticket.",
        ephemeral: true,
      });
    }

    // Cria o canal privado de ticket
    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.id}`,
      type: 0, // texto
      parent: interaction.channel.parentId,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: interaction.guild.roles.cache.find((r) => r.name === "Staff")?.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
      ],
    });

    // Embed e botões de gestão do ticket
    const ticketManageEmbed = new EmbedBuilder()
      .setTitle("🎫 Ticket Options")
      .setDescription(
        "Use the buttons below to manage your ticket:\n\n- **Close Ticket**\n- **Save Transcript**\n- **Reset Ticket**"
      )
      .setColor(0x5865f2);

    const ticketManageRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("Close Ticket")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("save_transcript")
        .setLabel("Save Transcript")
        .setStyle(ButtonStyle.Secondary)
    );

    await ticketChannel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [ticketManageEmbed],
      components: [ticketManageRow],
    });

    await interaction.reply({
      content: `✅ Ticket created: ${ticketChannel}`,
      ephemeral: true,
    });
    return;
  }

  // Handler para fechar o ticket
  if (interaction.isButton() && interaction.customId === "close_ticket") {
    // Fecha para o autor
    const userId = interaction.channel.name.split("ticket-")[1];
    if (userId) {
      await interaction.channel.permissionOverwrites.edit(userId, {
        SendMessages: false,
      });
    }

    const staffRole = interaction.guild.roles.cache.find(
      (r) => r.name === "Staff"
    );
    const isStaff =
      staffRole && interaction.member.roles.cache.has(staffRole.id);

    const adminRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("delete_ticket")
        .setLabel("Delete Ticket")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("save_transcript")
        .setLabel("Save Transcript")
        .setStyle(ButtonStyle.Secondary)
    );

    if (isStaff) {
      adminRow.addComponents(
        new ButtonBuilder()
          .setCustomId("reset_ticket")
          .setLabel("Reset Ticket")
          .setStyle(ButtonStyle.Primary)
      );
    }

    const closedEmbed = new EmbedBuilder()
      .setTitle("🎫 Ticket Closed")
      .setDescription(
        "This ticket is now closed for the user.\nOnly staff can write here.\n\nStaff: You can now delete, save or reset this ticket."
      )
      .setColor(0xed4245);

    // Edita a mensagem de gestão (procura a mensagem do bot com componentes)
    const msgs = await interaction.channel.messages.fetch({ limit: 10 });
    const manageMsg = msgs.find(
      (m) =>
        m.author.id === interaction.client.user.id && m.components.length > 0
    );
    if (manageMsg) {
      await manageMsg.edit({ embeds: [closedEmbed], components: [adminRow] });
    }

    await interaction.reply({
      content:
        "✅ Ticket closed! Only staff can write now. Staff can now delete, save or reset this ticket.",
      ephemeral: true,
    });
    return;
  }

  if (interaction.isButton() && interaction.customId === "delete_ticket") {
    const staffRole = interaction.guild.roles.cache.find(
      (r) => r.name === "Staff"
    );
    if (!staffRole || !interaction.member.roles.cache.has(staffRole.id)) {
      return interaction.reply({
        content: "❌ Only staff can delete this ticket.",
        ephemeral: true,
      });
    }
    await interaction.reply({
      content: "🗑️ Ticket will be deleted in 3 seconds...",
      ephemeral: true,
    });
    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 3000);
    return;
  }

  // Handler para guardar o transcript do ticket
  if (interaction.isButton() && interaction.customId === "save_transcript") {
    await interaction.deferReply({ ephemeral: true });
    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const sorted = Array.from(messages.values()).sort(
      (a, b) => a.createdTimestamp - b.createdTimestamp
    );
    const content = sorted
      .map(
        (m) => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`
      )
      .join("\n");
    const filePath = path.join(
      __dirname,
      `ticket-${interaction.channel.id}.txt`
    );
    fs.writeFileSync(filePath, content || "No messages.");
    await interaction.followUp({
      content: "📄 Ticket transcript saved!",
      files: [filePath],
      ephemeral: true,
    });
    fs.unlinkSync(filePath);
    return;
  }

  // Handler para resetar o ticket (apaga todas as mensagens exceto o embed de gestão)
  if (interaction.isButton() && interaction.customId === "reset_ticket") {
    await interaction.reply({
      content: "♻️ Resetting ticket (deleting messages)...",
      ephemeral: true,
    });
    const fetched = await interaction.channel.messages.fetch({ limit: 100 });
    const manageMsg = fetched.find(
      (m) =>
        m.author.id === interaction.client.user.id && m.components.length > 0
    );
    for (const msg of fetched.values()) {
      if (!manageMsg || msg.id !== manageMsg.id) {
        await msg.delete().catch(() => {});
      }
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
    const remaining = Math.ceil(
      (lastDeploy + cooldownAmount - now) / (60 * 1000)
    );
    return interaction.reply({
      content: `⏳ Os comandos só podem ser usados daqui a ${remaining} minutos após o último deploy.`,
      ephemeral: true,
    });
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ Error executing command.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "❌ Error executing command.",
        ephemeral: true,
      });
    }
  }
});

const PREFIX = process.env.PREFIX || "!";
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (command && typeof command.prefix === "function") {
    await command.prefix(message, args);
  }
});

require("./utils/reminderChecker");
module.exports = { client };

client.login(process.env.DISCORD_TOKEN);
