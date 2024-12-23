const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const cors = require('cors'); // Подключаем библиотеку CORS

// Токен вашего бота
const TOKEN = '7622813957:AAFxx96G-rbcitYzcov6JHMYlqWDBBZm0ac';
const WEB_APP_URL = 'https://slayerrapid-csiat7.stormkit.dev/'; // URL вашего приложения на хостинге

// Моделируем базу данных в памяти
let users = {};

// Создаем экземпляр Telegram бота
const bot = new TelegramBot(TOKEN, { polling: true });

// Настраиваем Express сервер
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;

  // Генерация бонуса $GRINCH
  const baseBonus = Math.floor(Math.random() * 501) + 400; // От 400 до 900
  const isPremium = telegramId % 2 === 0; // Пример проверки на премиум (можно заменить)
  const premiumBonus = isPremium ? 500 : 0;
  const totalBonus = baseBonus + premiumBonus;

  // Сохраняем пользователя
  users[telegramId] = {
    telegramId,
    grinchCoins: totalBonus,
    isPremium,
  };

  // Отправляем сообщение с бонусом и ссылкой на веб-приложение
  bot.sendMessage(
    chatId,
    `You've received ${totalBonus} $GRINCH${isPremium ? ' (+500 Premium Bonus)' : ''}!`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'View Your Balance',
              web_app: { url: `${WEB_APP_URL}?telegramId=${telegramId}` },
            },
          ],
        ],
      }
    }
  );
});

// Маршрут API для получения информации о пользователе
app.get('/api/user/:telegramId', (req, res) => {
  const telegramId = req.params.telegramId;
  const user = users[telegramId];

  if (user) {
    res.json({
      grinchCoins: user.grinchCoins,
      isPremium: user.isPremium,
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
