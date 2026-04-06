import express from 'express';
import TelegramBot from "node-telegram-bot-api";
import fetch from 'node-fetch'; // Make sure to install node-fetch if not already

// ⚠️ PUT YOUR NEW TOKEN HERE
const token = "8399641264:AAHTYqrZl_bszFJyTP3pQAmnDB0WdiZuoXM";

const bot = new TelegramBot(token, { polling: true });

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
  const text = msg.text;

  // Check if user sent UID (number only)
  if (!text || !/^\d+$/.test(text)) {
    bot.sendMessage(chatId, "❌ Please send a valid UID (numbers only)");
    return;
  }

  try {
    const url = `https://free-fire-like-api-bd12.vercel.app/like?uid=${text}&server_name=BD`;
    
    console.log(`Fetching URL: ${url}`); // Debug log

    // Add proper headers to mimic a browser request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      }
    });

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data); // Debug log

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

📌 Status: ${status === 2 ? "✅ Success" : status === 1 ? "⚠️ Pending" : "❌ Failed"}
`;

    await bot.sendMessage(chatId, message);

  } catch (err) {
    console.error("Error details:", err);
    
    // Send more detailed error message for debugging
    let errorMessage = "❌ Failed to fetch data. ";
    if (err.message.includes('fetch')) {
      errorMessage += "Network error - please try again later.";
    } else if (err.message.includes('JSON')) {
      errorMessage += "Invalid response from API.";
    } else {
      errorMessage += err.message;
    }
    
    bot.sendMessage(chatId, errorMessage);
  }
});

console.log("🤖 Bot is running...");