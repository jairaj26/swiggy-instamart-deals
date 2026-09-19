require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const config = require('../config.json');
const { fetchEssentialAisleDeals, fetchWednesdayBazaarDeals, fetchNoiceDeals } = require('./swiggyApi');
const { findAlertWorthyDeals } = require('./dealTracker');
const { sendBatchAlerts } = require('./notifier');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const minDiscount = parseInt(process.env.MIN_DISCOUNT_PERCENT, 10) || config.minDiscount || 70;

const storeConfig = {
  sid: process.env.SWIGGY_STORE_ID || config.store.sid,
  pid: process.env.SWIGGY_PRIMARY_STORE_ID || config.store.pid,
  secid: process.env.SWIGGY_SECONDARY_STORE_ID || config.store.secid
};

// Parse command line arguments
const args = process.argv.slice(2);
let mode = 'auto';
let skipSync = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--skip-sync') {
    skipSync = true;
  } else if (!arg.startsWith('--')) {
    mode = arg.toLowerCase();
  }
}

/**
 * Top-of-hour synchronization:
 * If the runner woke up early (e.g. at minute 55-59 in IST),
 * calculate remaining milliseconds to :00:00 sharp and wait.
 */
async function syncToHourMark(skip = false) {
  if (skip) {
    console.log('[Sync] Top-of-hour synchronization skipped via --skip-sync.');
    return;
  }

  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(Date.now() + istOffsetMs);
  const mins = istNow.getUTCMinutes();
  const secs = istNow.getUTCSeconds();
  const ms = istNow.getUTCMilliseconds();

  if (mins >= 55 && mins <= 59) {
    const minsLeft = 60 - mins;
    const msToWait = (minsLeft * 60 * 1000) - (secs * 1000) - ms;
    if (msToWait > 0 && msToWait <= 5 * 60 * 1000) {
      console.log(`[Sync] Runner woke up early at ${mins}:${String(secs).padStart(2, '0')} IST.`);
      console.log(`[Sync] Waiting ${(msToWait / 1000).toFixed(1)}s until :00:00 IST sharp for fresh hourly deals...`);
      await sleep(msToWait);
      console.log('[Sync] Top of the hour reached (:00:00 IST)! Commencing deal scrape.');
    }
  } else {
    console.log(`[Sync] Running immediately (minute ${mins} is outside pre-hour window 55-59).`);
  }
}

async function runSubcategoryCampaign(campaignKey, campaignCfg, options = {}) {
  const { bot, chatId, storeConfig, threshold, timeString } = options;
  const name = campaignCfg.name || campaignKey;
  const tag = campaignCfg.tag || '';
  const headerName = tag ? `${tag} ${name}` : name;
  const subcategories = campaignCfg.subcategories || [];

  console.log(`\n--- Running ${name} (${subcategories.length} Subcategories) ---`);

  let items = [];
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      console.log(`[${campaignKey}] Attempt ${attempts}/${maxAttempts} - Fetching deals...`);
      items = await fetchEssentialAisleDeals(storeConfig, {
        subcategories,
        campaignName: name,
        dealType: campaignKey
      });

      if (items && items.length > 0) {
        console.log(`[${campaignKey}] Attempt ${attempts} succeeded: scraped ${items.length} items across ${subcategories.length} aisles.`);
        break;
      } else {
        console.warn(`[${campaignKey}] Attempt ${attempts} returned 0 items.`);
        if (attempts < maxAttempts) {
          console.log(`[${campaignKey}] Waiting 6s before retry ${attempts + 1}...`);
          await sleep(6000);
        }
      }
    } catch (e) {
      console.error(`[${campaignKey}] Attempt ${attempts} error:`, e.message);
      if (attempts < maxAttempts) {
        console.log(`[${campaignKey}] Waiting 6s before retry ${attempts + 1}...`);
        await sleep(6000);
      }
    }
  }

  if (items.length > 0) {
    const refreshCycle = campaignCfg.refreshCycle || 'daily';
    const weeklyResetDay = campaignCfg.weeklyResetDay !== undefined ? campaignCfg.weeklyResetDay : 1;
    const alerts = findAlertWorthyDeals(items, threshold, campaignKey, {
      refreshCycle,
      weeklyResetDay
    });
    console.log(`[${campaignKey}] Found ${alerts.length} alert-worthy deals (Discount ≥ ${threshold}% | Cycle: ${refreshCycle}).`);
    if (bot && chatId && alerts.length > 0) {
      await sendBatchAlerts(bot, chatId, alerts, {
        timeString,
        workerInfo: headerName
      });
    } else if (!alerts.length) {
      console.log(`[${campaignKey}] No items met the minimum discount threshold (${threshold}%) this run.`);
    }
  } else {
    console.error(`[${campaignKey}] All retry attempts failed or returned 0 items.`);
  }
}

