import express from 'express';
import TelegramBot from "node-telegram-bot-api";

// ⚠️ YOUR TOKEN
const token = "8399641264:AAHTYqrZl_bszFJyTP3pQAmnDB0WdiZuoXM";

// IMPORTANT: Disable privacy mode by setting polling with options
const bot = new TelegramBot(token, { 
  polling: true,
  // This allows the bot to see all messages in groups
  onlyFirstMatch: false
});

// Create Express server for Render's health checks
const app = express();
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

// Start Express server
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Health check server running on port ${port}`);
});

// Your bot code
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  let text = msg.text;

  // Remove any whitespace and validate
  if (text) {
    text = text.trim();
  }

  // Check if user sent UID (numbers only) - but keep as string
  if (!text || !/^\d+$/.test(text)) {
    bot.sendMessage(chatId, "❌ Please send a valid UID (numbers only)");
    return;
  }

  try {
    // IMPORTANT: Keep UID as string, don't convert to number
    const uid = text; // This is already a string
    const url = `https://free-fire-like-api-bd12.vercel.app/like?uid=${uid}&server_name=BD`;
    
    console.log(`Fetching UID as string: ${uid}`); // Debug log
    console.log(`URL: ${url}`); // Debug log

    // Add headers to avoid blocking
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log("API Response:", data); // Debug log

    const nickname = data?.PlayerNickname || "Unknown";
    const before = data?.LikesbeforeCommand || 0;
    const after = data?.LikesafterCommand || 0;
    const apiLikes = data?.LikesGivenByAPI || 0;
    const status = data?.status ?? "N/A";

    const message = `
📊 Player Info

👤 Nickname: ${nickname}
🆔 UID: ${uid}

👍 Likes (Before): ${before}
⚡️ Likes (After): ${after}
🤖 API Likes: ${apiLikes}

📌 Status: ✅ Success
`;

    await bot.sendMessage(chatId, message);

  } catch (err) {
    console.error("Error:", err);
    bot.sendMessage(chatId, "❌ Failed to fetch data. Please try again later.");
  }
});

// Optional: Add a command to show bot info
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    "🤖 Bot is active!\n\n" +
    "📌 How to use:\n" +
    "• Send any UID (numbers only)\n" +
    "• Works in private chat and groups\n\n" +
    "⚠️ For groups: Make sure to add @BotFather and disable privacy mode"
  );
});

console.log("🤖 Bot is running...");