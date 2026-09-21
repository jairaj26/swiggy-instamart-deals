require('dotenv').config();
const cron = require('node-cron');
const TelegramBot = require('node-telegram-bot-api');
const config = require('../config.json');
const { fetchKeywordDeals, fetchWednesdayBazaarDeals, fetchCategoryDeals, INSTAMART_CATEGORIES } = require('./swiggyApi');
const { findAlertWorthyDeals, getCachedDeals, loadCache } = require('./dealTracker');
const { sendBatchAlerts } = require('./notifier');
const { getUser, updateUser } = require('./userManager');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
let minDiscount = parseInt(process.env.MIN_DISCOUNT_PERCENT, 10) || config.minDiscount || 50;

const storeConfig = {
  sid: process.env.SWIGGY_STORE_ID || config.store?.sid || '',
  pid: process.env.SWIGGY_PRIMARY_STORE_ID || config.store?.pid || '',
  secid: process.env.SWIGGY_SECONDARY_STORE_ID || config.store?.secid || '',
  minDiscount
};

console.log('====================================================');
console.log('⚡ Instamart Telegram Deal Alert Bot (5 Parallel Workers)');
console.log(`📍 Store ID: ${storeConfig.sid} (Primary: ${storeConfig.pid}, Secondary: ${storeConfig.secid})`);
console.log('🎯 Minimum Alert Discounts: W1 Essentials ≥60%, W2 Treats ≥70%, W3 Lifestyle ≥85%, W4 Beverages ≥70%, W5 Personal Care ≥70%');
console.log('====================================================');

let bot = null;
if (token && token !== 'your_bot_token_here') {
  bot = new TelegramBot(token, { polling: true });
  console.log('🤖 Telegram Bot is connected and listening for commands!');

  // Register commands for the Telegram Menu button
  bot.setMyCommands([
    { command: 'start', description: 'Show welcome message & commands' },
    { command: 'store', description: 'View or set Swiggy Dark Store IDs' },
    { command: 'setdiscount', description: 'Set discount % for each of the 5 workers' },
    { command: 'myinfo', description: 'View your profile & active store' },
    { command: 'status', description: 'Check bot status & scan stats' },
    { command: 'categories', description: 'Scan categories for deals (≥50% OFF)' },
    { command: 'bazaar', description: 'Scan Wednesday Bazaar (≥50% OFF)' }
  ]).catch(err => console.error('[Bot] Failed to set menu commands:', err.message));

  // Error handling for polling & network hiccups
  bot.on('polling_error', (err) => {
    console.error('[Bot Polling Error]', err.code || '', err.message || err);
  });
  bot.on('error', (err) => {
    console.error('[Bot Error]', err.message || err);
  });
} else {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN is not configured in .env.');
  console.warn('   Add your bot token to .env to enable Telegram alerts and interactive commands.');
  console.warn('   The scraper will still run and log deals to data/deals_cache.json!');
}

// Handler: Run Keyword Deal Hunter scan
async function runKeywordScan(notifyChat = null) {
  const user = notifyChat ? getUser(notifyChat, storeConfig) : null;
  const userStore = user ? { sid: user.storeId, pid: user.primaryStoreId, secid: user.secondaryStoreId } : storeConfig;
  const keywordHunterConfig = config.campaigns?.keywordHunter || {};
  const keywordThresholds = keywordHunterConfig.thresholds || { essentials: 65, nonEssentials: 75 };

  console.log(`[${new Date().toLocaleTimeString()}] Starting Keyword Deal Hunter scan for store ${userStore.sid}…`);
  try {
    const items = await fetchKeywordDeals(userStore, {
      categories: keywordHunterConfig.categories,
      thresholds: keywordThresholds
    });
    console.log(`[KeywordHunter] Scanned ${items.length} total items across target queries.`);

    const alerts = findAlertWorthyDeals(items, keywordThresholds, 'keywordHunter');
    console.log(`[KeywordHunter] Found ${alerts.length} deals matching tiered thresholds (Essentials ≥${keywordThresholds.essentials}%, Snacks ≥${keywordThresholds.nonEssentials}%).`);

    const targetChat = notifyChat || chatId;
    if (bot && targetChat && alerts.length > 0) {
      await sendBatchAlerts(bot, targetChat, alerts, { workerInfo: 'Keyword Hunter' });
    } else if (bot && targetChat && alerts.length === 0) {
      const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      const locText = user?.area ? ` in ${user.area}` : '';
      bot.sendMessage(
        targetChat,
        `ℹ️ <b>[Keyword Deal Hunter • ${timeStr}]</b>\nScanned essentials & snacks${locText}. No deals found above thresholds (Essentials ≥<b>${keywordThresholds.essentials}%</b>, Snacks ≥<b>${keywordThresholds.nonEssentials}%</b>) right now.`,
        { parse_mode: 'HTML' }
      );
    }
  } catch (err) {
    console.error('[KeywordHunter] Scan error:', err);
    const targetChat = notifyChat || chatId;
    if (bot && targetChat) bot.sendMessage(targetChat, '❌ Error during Keyword Deal Hunter scan: ' + err.message);
  }
}

