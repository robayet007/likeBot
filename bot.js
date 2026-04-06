import TelegramBot from "node-telegram-bot-api";

// ⚠️ PUT YOUR NEW TOKEN HERE
const token = "8399641264:AAHTYqrZl_bszFJyTP3pQAmnDB0WdiZuoXM";

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // check if user sent UID (number only)
  if (!/^\d+$/.test(text)) {
    bot.sendMessage(chatId, "❌ Please send a valid UID");
    return;
  }

  try {
    const url = `https://free-fire-like-api-bd12.vercel.app/like?uid=${uid}&server_name=BD`;

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

    bot.sendMessage(chatId, message);

  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "❌ Failed to fetch data");
  }
});

console.log("🤖 Bot is running...");