async function main() {
  console.log(`[CronRunner] Mode: ${mode.toUpperCase()} | Store: ${storeConfig.sid}`);

  // Synchronize to :00:00 IST if runner booted early in pre-hour window
  await syncToHourMark(skipSync);

  let bot = null;
  if (token && token !== 'your_bot_token_here') {
    bot = new TelegramBot(token, { polling: false });
  } else {
    console.warn('[CronRunner] No TELEGRAM_BOT_TOKEN configured. Will scrape and cache without sending Telegram alerts.');
  }

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const istDay = istDate.getUTCDay(); // 3 = Wednesday
  const istHours = istDate.getUTCHours();
  const istMinutes = istDate.getUTCMinutes();

  console.log(`[CronRunner] Active IST Time: ${istDate.toUTCString()} (Day: ${istDay}, Hour: ${istHours}:${String(istMinutes).padStart(2, '0')})`);

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const timeString = timeFormatter.format(new Date()) + ' IST';

  let runEssentials = false;
  let runTreats = false;
  let runLifestyle = false;
  let runBazaar = false;
  let runNoice = false;

  if (mode === 'essentials' || mode === 'keywords' || mode === 'aisles') {
    runEssentials = true;
  } else if (mode === 'treats' || mode === 'snacks' || mode === 'sweets') {
    runTreats = true;
  } else if (mode === 'lifestyle' || mode === 'home' || mode === 'electronics') {
    runLifestyle = true;
  } else if (mode === 'bazaar') {
    runBazaar = true;
  } else if (mode === 'noice') {
    runNoice = true;
  } else {
    // Auto Mode:
    // Scheduled window: 10:00 AM to 10:00 PM IST OR 12:00 AM midnight IST
    const isWithinHours = (istHours === 0) || (istHours >= 10 && (istHours < 22 || (istHours === 22 && istMinutes <= 15)));
    if (isWithinHours) {
      runEssentials = true;
      runTreats = true;
      runLifestyle = true;
    }
  }

  // Wednesday midnight window (12:00 AM - 12:30 AM IST on Wednesday)
  if (istDay === 3 && istHours === 0 && (mode === 'bazaar' || mode === 'essentials' || mode === 'auto')) {
    runBazaar = true;
  }

  const campaigns = config.campaigns || {};

  // 1. Worker 1: Daily Essentials & Fresh
  if (runEssentials) {
    const cfg = campaigns.essentials || campaigns.essentialAisles || {};
    const threshold = parseInt(process.env.ESSENTIALS_MIN_DISCOUNT, 10) || cfg.minDiscount || parseInt(process.env.MIN_DISCOUNT_PERCENT, 10) || config.minDiscount || 60;
    await runSubcategoryCampaign('essentials', cfg, {
      bot,
      chatId,
      storeConfig,
      threshold,
      timeString
    });
  }

  // 2. Worker 2: Sweets, Snacks & Treats
  if (runTreats) {
    const cfg = campaigns.treats || {};
    const threshold = parseInt(process.env.TREATS_MIN_DISCOUNT, 10) || cfg.minDiscount || parseInt(process.env.MIN_DISCOUNT_PERCENT, 10) || config.minDiscount || 70;
    await runSubcategoryCampaign('treats', cfg, {
      bot,
      chatId,
      storeConfig,
      threshold,
      timeString
    });
  }

  // 3. Worker 3: Lifestyle, Home & Electronics
  if (runLifestyle) {
    const cfg = campaigns.lifestyle || {};
    const threshold = parseInt(process.env.LIFESTYLE_MIN_DISCOUNT, 10) || cfg.minDiscount || parseInt(process.env.MIN_DISCOUNT_PERCENT, 10) || config.minDiscount || 85;
    await runSubcategoryCampaign('lifestyle', cfg, {
      bot,
      chatId,
      storeConfig,
      threshold,
      timeString
    });
  }

  // 4. Wednesday Bazaar
  if (runBazaar) {
    console.log('\n--- Running Wednesday Bazaar Scan ---');
    try {
      const items = await fetchWednesdayBazaarDeals(storeConfig);
      console.log(`[Bazaar] Scraped ${items.length} items.`);
      const alerts = findAlertWorthyDeals(items, minDiscount, 'wednesdayBazaar', {
        refreshCycle: 'weekly',
        weeklyResetDay: 3
      });
      console.log(`[Bazaar] Found ${alerts.length} new/improved deals >= ${minDiscount}%.`);
      if (bot && chatId && alerts.length > 0) {
        await sendBatchAlerts(bot, chatId, alerts, { timeString, workerInfo: '🎉 Wednesday Bazaar' });
      }
    } catch (e) {
      console.error('[Bazaar] Error:', e.message);
    }
  }

  // 5. The NOICE Store Scan
  if (runNoice) {
    console.log('\n--- Running The NOICE Store Scan ---');
    const cfg = campaigns.noice || {};
    const noiceThreshold = parseInt(process.env.NOICE_MIN_DISCOUNT, 10) || cfg.minDiscount || minDiscount || 50;
    try {
      const items = await fetchNoiceDeals(storeConfig);
      console.log(`[NOICE] Scraped ${items.length} items.`);
      const alerts = findAlertWorthyDeals(items, noiceThreshold, 'noice', {
        refreshCycle: cfg.refreshCycle || 'weekly',
        weeklyResetDay: cfg.weeklyResetDay !== undefined ? cfg.weeklyResetDay : 1
      });
      console.log(`[NOICE] Found ${alerts.length} new/improved deals >= ${noiceThreshold}%.`);
      if (bot && chatId && alerts.length > 0) {
        await sendBatchAlerts(bot, chatId, alerts, { timeString, workerInfo: '✨ The NOICE Store' });
      }
    } catch (e) {
      console.error('[NOICE] Error:', e.message);
    }
  }

  console.log('\n[CronRunner] Execution finished successfully.');
}

main().catch((err) => {
  console.error('[CronRunner] Fatal error:', err);
  process.exit(1);
});
