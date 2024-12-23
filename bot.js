const TelegramBot = require('node-telegram-bot-api');

// Токен вашего бота
const TOKEN = '7622813957:AAFxx96G-rbcitYzcov6JHMYlqWDBBZm0ac';
const WEB_APP_URL = 'https://slayerrapid-csiat7.stormkit.dev/'; // URL вашего веб-приложения

// Создаём экземпляр Telegram бота
const bot = new TelegramBot(TOKEN, { polling: true });

// Сохраняем данные о пользователях в памяти
let users = {};

// Обрабатываем команду /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;

  // Генерация бонуса $GRINCH
  const baseBonus = Math.floor(Math.random() * 501) + 400; // От 400 до 900
  const isPremium = telegramId % 2 === 0; // Пример проверки на премиум
  const premiumBonus = isPremium ? 500 : 0;
  const totalBonus = baseBonus + premiumBonus;

  // Сохраняем данные пользователя
  users[telegramId] = {
    grinchCoins: totalBonus,
    isPremium
  };

  // Отправляем сообщение с кнопкой
  bot.sendMessage(chatId, `You've received ${totalBonus} $GRINCH${isPremium ? ' (+500 Premium Bonus)' : ''}!`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Open Web App', web_app: { url: `${WEB_APP_URL}?grinchCoins=${totalBonus}&isPremium=${isPremium}` } }]
      ]
    }
  });
});
