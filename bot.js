const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const cors = require('cors'); // Подключаем библиотеку CORS

// Токен вашего бота
const TOKEN = '7622813957:AAFxx96G-rbcitYzcov6JHMYlqWDBBZm0ac';
const WEB_APP_URL = 'https://ravenemerald-jwcofp.stormkit.dev/'; // URL вашего приложения на хостинге
// Моделируем базу данных в памяти

// Моделируем базу данных в памяти
let users = {};

// Создаем экземпляр Telegram бота
const bot = new TelegramBot(TOKEN, { polling: true });

// Подключаем CORS
const app = express();
app.use(cors()); // Разрешаем запросы из браузера
app.use(express.static(path.join(__dirname, 'public')));

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;

  // Проверяем, есть ли уже пользователь
  let user = users[telegramId];

  if (!user) {
    // Если пользователя нет, создаем его
    user = {
      telegramId,
      grinchCoins: 0,
      firstVisit: true,
    };
    users[telegramId] = user;
  }

  if (user.firstVisit) {
    // При первом посещении начисляем бонус от 400 до 800 $GRINCH
    const bonus = Math.floor(Math.random() * 401) + 400; // Случайное число от 400 до 800
    user.grinchCoins += bonus;
    user.firstVisit = false;

    // Отправляем сообщение с кнопкой для продолжения
    bot.sendMessage(chatId, `Congratulations! You've received ${bonus} $GRINCH!`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Continue', web_app: { url: `${WEB_APP_URL}?telegramId=${telegramId}` } }]
        ]
      }
    });
  } else {
    // Если пользователь уже заходил, отправляем ссылку на веб-приложение
    bot.sendMessage(chatId, 'Welcome back! Check your $GRINCH balance:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Open Web App', web_app: { url: `${WEB_APP_URL}?telegramId=${telegramId}` } }]
        ]
      }
    });
  }
});

// Маршрут API для получения информации о пользователе
app.get('/api/user/:telegramId', (req, res) => {
  const telegramId = req.params.telegramId;
  const user = users[telegramId];

  if (user) {
    console.log(`User found: ${telegramId}, Balance: ${user.grinchCoins}`);
    res.json({ grinchCoins: user.grinchCoins });
  } else {
    console.log(`User not found: ${telegramId}`);
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