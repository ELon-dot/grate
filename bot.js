const express = require('express');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

// Токен вашего бота
const TOKEN = '7622813957:AAFxx96G-rbcitYzcov6JHMYlqWDBBZm0ac';
const WEB_APP_URL = 'https://hyenasaber-ja9pcv.stormkit.dev/'; // URL вашего приложения на хостинге

// Подключение к базе данных MongoDB
mongoose.connect('mongodb://localhost:27017/telegram', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Создаем модель пользователя
const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  grinchCoins: { type: Number, default: 0 },
  firstVisit: { type: Boolean, default: true }
});

const User = mongoose.model('User', UserSchema);

// Создаем экземпляр Telegram бота
const bot = new TelegramBot(TOKEN, { polling: true });

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;

  let user = await User.findOne({ telegramId });

  if (!user) {
    // Если пользователь не найден в базе данных, создаем его
    user = new User({ telegramId, firstVisit: true });
    await user.save();
  }

  if (user.firstVisit) {
    // При первом посещении начисляем бонус от 400 до 800 $GRINCH
    const bonus = Math.floor(Math.random() * 401) + 400; // Случайное число от 400 до 800
    user.grinchCoins += bonus;
    user.firstVisit = false;
    await user.save();

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
app.get('/api/user/:telegramId', async (req, res) => {
  const telegramId = req.params.telegramId;
  try {
    const user = await User.findOne({ telegramId });
    if (user) {
      res.json({ grinchCoins: user.grinchCoins });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Создаем сервер Express
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
