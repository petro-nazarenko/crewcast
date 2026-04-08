import 'dotenv/config';
import { createBot } from './telegram.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN environment variable is not set.');
  process.exit(1);
}

const bot = createBot(token);

bot.catch(err => {
  console.error('💥 Bot error:', err.message);
});

console.log('🤖 CrewCast Telegram bot starting (long polling)...');
bot.start();
