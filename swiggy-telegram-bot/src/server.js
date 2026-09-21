require('dotenv').config();
const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
const { fetchNoiceDeals } = require('./swiggyApi');
const { findAlertWorthyDeals, loadCache } = require('./dealTracker');
const { sendBatchAlerts } = require('./notifier');

const PORT = process.env.PORT || 3000;
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const minDiscount = parseInt(process.env.MIN_DISCOUNT_PERCENT, 10) || config.minDiscount || 30;

const storeConfig = {
  sid: process.env.SWIGGY_STORE_ID || config.store.sid,
  pid: process.env.SWIGGY_PRIMARY_STORE_ID || config.store.pid,
  secid: process.env.SWIGGY_SECONDARY_STORE_ID || config.store.secid
};

let bot = null;
if (token && token !== 'your_bot_token_here') {
  bot = new TelegramBot(token, { polling: false });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health check endpoint
  if (url.pathname === '/' || url.pathname === '/health') {
    const cache = loadCache();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'ok',
      service: 'swiggy-deal-bot',
      store: storeConfig,
      minDiscount,
      lastRuns: cache.lastRuns || {}
    }));
  }

  // Webhook trigger for NOICE scan (can be called by cron-job.org)
  if (url.pathname === '/trigger/noice') {
    try {
      const items = await fetchNoiceDeals(storeConfig);
      const alerts = findAlertWorthyDeals(items, minDiscount, 'noice');
      if (bot && chatId && alerts.length > 0) {
        await sendBatchAlerts(bot, chatId, alerts);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, campaign: 'noice', itemsFound: items.length, alertsSent: alerts.length }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`[Server] Webhook server running on port ${PORT}`);
  console.log(`[Server] Endpoints:`);
  console.log(`  - GET / (Status)`);
  console.log(`  - GET /trigger/noice (Trigger NOICE scan)`);
});
