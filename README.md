# Summoners War News Bot

A Discord bot that automatically fetches and posts news from Summoners War's official Hive website. The bot monitors both events and notices, posting them in real-time to your Discord server.

## Features

- 🎮 Monitors Summoners War's official Hive website
- 🔄 Auto-posts new events and notices
- 🎯 Distinguishes between events and updates
- 🖼️ Includes event images in Discord embeds
- 🕒 Checks for new content every 10 minutes
- 📝 Keeps track of posted content to avoid duplicates

## Requirements

- Node.js 16.x or higher
- Discord Bot Token
- Discord Server with appropriate permissions

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/summoners-bot.git
cd summoners-bot
```

2. Install dependencies:
```bash
npm install
```

3. Copy the example configuration file:
```bash
cp config.example.js config.js
```

4. Edit `config.js` with your Discord bot token and channel ID:
```javascript
module.exports = {
    token: 'YOUR_DISCORD_BOT_TOKEN',
    channelId: 'YOUR_DISCORD_CHANNEL_ID'
};
```

## Configuration

### Creating a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Copy the bot token and add it to your `config.js`
5. Enable the following Privileged Gateway Intents:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent

### Getting the Channel ID

1. Enable Developer Mode in Discord (User Settings > App Settings > Advanced > Developer Mode)
2. Right-click the channel where you want the bot to post
3. Click "Copy ID" and add it to your `config.js`

### Inviting the Bot to Your Server

1. Go to the "OAuth2" section in the Discord Developer Portal
2. Select the following permissions:
   - Read Messages/View Channels
   - Send Messages
   - Embed Links
3. Copy the generated URL and open it in your browser
4. Select your server and authorize the bot

## Usage

Start the bot:
```bash
node index.js
```

The bot will:
- Connect to Discord
- Start monitoring Hive website
- Post new content automatically
- Keep track of posted content in `posted.json`

## Discord Message Format

### Events
```
🎉 [EVENT] Event Title
New event: Click the link below to see the details.
🔗 Event URL
```

### Updates
```
🛠️ [UPDATE] Update Title
New update: Click the link below to see the details.
🔗 Update URL
```

## File Structure

- `index.js` - Main bot code
- `config.js` - Bot configuration
- `posted.json` - Tracks posted content
- `README.md` - Documentation
- `package.json` - Project dependencies

## Dependencies

- discord.js - Discord API interface
- puppeteer - Web scraping
- cheerio - HTML parsing
- fs - File system operations

## Error Handling

The bot includes error handling for:
- Discord connection issues
- Web scraping failures
- File operations
- Invalid content

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check existing issues on GitHub
2. Create a new issue with:
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages if any

## Acknowledgments

- [Discord.js](https://discord.js.org/)
- [Puppeteer](https://pptr.dev/)
- [Cheerio](https://cheerio.js.org/)
- Summoners War community 