// Handler: Run Wednesday Bazaar scan
async function runWednesdayBazaarScan(notifyChat = null) {
  const user = notifyChat ? getUser(notifyChat, storeConfig) : null;
  const userStore = user ? { sid: user.storeId, pid: user.primaryStoreId, secid: user.secondaryStoreId } : storeConfig;
  const bazaarMinDiscount = config.campaigns?.wednesdayBazaar?.minDiscount || 50;

  console.log(`[${new Date().toLocaleTimeString()}] Starting Wednesday Bazaar scan for store ${userStore.sid}…`);
  try {
    const items = await fetchWednesdayBazaarDeals(userStore);
    console.log(`[Bazaar] Scanned ${items.length} total items.`);

    const alerts = findAlertWorthyDeals(items, bazaarMinDiscount, 'wednesdayBazaar');
    console.log(`[Bazaar] Found ${alerts.length} deals matching >= ${bazaarMinDiscount}% OFF threshold.`);

    const targetChat = notifyChat || chatId;
    if (bot && targetChat && alerts.length > 0) {
      await sendBatchAlerts(bot, targetChat, alerts);
    } else if (bot && targetChat && alerts.length === 0) {
      const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      const locText = user?.area ? ` in ${user.area}` : '';
      bot.sendMessage(
        targetChat,
        `ℹ️ <b>[Wednesday Bazaar Scan • ${timeStr}]</b>\nScanned <b>${items.length} items</b>${locText}. No deals found above <b>${bazaarMinDiscount}% OFF</b> right now.`,
        { parse_mode: 'HTML' }
      );
    }
  } catch (err) {
    console.error('[Bazaar] Scan error:', err);
    const targetChat = notifyChat || chatId;
    if (bot && targetChat) bot.sendMessage(targetChat, '❌ Error during Wednesday Bazaar scan: ' + err.message);
  }
}

// Scheduled Jobs
// 1. Keyword Deal Hunter: Hourly between 10:00 AM and 9:05 PM (at minute 5)
const keywordCron = config.campaigns?.keywordHunter?.cron || '5 10-21 * * *';
cron.schedule(keywordCron, () => {
  console.log('⏰ Scheduled Trigger: Keyword Deal Hunter Hourly Scan');
  runKeywordScan();
});
console.log(`📅 Scheduled: Keyword Deal Hunter (${config.campaigns?.keywordHunter?.description || 'Hourly'}) [${keywordCron}]`);

// 2. Wednesday Bazaar: Every Wednesday at 12:02 AM
const bazaarCron = config.campaigns.wednesdayBazaar.cron || '2 0 * * 3';
cron.schedule(bazaarCron, () => {
  console.log('⏰ Scheduled Trigger: Wednesday Bazaar Scan');
  runWednesdayBazaarScan();
});
console.log(`📅 Scheduled: Wednesday Bazaar scan (${config.campaigns.wednesdayBazaar.description}) [${bazaarCron}]`);

