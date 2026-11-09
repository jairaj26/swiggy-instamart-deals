require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const config = require('../config.json');
const { loadCache } = require('./dealTracker');
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
console.log('⚡ Instamart Telegram Deal Alert Bot (9 Parallel Workers)');
console.log(`📍 Store ID: ${storeConfig.sid} (Primary: ${storeConfig.pid}, Secondary: ${storeConfig.secid})`);
console.log('🎯 Minimum Alert Discounts: W1 Fresh ≥60%, W2 Grocery ≥60%, W3 Treats ≥70%, W4 Munchies ≥70%, W5 Beverages ≥70%, W6 Personal Care ≥70%, W7 Lifestyle ≥85%, W8 Household ≥70%, W9 Clearance ≥89%');
console.log('====================================================');

let bot = null;
if (token && token !== 'your_bot_token_here') {
  bot = new TelegramBot(token, { polling: true });
  console.log('🤖 Telegram Bot is connected and listening for commands!');

  // Register commands for the Telegram Menu button
  bot.setMyCommands([
    { command: 'start', description: 'Show welcome message & commands' },
    { command: 'store', description: 'View or set Swiggy Dark Store IDs' },
    { command: 'setdiscount', description: 'Set discount % for each of the 9 workers' },
    { command: 'brands', description: 'View brand-specific discount thresholds' },
    { command: 'myinfo', description: 'View your profile & active store' },
    { command: 'status', description: 'Check bot status & scan stats' }
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

I monitor <b>379 Dark Store Aisles & 73 Search Keywords</b> across <b>9 Parallel Workers</b> every half-hour (9:01 AM – 12:01 AM IST) to find you the highest discounts!

📍 <b>Dark Store Configuration:</b>
• <code>/store</code> — View your current store or get instructions on how to find your Dark Store IDs
• <code>/store &lt;primaryId&gt; [secondaryId]</code> — Link your exact Swiggy warehouse pod IDs
• <code>/myinfo</code> — View your active store IDs and all 9 worker discount thresholds

🎯 <b>Deal Hunter Workers & Default Thresholds:</b>
• 🥦 <b>Worker 1 (Fresh Produce & Meats)</b> — Fresh Vegetables, Fruits, Seafood, Mutton (≥ 60% OFF)
• 🌾 <b>Worker 2 (Staples & Groceries)</b> — Atta, Rice, Dal, Oils, Ghee, Masalas (≥ 60% OFF)
• 🍫 <b>Worker 3 (Sweets & Chocolates)</b> — Sweets, Chocolates, Ice Cream, Cakes (≥ 70% OFF)
• 🍿 <b>Worker 4 (Snacks & Munchies)</b> — Chips, Namkeens, Noodles, Pasta, Dry Fruits (≥ 70% OFF)
• 🥤 <b>Worker 5 (Beverages & Spreads)</b> — Cold Drinks, Juices, Tea, Coffee, Spreads (≥ 70% OFF)
• 🧴 <b>Worker 6 (Personal Care & Bath)</b> — Soaps, Skincare, Haircare, Oral Care (≥ 70% OFF)
• 🛍️ <b>Worker 7 (Baby Care & Lifestyle)</b> — Diapers, Baby Food, Wet Wipes (≥ 85% OFF)
• 🧹 <b>Worker 8 (Cleaning, Home & Tech)</b> — Detergents, Cleaners, Kitchen, Electronics (≥ 70% OFF)
• 🏷️ <b>Worker 9 (Clearance Specials)</b> — Toys, Stationery, Fashion, Utensils (≥ 89% OFF)

⚙️ <b>Settings & Status:</b>
• <code>/setdiscount</code> — Change discount threshold for any specific worker (or all together)
• <code>/brands</code> — View brand-specific second-layer discount thresholds
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
      `Automated 9-worker interval scans will now pull catalogs directly from this warehouse pod!`,
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
    { key: 'fresh', name: 'Daily Fresh Produce & Meats', tag: '🥦', defaultDiscount: 60 },
    { key: 'grocery', name: 'Daily Staples & Cooking Essentials', tag: '🌾', defaultDiscount: 60 },
    { key: 'treats', name: 'Sweets, Chocolates & Bakery', tag: '🍫', defaultDiscount: 70 },
    { key: 'munchies', name: 'Snacks, Munchies & Instant Foods', tag: '🍿', defaultDiscount: 70 },
    { key: 'beverages', name: 'Cold Drinks, Nutrition & Spreads', tag: '🥤', defaultDiscount: 70 },
    { key: 'personalCare', name: 'Personal Care, Bath & Skincare', tag: '🧴', defaultDiscount: 70 },
    { key: 'lifestyle', name: 'Baby Care & Lifestyle', tag: '🛍️', defaultDiscount: 85 },
    { key: 'household', name: 'Cleaning, Home & Electronics', tag: '🧹', defaultDiscount: 70 },
    { key: 'clearance', name: 'Clearance Specials: Fashion, Toys & Baby', tag: '🏷️', defaultDiscount: 89 }
  ];

  function getWorkerDiscountOverviewText(user) {
    const wd = user.workerDiscounts || {};
    return (
      `🎯 <b>Worker Discount Alert Thresholds</b>\n\n` +
      `Choose a worker below to adjust its alert threshold, or send:\n` +
      `<code>/setdiscount &lt;worker&gt; &lt;percentage&gt;</code>\n` +
      `<i>Example</i>: <code>/setdiscount fresh 65</code>\n\n` +
      `• 🥦 <b>Fresh Produce & Meats</b>: <b>≥ ${wd.fresh || 60}% OFF</b>\n` +
      `• 🌾 <b>Staples & Groceries</b>: <b>≥ ${wd.grocery || 60}% OFF</b>\n` +
      `• 🍫 <b>Sweets & Chocolates</b>: <b>≥ ${wd.treats || 70}% OFF</b>\n` +
      `• 🍿 <b>Snacks & Munchies</b>: <b>≥ ${wd.munchies || 70}% OFF</b>\n` +
      `• 🥤 <b>Cold Drinks & Beverages</b>: <b>≥ ${wd.beverages || 70}% OFF</b>\n` +
      `• 🧴 <b>Personal Care & Bath</b>: <b>≥ ${wd.personalCare || 70}% OFF</b>\n` +
      `• 🛍️ <b>Baby Care & Lifestyle</b>: <b>≥ ${wd.lifestyle || 85}% OFF</b>\n` +
      `• 🧹 <b>Cleaning & Tech</b>: <b>≥ ${wd.household || 70}% OFF</b>\n` +
      `• 🏷️ <b>Clearance Specials</b>: <b>≥ ${wd.clearance || 89}% OFF</b>\n\n` +
      `<i>Tap a worker button below to customize:</i>`
    );
  }

  function buildWorkerDiscountKeyboard(user) {
    const wd = user.workerDiscounts || {};
    return {
      inline_keyboard: [
        [
          { text: `🥦 Fresh (${wd.fresh || 60}%)`, callback_data: 'selworker:fresh' },
          { text: `🌾 Grocery (${wd.grocery || 60}%)`, callback_data: 'selworker:grocery' }
        ],
        [
          { text: `🍫 Treats (${wd.treats || 70}%)`, callback_data: 'selworker:treats' },
          { text: `🍿 Munchies (${wd.munchies || 70}%)`, callback_data: 'selworker:munchies' }
        ],
        [
          { text: `🥤 Beverages (${wd.beverages || 70}%)`, callback_data: 'selworker:beverages' },
          { text: `🧴 Personal (${wd.personalCare || 70}%)`, callback_data: 'selworker:personalCare' }
        ],
        [
          { text: `🛍️ Lifestyle (${wd.lifestyle || 85}%)`, callback_data: 'selworker:lifestyle' },
          { text: `🧹 Household (${wd.household || 70}%)`, callback_data: 'selworker:household' }
        ],
        [
          { text: `🏷️ Clearance (${wd.clearance || 89}%)`, callback_data: 'selworker:clearance' },
          { text: '🌐 Set All Together', callback_data: 'selworker:all' }
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
    if (['fresh', 'produce', 'vegetables', 'fruits', 'meat', 'w1', 'worker1', '1'].includes(s)) return 'fresh';
    if (['grocery', 'staples', 'atta', 'rice', 'dal', 'oils', 'w2', 'worker2', '2'].includes(s)) return 'grocery';
    if (['treats', 'treat', 'sweets', 'chocolates', 'bakery', 'w3', 'worker3', '3'].includes(s)) return 'treats';
    if (['munchies', 'munchie', 'snacks', 'snack', 'chips', 'noodles', 'w4', 'worker4', '4'].includes(s)) return 'munchies';
    if (['beverages', 'beverage', 'drinks', 'drink', 'juices', 'tea', 'coffee', 'w5', 'worker5', '5'].includes(s)) return 'beverages';
    if (['personal', 'personalcare', 'bath', 'hair', 'skincare', 'w6', 'worker6', '6'].includes(s)) return 'personalCare';
    if (['lifestyle', 'life', 'baby', 'home', 'kitchen', 'fashion', 'w7', 'worker7', '7'].includes(s)) return 'lifestyle';
    if (['household', 'cleaning', 'electronics', 'tech', 'w8', 'worker8', '8'].includes(s)) return 'household';
    if (['clearance', 'clear', 'deals', 'special', 'toys', 'w9', 'worker9', '9'].includes(s)) return 'clearance';
    if (['essentials', 'essential'].includes(s)) return 'fresh';
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
      `• 🥦 <b>Fresh Produce & Meats</b>: <b>≥ ${wd.fresh || 60}% OFF</b>\n` +
      `• 🌾 <b>Staples & Groceries</b>: <b>≥ ${wd.grocery || 60}% OFF</b>\n` +
      `• 🍫 <b>Sweets & Chocolates</b>: <b>≥ ${wd.treats || 70}% OFF</b>\n` +
      `• 🍿 <b>Snacks & Munchies</b>: <b>≥ ${wd.munchies || 70}% OFF</b>\n` +
      `• 🥤 <b>Cold Drinks & Beverages</b>: <b>≥ ${wd.beverages || 70}% OFF</b>\n` +
      `• 🧴 <b>Personal Care & Bath</b>: <b>≥ ${wd.personalCare || 70}% OFF</b>\n` +
      `• 🛍️ <b>Baby Care & Lifestyle</b>: <b>≥ ${wd.lifestyle || 85}% OFF</b>\n` +
      `• 🧹 <b>Home & Cleaning</b>: <b>≥ ${wd.household || 70}% OFF</b>\n` +
      `• 🏷️ <b>Special Deals & Clearance</b>: <b>≥ ${wd.clearance || 89}% OFF</b>\n\n` +
      `🏷️ <b>Brand-Specific Second-Layer Thresholds:</b>\n` +
      `• Send <code>/brands</code> to view brand discount thresholds (75% – 95% OFF)\n\n` +
      `💡 <i>To update dark store IDs, send <b>/store</b>. To change discount thresholds, send <b>/setdiscount</b>.</i>`,
      { parse_mode: 'HTML' }
    );
  });

  bot.onText(/^\/brands(?:@\w+)?/i, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      `🏷️ <b>Brand-Specific Second-Layer Thresholds:</b>\n\n` +
      `Items passing the worker threshold must also pass these brand thresholds before alerting:\n\n` +
      `🔥 <b>≥ 95% OFF:</b>\n` +
      `• Dubstep, You Bella, MEENAZ Resam, I Jewels, Palmonas, NVR, Zeneme, Minutiae, HINDCRAFT, Toyshine, DesiDiya\n\n` +
      `⚡ <b>≥ 90% OFF:</b>\n` +
      `• HAMMER, boAt, Portronics, Noise, JASHN, Clazkit, Festivora, BSB, Bersache, Nu Republic, truke, Tecsox, Lifelong, Story@Home, Metro Living\n\n` +
      `✨ <b>≥ 85% OFF:</b>\n` +
      `• HOME ESSENTIALS, DREAM WEAVERZ, Gizga, EVM, Fendo, Home Centre, Home Stop, Furnofy, Birch & Co., Tupperware, Ekta, Party Propz, Crompton, Anwaliya, PrettyKrafts, Soham, Ambrane, Sheen, Tizum, Orient Electric, Dynore, Jaypee, TrustBasket, Home Truths, The Man Company, KYARI, GOBOULT (Boult), Festive Greetings, Festive Delight, Hashwow, Homebasic, Capsicum (Brand), ANT (Ant Esports), Cult (Cultsport)\n\n` +
      `🎯 <b>≥ 80% OFF:</b>\n` +
      `• Philips (Bulbs only), Bajaj (Bulbs only), Dr Trust (Dr Physio), Nutripro, Oye Happy, Raymond, Del Monte, Amayu\n\n` +
      `🌾 <b>≥ 75% OFF:</b>\n` +
      `• Supreme Harvest, Wedel, Ella Foods, Jivo, Borges, Hathi\n\n` +
      `🍚 <b>≥ 70% OFF:</b>\n` +
      `• 921\n\n` +
      `<i>💡 Note: Philips and Bajaj appliances (Mixers, Irons, etc.) use standard worker threshold. All other brands only need to pass the standard worker discount threshold.</i>`,
      { parse_mode: 'HTML' }
    );
  });

  // Deprecated manual fetch commands: Provide informative message
  bot.onText(/\/(?:categories|bazaar|noice)(?:@\w+)?/i, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      'ℹ️ <b>Manual fetching is disabled.</b>\n\n' +
      'Deals across all <b>379 aisles</b> are monitored automatically every 30 minutes (09:00 AM – 12:00 AM IST) across 9 parallel workers.\n\n' +
      '• Use <code>/setdiscount</code> to configure alert thresholds for each worker.\n' +
      '• Use <code>/store</code> to check or update your Dark Store IDs.\n' +
      '• Use <code>/status</code> to check active settings.',
      { parse_mode: 'HTML' }
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
          fresh: discountVal,
          grocery: discountVal,
          treats: discountVal,
          munchies: discountVal,
          beverages: discountVal,
          personalCare: discountVal,
          lifestyle: discountVal,
          household: discountVal,
          clearance: discountVal,
          essentials: discountVal
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
          `🌐 <b>Set Global Threshold for All 9 Workers</b>\n\n` +
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
            fresh: discountVal,
            grocery: discountVal,
            treats: discountVal,
            munchies: discountVal,
            beverages: discountVal,
            personalCare: discountVal,
            lifestyle: discountVal,
            household: discountVal,
            clearance: discountVal,
            essentials: discountVal
          };
          updateUser(query.message.chat.id, {
            minDiscount: discountVal,
            workerDiscounts: newDiscounts
          });
          await bot.answerCallbackQuery(query.id, { text: `All workers set to ≥ ${discountVal}% OFF!` });
          return bot.editMessageText(
            `✅ <b>All 9 Workers updated to ≥ ${discountVal}% OFF!</b>`,
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
          fresh: val,
          grocery: val,
          treats: val,
          munchies: val,
          beverages: val,
          personalCare: val,
          lifestyle: val,
          household: val,
          clearance: val,
          essentials: val
        };
        updateUser(msg.chat.id, { minDiscount: val, workerDiscounts: newDiscounts });
        return bot.sendMessage(
          msg.chat.id,
          `✅ Alert threshold for <b>all 9 workers</b> updated to <b>≥ ${val}% OFF</b>.`,
          { parse_mode: 'HTML' }
        );
      } else {
        return bot.sendMessage(msg.chat.id, '❌ Please enter a percentage between 5 and 95 (e.g. <code>/setdiscount 60</code>).', { parse_mode: 'HTML' });
      }
    }

    // Case 3: Worker identifier + percentage (e.g. /setdiscount fresh 65)
    const workerKey = resolveWorkerKey(arg1);
    const val = parseInt(arg2, 10);

    if (!workerKey) {
      return bot.sendMessage(
        msg.chat.id,
        `❌ Unknown worker <b>"${escapeHtml(arg1)}"</b>.\n\n` +
        `Valid options: <code>fresh</code>, <code>grocery</code>, <code>treats</code>, <code>munchies</code>, <code>beverages</code>, <code>personal</code>, <code>lifestyle</code>, <code>household</code>, <code>clearance</code>, or <code>all</code>.\n` +
        `<i>Example</i>: <code>/setdiscount fresh 65</code>`,
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
        fresh: val,
        grocery: val,
        treats: val,
        munchies: val,
        beverages: val,
        personalCare: val,
        lifestyle: val,
        household: val,
        clearance: val,
        essentials: val
      };
      updateUser(msg.chat.id, { minDiscount: val, workerDiscounts: newDiscounts });
      return bot.sendMessage(
        msg.chat.id,
        `✅ Alert threshold for <b>all 9 workers</b> updated to <b>≥ ${val}% OFF</b>.`,
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
    const workerKeys = ['fresh', 'grocery', 'treats', 'munchies', 'beverages', 'personalCare', 'lifestyle', 'household', 'clearance'];
    let totalItems = 0;
    let latestRunTimestamp = 0;

    for (const key of workerKeys) {
      const c = loadCache(key);
      totalItems += Object.keys(c.items || {}).length;
      for (const run of Object.values(c.lastRuns || {})) {
        if (run && run.timestamp) {
          const t = new Date(run.timestamp).getTime();
          if (t > latestRunTimestamp) latestRunTimestamp = t;
        }
      }
    }

    const user = getUser(msg.chat.id, storeConfig);
    const pid = user.primaryStoreId || user.storeId || storeConfig.pid || 'Not set';
    const secid = user.secondaryStoreId || storeConfig.secid || 'None';
    const wd = user.workerDiscounts || {};
    const khRun = latestRunTimestamp > 0
      ? new Date(latestRunTimestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      : 'Never';

    const statusText = 
`📊 <b>Bot Status & Schedules</b>:
• <b>Status</b>: 🟢 Online & Listening
• <b>Active Primary Store</b>: <code>${pid}</code>
• <b>Active Secondary Store</b>: <code>${secid}</code>

🎯 <b>Active Worker Thresholds</b>:
• 🥦 Fresh Produce & Meats: <b>≥ ${wd.fresh || 60}% OFF</b>
• 🌾 Staples & Groceries: <b>≥ ${wd.grocery || 60}% OFF</b>
• 🍫 Sweets & Chocolates: <b>≥ ${wd.treats || 70}% OFF</b>
• 🍿 Snacks & Munchies: <b>≥ ${wd.munchies || 70}% OFF</b>
• 🥤 Cold Drinks & Beverages: <b>≥ ${wd.beverages || 70}% OFF</b>
• 🧴 Personal Care & Bath: <b>≥ ${wd.personalCare || 70}% OFF</b>
• 🛍️ Baby Care & Lifestyle: <b>≥ ${wd.lifestyle || 85}% OFF</b>
• 🧹 Home & Cleaning: <b>≥ ${wd.household || 70}% OFF</b>
• 🏷️ Special Deals & Clearance: <b>≥ ${wd.clearance || 89}% OFF</b>

📦 <b>Tracked Catalog & Last Runs</b>:
• <b>Total Tracked Items</b>: ${totalItems}
• <b>Last Automated Hunter Run</b>: ${khRun}

⏰ <b>Automated Schedules</b>:
• <b>9-Worker Deals Hunter</b>: 09:00 AM – 12:00 AM IST (Half-hourly via GitHub Actions)`;

    bot.sendMessage(msg.chat.id, statusText, { parse_mode: 'HTML' });
  });
}
