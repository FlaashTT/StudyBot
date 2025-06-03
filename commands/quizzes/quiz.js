const { SlashCommandBuilder } = require('discord.js');

const quizzes = [
  {
    question: 'What is the capital of Portugal?',
    options: ['Lisbon', 'Porto', 'Braga', 'Coimbra'],
    answer: 0
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Earth', 'Venus', 'Mars', 'Jupiter'],
    answer: 2
  }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Answer a quiz question'),

  async execute(interaction) {
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    const row = quiz.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');

    await interaction.reply(`🧠 ${quiz.question}\n${row}`);

    const filter = response => response.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, time: 15_000, max: 1 });

    collector.on('collect', msg => {
      const answer = parseInt(msg.content) - 1;
      if (answer === quiz.answer) {
        msg.reply('✅ Correct!');
      } else {
        msg.reply(`❌ Incorrect. The correct answer was: ${quiz.options[quiz.answer]}`);
      }
    });
  },

  // Prefix command handler
  async prefix(message) {
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    const row = quiz.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');

    await message.reply(`🧠 ${quiz.question}\n${row}`);

    const filter = response => response.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({ filter, time: 15_000, max: 1 });

    collector.on('collect', msg => {
      const answer = parseInt(msg.content) - 1;
      if (answer === quiz.answer) {
        msg.reply('✅ Correct!');
      } else {
        msg.reply(`❌ Incorrect. The correct answer was: ${quiz.options[quiz.answer]}`);
      }
    });
  }
};