// Telegram Bot Interactive Commands & Event Handlers
if (bot) {
  // Reject media/file uploads
  const rejectMedia = (msg) => {
    bot.sendMessage(
      msg.chat.id,
      '⚠️ <b>Uploads are disabled.</b>\n\nPlease choose an option from the <b>Menu</b> button or use <code>/store</code> to configure your store ID.',
      { parse_mode: 'HTML' }
    );
  };
  bot.on('photo', rejectMedia);
  bot.on('document', rejectMedia);
  bot.on('audio', rejectMedia);
  bot.on('video', rejectMedia);
  bot.on('voice', rejectMedia);
  bot.on('sticker', rejectMedia);

  // Welcome & Help
  bot.onText(/\/(?:start|help)(?:@\w+)?(?:\s|$)/, (msg) => {
    const text = 
`👋 <b>Welcome to Instamart Hunter Deal Bot!</b>

I monitor <b>154 Dark Store Aisles</b> across <b>5 Parallel Workers</b>, plus <b>Wednesday Bazaar</b> and all <b>Instamart Categories</b> to find you the highest discounts!

📍 <b>Dark Store Configuration:</b>
• <code>/store</code> — View your current store or get instructions on how to find your Dark Store IDs
• <code>/store &lt;primaryId&gt; [secondaryId]</code> — Link your exact Swiggy warehouse pod IDs
• <code>/myinfo</code> — View your active store IDs and all 5 worker discount thresholds

🎯 <b>Deal Hunter Workers & Alerts:</b>
• 🌾 <b>Worker 1 (Essentials & Fresh)</b> — Veggies, Fruits, Staples, Dairy, Dry Fruits (≥ 60% OFF)
• 🍿 <b>Worker 2 (Sweets & Snacks)</b> — Chips, Chocolates, Sweets, Ice Cream, Noodles (≥ 70% OFF)
• 🛍️ <b>Worker 3 (Lifestyle & Fashion)</b> — Cookware, Appliances, Stationery, Innerwear (≥ 85% OFF)
• 🥤 <b>Worker 4 (Beverages & Spreads)</b> — Colas, Juices, Coffee, Tea, Oats, Sauces (≥ 70% OFF)
• 🧴 <b>Worker 5 (Personal Care & Laundry)</b> — Soaps, Skincare, Baby, Detergents (≥ 70% OFF)

🛍️ <b>Interactive Scanners & Settings:</b>
• <code>/setdiscount</code> — Change discount threshold for any specific worker (or all together)
• <code>/categories</code> — Browse categories for deals <b>≥ 50% OFF</b> on demand
• <code>/bazaar</code> — Scan Wednesday Bazaar Top Deals (≥ 50% OFF)
• <code>/status</code> — Check bot status & tracked deals

<i>💡 Tap the <b>Menu</b> button at the bottom left to quickly run any command!</i>`;

    bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });
  });

  // Reusable helper: Display dark store instructions and current configuration
  function sendStoreGuide(targetChatId) {
    const user = getUser(targetChatId, storeConfig);
    const pid = user.primaryStoreId || user.storeId || storeConfig.pid || 'Not set';
    const secid = user.secondaryStoreId || storeConfig.secid || 'None';

    const text =
`🏪 <b>Swiggy Dark Store Pod Configuration</b>

📍 <b>Your Current Settings:</b>
• <b>Primary Store ID</b>: <code>${pid}</code>
• <b>Secondary Store ID</b>: <code>${secid}</code>

🔍 <b>How to find your Store IDs:</b>
1. Open <a href="https://www.swiggy.com/instamart">swiggy.com/instamart</a> in your browser and confirm your delivery location is set.
2. Click on <b>any category</b> (e.g. <i>Dairy, Bread & Eggs</i> or <i>Atta, Rice & Dal</i>).
3. Clicking a category reveals the store IDs in your browser's address bar URL:
   <code>...category-listing?storeId=<b>1400216</b>&primaryStoreId=<b>1400216</b>&secondaryStoreId=<b>1231805</b>...</code>
• <b>Primary Store ID</b>: The number in <code>storeId=</code> or <code>primaryStoreId=</code> (e.g. <code>1400216</code>).
• <b>Secondary Store ID</b>: The number in <code>secondaryStoreId=</code> (e.g. <code>1231805</code>). If your URL doesn't show a secondary ID, you only need the primary ID!

✏️ <b>To set or update:</b>
Send: <code>/store &lt;primaryId&gt; [secondaryId]</code>
<i>Example</i>: <code>/store 1400216 1231805</code>
<i>Or simply send the numbers directly</i>: <code>1400216 1231805</code>`;

    bot.sendMessage(targetChatId, text, { parse_mode: 'HTML', disable_web_page_preview: true });
  }

  // Reusable helper: Update user store configuration
  function handleSetStore(chatId, sid, secid) {
    const finalSecid = secid || sid;
    updateUser(chatId, {
      storeId: sid,
      primaryStoreId: sid,
      secondaryStoreId: finalSecid
    });
    bot.sendMessage(
      chatId,
      `✅ <b>Store configuration updated:</b>\n` +
      `• <b>Primary Store ID</b>: <code>${sid}</code>\n` +
      `• <b>Secondary Store ID</b>: <code>${finalSecid}</code>\n\n` +
      `Live scans via <b>/categories</b> and <b>/bazaar</b> will now pull catalogs directly from this warehouse pod!`,
      { parse_mode: 'HTML' }
    );
  }

  // /store and /setstore command
  bot.onText(/^\/(?:store|setstore)(?:@\w+)?(?:\s+(\d+))?(?:\s+(\d+))?/i, (msg, match) => {
    const sid = match[1];
    const secid = match[2];
    if (!sid) {
      return sendStoreGuide(msg.chat.id);
    }
    handleSetStore(msg.chat.id, sid, secid);
  });

  // Direct number message (e.g. user types "1400216" or "1400216 1231805")
  bot.onText(/^\s*(\d{5,8})(?:\s+(\d{5,8}))?\s*$/, (msg, match) => {
    handleSetStore(msg.chat.id, match[1], match[2]);
  });

  const WORKERS = [
    { key: 'essentials', name: 'Daily Essentials & Fresh', tag: '🌾', defaultDiscount: 60 },
    { key: 'treats', name: 'Sweets, Snacks & Treats', tag: '🍿', defaultDiscount: 70 },
    { key: 'lifestyle', name: 'Lifestyle, Home & Fashion', tag: '🛍️', defaultDiscount: 85 },
    { key: 'beverages', name: 'Cold Drinks, Beverages & Spreads', tag: '🥤', defaultDiscount: 70 },
    { key: 'personalCare', name: 'Personal Care, Baby & Laundry', tag: '🧴', defaultDiscount: 70 }
  ];

  function getWorkerDiscountOverviewText(user) {
    const wd = user.workerDiscounts || {};
    return (
      `🎯 <b>Worker Discount Alert Thresholds</b>\n\n` +
      `Choose a worker below to adjust its alert threshold, or send:\n` +
      `<code>/setdiscount &lt;worker&gt; &lt;percentage&gt;</code>\n` +
      `<i>Example</i>: <code>/setdiscount essentials 65</code>\n\n` +
      `• 🌾 <b>Daily Essentials & Fresh</b>: <b>≥ ${wd.essentials || 60}% OFF</b>\n` +
      `• 🍿 <b>Sweets, Snacks & Treats</b>: <b>≥ ${wd.treats || 70}% OFF</b>\n` +
      `• 🛍️ <b>Lifestyle & Home</b>: <b>≥ ${wd.lifestyle || 85}% OFF</b>\n` +
      `• 🥤 <b>Cold Drinks & Beverages</b>: <b>≥ ${wd.beverages || 70}% OFF</b>\n` +
      `• 🧴 <b>Personal Care & Laundry</b>: <b>≥ ${wd.personalCare || 70}% OFF</b>\n\n` +
      `<i>Tap a worker button below to customize:</i>`
    );
  }

  function buildWorkerDiscountKeyboard(user) {
    const wd = user.workerDiscounts || {};
    return {
      inline_keyboard: [
        [
          { text: `🌾 Essentials (${wd.essentials || 60}%)`, callback_data: 'selworker:essentials' },
          { text: `🍿 Treats (${wd.treats || 70}%)`, callback_data: 'selworker:treats' }
        ],
        [
          { text: `🛍️ Lifestyle (${wd.lifestyle || 85}%)`, callback_data: 'selworker:lifestyle' },
          { text: `🥤 Beverages (${wd.beverages || 70}%)`, callback_data: 'selworker:beverages' }
        ],
        [
          { text: `🧴 Personal Care (${wd.personalCare || 70}%)`, callback_data: 'selworker:personalCare' }
        ],
        [
          { text: '🌐 Set All Workers Together', callback_data: 'selworker:all' }
        ]
      ]
    };
  }

  function buildThresholdKeyboard(workerKey) {
    return {
      inline_keyboard: [
        [
          { text: '50% OFF', callback_data: `setwdisc:${workerKey}:50` },
          { text: '60% OFF', callback_data: `setwdisc:${workerKey}:60` },
          { text: '70% OFF', callback_data: `setwdisc:${workerKey}:70` }
        ],
        [
          { text: '75% OFF', callback_data: `setwdisc:${workerKey}:75` },
          { text: '80% OFF', callback_data: `setwdisc:${workerKey}:80` },
          { text: '85% OFF', callback_data: `setwdisc:${workerKey}:85` }
        ],
        [
          { text: '🔙 Back to Worker List', callback_data: 'selworker:back' }
        ]
      ]
    };
  }

  function resolveWorkerKey(input) {
    const s = String(input || '').toLowerCase().trim();
    if (['essentials', 'essential', 'fresh', 'produce', 'w1', 'worker1', '1'].includes(s)) return 'essentials';
    if (['treats', 'treat', 'snacks', 'snack', 'sweets', 'w2', 'worker2', '2'].includes(s)) return 'treats';
    if (['lifestyle', 'life', 'home', 'kitchen', 'fashion', 'w3', 'worker3', '3'].includes(s)) return 'lifestyle';
    if (['beverages', 'beverage', 'drinks', 'drink', 'spreads', 'w4', 'worker4', '4'].includes(s)) return 'beverages';
    if (['personal', 'personalcare', 'baby', 'laundry', 'cleaners', 'w5', 'worker5', '5'].includes(s)) return 'personalCare';
    if (['all', 'global', 'everyone'].includes(s)) return 'all';
    return null;
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  bot.onText(/^\/myinfo(?:@\w+)?/i, (msg) => {
    const user = getUser(msg.chat.id, storeConfig);
    const pid = user.primaryStoreId || user.storeId || storeConfig.pid || 'Not set';
    const secid = user.secondaryStoreId || storeConfig.secid || 'None';
    const wd = user.workerDiscounts || {};
    bot.sendMessage(
      msg.chat.id,
      `👤 <b>Your Profile & Active Configuration:</b>\n\n` +
      `📍 <b>Dark Store Pod:</b>\n` +
      `• <b>Primary Store ID</b>: <code>${pid}</code>\n` +
      `• <b>Secondary Store ID</b>: <code>${secid}</code>\n\n` +
      `🎯 <b>Worker Discount Alert Thresholds:</b>\n` +
      `• 🌾 <b>Daily Essentials & Fresh</b>: <b>≥ ${wd.essentials || 60}% OFF</b>\n` +
      `• 🍿 <b>Sweets, Snacks & Treats</b>: <b>≥ ${wd.treats || 70}% OFF</b>\n` +
      `• 🛍️ <b>Lifestyle & Home</b>: <b>≥ ${wd.lifestyle || 85}% OFF</b>\n` +
      `• 🥤 <b>Cold Drinks & Beverages</b>: <b>≥ ${wd.beverages || 70}% OFF</b>\n` +
      `• 🧴 <b>Personal Care & Laundry</b>: <b>≥ ${wd.personalCare || 70}% OFF</b>\n\n` +
      `💡 <i>To update dark store IDs, send <b>/store</b>. To change discount thresholds, send <b>/setdiscount</b>.</i>`,
      { parse_mode: 'HTML' }
    );
  });

  bot.onText(/\/noice/, (msg) => {
    const kh = config.campaigns?.keywordHunter || {};
    const eCut = kh.thresholds?.essentials || 65;
    const nCut = kh.thresholds?.nonEssentials || 75;
    bot.sendMessage(
      msg.chat.id,
      'ℹ️ <b>Keyword Deal Hunter (Hourly Automatic Scan):</b>\n\n' +
      'The NOICE scan has been upgraded to the more comprehensive <b>Keyword Deal Hunter</b>!\n\n' +
      `The bot automatically searches essential groceries (≥ <b>${eCut}% OFF</b>) and snacks & treats (≥ <b>${nCut}% OFF</b>) <b>every hour</b> (10:00 AM – 9:05 PM) across your dark store pod and alerts you immediately.\n\n` +
      '💡 <i>On-demand keyword scans are disabled to conserve API calls and avoid rate limits. Tap <b>/categories</b> to scan specific grocery departments on demand.</i>',
      { parse_mode: 'HTML' }
    );
  });

  // /categories command: Interactive inline keyboard for departments
  bot.onText(/\/categories/, (msg) => {
    const inline_keyboard = [];
    const keys = Object.keys(INSTAMART_CATEGORIES);
    for (let i = 0; i < keys.length; i += 2) {
      const row = [];
      const k1 = keys[i];
      const c1 = INSTAMART_CATEGORIES[k1];
      row.push({ text: `${c1.icon} ${c1.name}`, callback_data: `cat:${k1}` });

      if (i + 1 < keys.length) {
        const k2 = keys[i + 1];
        const c2 = INSTAMART_CATEGORIES[k2];
        row.push({ text: `${c2.icon} ${c2.name}`, callback_data: `cat:${k2}` });
      }
      inline_keyboard.push(row);
    }

    bot.sendMessage(
      msg.chat.id,
      '🛒 <b>Instamart Category Deals:</b>\n\n' +
      'Choose any category below to scan all its subcategories for deals with <b>≥ 50% OFF</b>:',
      {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard }
      }
    );
  });

  // Handle button clicks (categories and discount presets)
  bot.on('callback_query', async (query) => {
    const data = query.data || '';

    // Handle discount quick preset buttons (legacy / quick set)
    if (data.startsWith('discount:')) {
      const discountVal = parseInt(data.split(':')[1], 10);
      if (discountVal >= 5 && discountVal <= 95) {
        const newDiscounts = {
          essentials: discountVal,
          treats: discountVal,
          lifestyle: discountVal,
          beverages: discountVal,
          personalCare: discountVal
        };
        updateUser(query.message.chat.id, { minDiscount: discountVal, workerDiscounts: newDiscounts });
        await bot.answerCallbackQuery(query.id, { text: `Threshold updated to ${discountVal}% OFF!` });
        return bot.editMessageText(
          `✅ Your alert threshold for all workers has been updated to <b>${discountVal}% OFF</b>.`,
          {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            parse_mode: 'HTML'
          }
        ).catch(() => {});
      }
    }

    // Handle worker selection for discount customization
    if (data.startsWith('selworker:')) {
      const target = data.split(':')[1];
      const user = getUser(query.message.chat.id, storeConfig);

      if (target === 'back') {
        await bot.answerCallbackQuery(query.id);
        return bot.editMessageText(getWorkerDiscountOverviewText(user), {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id,
          parse_mode: 'HTML',
          reply_markup: buildWorkerDiscountKeyboard(user)
        }).catch(() => {});
      }

      if (target === 'all') {
        await bot.answerCallbackQuery(query.id);
        return bot.editMessageText(
          `🌐 <b>Set Global Threshold for All 5 Workers</b>\n\n` +
          `Choose a discount percentage to apply across all workers:`,
          {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            parse_mode: 'HTML',
            reply_markup: buildThresholdKeyboard('all')
          }
        ).catch(() => {});
      }

      const w = WORKERS.find((x) => x.key === target);
      if (w) {
        const cur = (user.workerDiscounts && user.workerDiscounts[target]) || w.defaultDiscount;
        await bot.answerCallbackQuery(query.id);
        return bot.editMessageText(
          `${w.tag} <b>Set Threshold for ${w.name}</b>\n\n` +
          `Current threshold: <b>≥ ${cur}% OFF</b>\n\n` +
          `Select a new alert threshold percentage:`,
          {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            parse_mode: 'HTML',
            reply_markup: buildThresholdKeyboard(target)
          }
        ).catch(() => {});
      }
    }

    // Handle worker discount value updates
    if (data.startsWith('setwdisc:')) {
      const parts = data.split(':');
      const targetWorker = parts[1];
      const discountVal = parseInt(parts[2], 10);

      if (discountVal >= 5 && discountVal <= 95) {
        if (targetWorker === 'all') {
          const newDiscounts = {
            essentials: discountVal,
            treats: discountVal,
            lifestyle: discountVal,
            beverages: discountVal,
            personalCare: discountVal
          };
          updateUser(query.message.chat.id, {
            minDiscount: discountVal,
            workerDiscounts: newDiscounts
          });
          await bot.answerCallbackQuery(query.id, { text: `All workers set to ≥ ${discountVal}% OFF!` });
          return bot.editMessageText(
            `✅ <b>All 5 Workers updated to ≥ ${discountVal}% OFF!</b>`,
            {
              chat_id: query.message.chat.id,
              message_id: query.message.message_id,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [[{ text: '🔙 Back to Worker List', callback_data: 'selworker:back' }]]
              }
            }
          ).catch(() => {});
        } else {
          const w = WORKERS.find((x) => x.key === targetWorker);
          const wName = w ? `${w.tag} ${w.name}` : targetWorker;
          updateUser(query.message.chat.id, {
            workerDiscounts: { [targetWorker]: discountVal }
          });
          await bot.answerCallbackQuery(query.id, { text: `${w ? w.name : targetWorker} set to ≥ ${discountVal}% OFF!` });
          return bot.editMessageText(
            `✅ <b>${wName}</b> alert threshold updated to <b>≥ ${discountVal}% OFF</b>.`,
            {
              chat_id: query.message.chat.id,
              message_id: query.message.message_id,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [[{ text: '🔙 Back to Worker List', callback_data: 'selworker:back' }]]
              }
            }
          ).catch(() => {});
        }
      }
    }

    if (!data.startsWith('cat:')) return;

    const catKey = data.split(':')[1];
    const catObj = INSTAMART_CATEGORIES[catKey];
    if (!catObj) {
      return bot.answerCallbackQuery(query.id, { text: 'Category not found' });
    }

    await bot.answerCallbackQuery(query.id, { text: `Scanning ${catObj.name}…` });

    const chatId = query.message.chat.id;
    const user = getUser(chatId, storeConfig);
    const userStore = { sid: user.storeId, pid: user.primaryStoreId, secid: user.secondaryStoreId };
    const cutoff = 50; // User requirement: >= 50% off for categories

    const statusMsg = await bot.sendMessage(
      chatId,
      `🔄 <b>Preparing scan for ${catObj.icon} ${catObj.name}…</b>\n<i>Connecting to warehouse pod ${userStore.sid}…</i>`,
      { parse_mode: 'HTML' }
    );

    let lastEditTime = Date.now();
    const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

    const onProgress = async (current, total, subName) => {
      const now = Date.now();
      if (now - lastEditTime > 1400 || current === total) {
        lastEditTime = now;
        const spinner = spinnerFrames[current % spinnerFrames.length];
        const progressText =
          `🔄 <b>Scanning ${catObj.icon} ${catObj.name}</b>\n` +
          `${spinner} [${current}/${total}] <i>${escapeHtml(subName)}</i>…`;
        await bot.editMessageText(progressText, {
          chat_id: chatId,
          message_id: statusMsg.message_id,
          parse_mode: 'HTML'
        }).catch(() => {});
      }
    };

    try {
      const items = await fetchCategoryDeals(catKey, userStore, onProgress);
      const deals = items.filter((item) => item.discount >= cutoff);

      if (deals.length > 0) {
        await bot.editMessageText(
          `✅ <b>Found ${deals.length} deals ≥ ${cutoff}% OFF in ${catObj.icon} ${catObj.name}!</b>`,
          { chat_id: chatId, message_id: statusMsg.message_id, parse_mode: 'HTML' }
        ).catch(() => {});

        const formattedDeals = deals.map((d) => ({
          ...d,
          alertType: 'NEW_DEAL',
          campaignKey: `category:${catKey}`,
          categoryTitle: `${catObj.icon} ${catObj.name}`
        }));

        await sendBatchAlerts(bot, chatId, formattedDeals);
      } else {
        await bot.editMessageText(
          `ℹ️ <b>${catObj.icon} ${catObj.name}</b>\nScanned all subcategories. No items found above <b>${cutoff}% OFF</b> right now.`,
          { chat_id: chatId, message_id: statusMsg.message_id, parse_mode: 'HTML' }
        ).catch(() => {});
      }
    } catch (err) {
      console.error(`[CategoryScan] Error scanning ${catKey}:`, err);
      bot.editMessageText(
        `❌ Error scanning ${catObj.name}: ${err.message}`,
        { chat_id: chatId, message_id: statusMsg.message_id }
      ).catch(() => {});
    }
  });

  bot.onText(/\/(?:bazaar)(?:@\w+)?/i, (msg) => {
    bot.sendMessage(msg.chat.id, '🔍 Scanning <b>Wednesday Bazaar Top Deals</b> across all pages… please wait ~10-15s.', { parse_mode: 'HTML' });
    runWednesdayBazaarScan(msg.chat.id);
  });

  bot.onText(/^\/setdiscount(?:@\w+)?(?:\s+(\w+))?(?:\s+(\d+))?/i, (msg, match) => {
    const arg1 = match[1];
    const arg2 = match[2];
    const user = getUser(msg.chat.id, storeConfig);

    // Case 1: No arguments -> Show interactive worker selection menu
    if (!arg1) {
      return bot.sendMessage(
        msg.chat.id,
        getWorkerDiscountOverviewText(user),
        {
          parse_mode: 'HTML',
          reply_markup: buildWorkerDiscountKeyboard(user)
        }
      );
    }

    // Case 2: Only 1 argument and it's a number (e.g. /setdiscount 60) -> Set all workers
    if (!arg2 && /^\d+$/.test(arg1)) {
      const val = parseInt(arg1, 10);
      if (val >= 5 && val <= 95) {
        const newDiscounts = {
          essentials: val,
          treats: val,
          lifestyle: val,
          beverages: val,
          personalCare: val
        };
        updateUser(msg.chat.id, { minDiscount: val, workerDiscounts: newDiscounts });
        return bot.sendMessage(
          msg.chat.id,
          `✅ Alert threshold for <b>all 5 workers</b> updated to <b>≥ ${val}% OFF</b>.`,
          { parse_mode: 'HTML' }
        );
      } else {
        return bot.sendMessage(msg.chat.id, '❌ Please enter a percentage between 5 and 95 (e.g. <code>/setdiscount 60</code>).', { parse_mode: 'HTML' });
      }
    }

    // Case 3: Worker identifier + percentage (e.g. /setdiscount essentials 65)
    const workerKey = resolveWorkerKey(arg1);
    const val = parseInt(arg2, 10);

    if (!workerKey) {
      return bot.sendMessage(
        msg.chat.id,
        `❌ Unknown worker <b>"${escapeHtml(arg1)}"</b>.\n\n` +
        `Valid options: <code>essentials</code>, <code>treats</code>, <code>lifestyle</code>, <code>beverages</code>, <code>personal</code>, or <code>all</code>.\n` +
        `<i>Example</i>: <code>/setdiscount essentials 65</code>`,
        { parse_mode: 'HTML' }
      );
    }

    if (isNaN(val) || val < 5 || val > 95) {
      return bot.sendMessage(
        msg.chat.id,
        `❌ Please specify a valid discount percentage between 5 and 95.\n<i>Example</i>: <code>/setdiscount ${arg1} 60</code>`,
        { parse_mode: 'HTML' }
      );
    }

    if (workerKey === 'all') {
      const newDiscounts = {
        essentials: val,
        treats: val,
        lifestyle: val,
        beverages: val,
        personalCare: val
      };
      updateUser(msg.chat.id, { minDiscount: val, workerDiscounts: newDiscounts });
      return bot.sendMessage(
        msg.chat.id,
        `✅ Alert threshold for <b>all 5 workers</b> updated to <b>≥ ${val}% OFF</b>.`,
        { parse_mode: 'HTML' }
      );
    }

    const w = WORKERS.find((x) => x.key === workerKey);
    const wName = w ? `${w.tag} ${w.name}` : workerKey;
    updateUser(msg.chat.id, { workerDiscounts: { [workerKey]: val } });
    return bot.sendMessage(
      msg.chat.id,
      `✅ Alert threshold for <b>${wName}</b> updated to <b>≥ ${val}% OFF</b>.`,
      { parse_mode: 'HTML' }
    );
  });

  bot.onText(/^\/status(?:@\w+)?/i, (msg) => {
    const cache = loadCache();
    const user = getUser(msg.chat.id, storeConfig);
    const pid = user.primaryStoreId || user.storeId || storeConfig.pid || 'Not set';
    const secid = user.secondaryStoreId || storeConfig.secid || 'None';
    const wd = user.workerDiscounts || {};
    const khRun = (cache.lastRuns?.keywordHunter || cache.lastRuns?.noice)
      ? new Date((cache.lastRuns?.keywordHunter || cache.lastRuns?.noice).timestamp).toLocaleString('en-IN')
      : 'Never';
    const bazaarRun = cache.lastRuns?.wednesdayBazaar
      ? new Date(cache.lastRuns.wednesdayBazaar.timestamp).toLocaleString('en-IN')
      : 'Never';

    const statusText = 
`📊 <b>Bot Status & Schedules</b>:
• <b>Status</b>: 🟢 Online & Listening
• <b>Active Primary Store</b>: <code>${pid}</code>
• <b>Active Secondary Store</b>: <code>${secid}</code>

🎯 <b>Active Worker Thresholds</b>:
• 🌾 Essentials & Fresh: <b>≥ ${wd.essentials || 60}% OFF</b>
• 🍿 Sweets & Treats: <b>≥ ${wd.treats || 70}% OFF</b>
• 🛍️ Lifestyle & Home: <b>≥ ${wd.lifestyle || 85}% OFF</b>
• 🥤 Beverages & Spreads: <b>≥ ${wd.beverages || 70}% OFF</b>
• 🧴 Personal Care & Laundry: <b>≥ ${wd.personalCare || 70}% OFF</b>

📦 <b>Tracked Catalog & Last Runs</b>:
• <b>Total Tracked Items</b>: ${Object.keys(cache.items || {}).length}
• <b>Last Automated Hunter Run</b>: ${khRun}
• <b>Last Bazaar Scan</b>: ${bazaarRun}

⏰ <b>Automated Schedules</b>:
• <b>5-Worker Deals Hunter</b>: 10:00 AM – 10:00 PM IST (Hourly via GitHub Actions)
• <b>Wednesday Bazaar</b>: Every Wednesday at 12:02 AM IST`;

    bot.sendMessage(msg.chat.id, statusText, { parse_mode: 'HTML' });
  });
}
