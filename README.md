# StudyBot

A Discord bot to help with studying, featuring commands for FAQs, notes, tasks, reminders, quizzes, tickets, and resources.

## Features

- **FAQ Commands:** Add, remove, list, and search frequently asked questions.
- **Notes:** Save, read, delete, and list personal notes.
- **Tasks:** Add, list, and mark study tasks as completed.
- **Reminders:** Create, list, and cancel reminders.
- **Resources:** Save and view links, videos, PDFs, and summaries.
- **Tickets:** Support ticket system.
- **Quizzes:** Quick questions to test your knowledge.
- **Prefix and Slash Commands:** Use commands like `/help` or `!help`.

## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/FlaashTT/StudyBot.git
   cd StudyBot
   ```

2. **Install dependencies:**
   ```sh
   npm init -y
   npm install discord.js sqlite3 dotenv fs path
   ```

3. **Configure the `.env` file:**
   Create a `.env` file in the root directory with:
   ```
   DISCORD_TOKEN=your_token
   CLIENT_ID=your_client_id
   PREFIX=!
   ```

4. **Set up the database:**
   - Make sure the `database` folder exists.
   - The bot will create tables automatically on startup.

5. **Register the commands with Discord:**
   ```sh
   node deploy-commands.js
   ```

6. **Start the bot:**
   ```sh
   node index.js
   ```

## Usage Examples

- `/help` or `!help` — List all available commands.
- `/faq_add` or `!faq_add <question> <answer>` — Add a FAQ entry.
- `/note_add` or `!note_add <title> <content>` — Add a note.
- `/addtask` or `!addtask <description>` — Add a study task.

## Contributing

Pull requests are welcome!  
Feel free to open issues for suggestions or improvements.

## License

This project is licensed under the Node.js license (see LICENSE file).