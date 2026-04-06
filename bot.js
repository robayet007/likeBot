import express from 'express';
import TelegramBot from "node-telegram-bot-api";

// ⚠️ PUT YOUR NEW TOKEN HERE
const token = "8399641264:AAHTYqrZl_bszFJyTP3pQAmnDB0WdiZuoXM";

const bot = new TelegramBot(token, { polling: true });

// Create Express server for Render's health checks
const app = express();
// FIXED: Use PORT from environment variable, fallback to 10000
const port = process.env.PORT || 10000;

// Health check endpoint for Render
app.get('/', (req, res) => {
  res.status(200).send('🤖 Telegram bot is running!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'online', 
    bot: 'polling',
    timestamp: new Date().toISOString()
  });
});

// Start Express server - MUST listen on all interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Health check server running on port ${port}`);
});

// Your bot code
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Check if user sent UID (number only)
  if (!text || !/^\d+$/.test(text)) {
    bot.sendMessage(chatId, "❌ Please send a valid UID (numbers only)");
    return;
  }

  try {
    // Using 'text' not 'uid'
    const url = `https://free-fire-like-api-bd12.vercel.app/like?uid=${text}&server_name=BD`;

    const res = await fetch(url);
    const data = await res.json();

    const nickname = data?.PlayerNickname || "Unknown";
    const before = data?.LikesbeforeCommand || 0;
    const after = data?.LikesafterCommand || 0;
    const apiLikes = data?.LikesGivenByAPI || 0;
    const status = data?.status ?? "N/A";

    const message = `
📊 Player Info

👤 Nickname: ${nickname}
🆔 UID: ${text}

👍 Likes (Before): ${before}
⚡️ Likes (After): ${after}
🤖 API Likes: ${apiLikes}

📌 Status: ${status}
`;

    await bot.sendMessage(chatId, message);

  } catch (err) {
    console.error("Error:", err);
    bot.sendMessage(chatId, "❌ Failed to fetch data. Please try again later.");
  }
});

console.log("🤖 Bot is running...");