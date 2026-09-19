const fs = require('fs');
const path = require('path');

function getCacheFilePath(campaignKey = 'default') {
  return path.join(__dirname, '..', 'data', `deals_cache_${campaignKey}.json`);
}

function ensureDataDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadCache(campaignKey = 'default') {
  const filePath = getCacheFilePath(campaignKey);
  ensureDataDir(filePath);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn(`[DealTracker] Could not load cache for ${campaignKey}, starting fresh:`, e.message);
  }
  return {
    lastDate: null,
    lastRunId: null,
    lastRunHour: null,
    lastCycleId: null,
    items: {},
    lastRuns: {}
  };
}

function saveCache(cache, campaignKey = 'default') {
  const filePath = getCacheFilePath(campaignKey);
  ensureDataDir(filePath);
  try {
    fs.writeFileSync(filePath, JSON.stringify(cache, null, 2), 'utf8');
  } catch (e) {
    console.error(`[DealTracker] Error saving cache for ${campaignKey}:`, e.message);
  }
}

function getIstWeekStart(istDate, resetDay = 1) {
  const day = istDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diffDays = (day - resetDay + 7) % 7;
  const start = new Date(istDate.getTime() - diffDays * 24 * 60 * 60 * 1000);
  return start.toISOString().slice(0, 10);
}

function getIstContext(overrideDate = null, overrideHour = null, refreshCycle = 'daily', resetDay = 1) {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  let istDate;
  if (overrideDate) {
    const h = overrideHour !== null ? String(overrideHour).padStart(2, '0') : '00';
    istDate = new Date(`${overrideDate}T${h}:00:00.000Z`);
  } else {
    istDate = new Date(now.getTime() + istOffset);
  }
  const dateStr = overrideDate || istDate.toISOString().slice(0, 10); // "YYYY-MM-DD"
  const hour = overrideHour !== null ? overrideHour : istDate.getUTCHours(); // 0 to 23
  const runId = `${dateStr}-${hour}`;

  let cycleId = `D-${dateStr}`;
  if (refreshCycle === 'weekly') {
    const weekStartStr = getIstWeekStart(istDate, resetDay);
    cycleId = `W-${weekStartStr}`;
  }

  return { dateStr, hour, runId, cycleId, now: now.getTime() };
}

function normalizeProductName(name) {
  if (!name) return '';
  let str = name.trim().toLowerCase();

  // 1. Remove parenthetical descriptions, e.g. (XL, Sky Blue), (Pack of 2), (Freshly made), (Red or Green, ...)
  str = str.replace(/\([^)]*\)/g, ' ');

  // 2. Remove shoe size suffixes like "- 5 uk", "- uk 7", ", 8 uk", "uk 10", "5 uk", "- 6 uk", "uk 6"
  str = str.replace(/[-\s,]+(?:uk\s*\d+|\d+\s*uk)\b/gi, ' ');

  // 3. Remove standalone clothing size tags like "- xl", "- l", "size m", "xl", "xxl", "xxxl"
  str = str.replace(/[-\s,]+(?:xs|s|m|l|xl|xxl|xxxl)\b/gi, ' ');

  // 4. Remove wattage and piece count suffixes e.g. "9w,65k,1piece", "12w,65k,1 piece", "12 w"
  str = str.replace(/\b\d+\s*w\b/gi, ' ');
  str = str.replace(/\b\d+\s*piece(?:s)?\b/gi, ' ');
  str = str.replace(/\b\d+k\b/gi, ' ');

  // 5. Clean up multiple spaces, commas, dashes
  str = str.replace(/[-_,\s]+/g, ' ').trim();

  return str;
}

function getCanonicalItemKey(item) {
  if (item.parentProductId) {
    return `pid:${item.parentProductId}`;
  }
  const norm = normalizeProductName(item.name);
  if (norm) {
    return `name:${norm}`;
  }
  return (item.name || '').trim().toLowerCase() || String(item.skuId || '');
}

/**
 * Evaluates a list of fetched items against the minimum discount threshold.
 * 
 * Consecutive-Run Suppression Logic:
 * 1. Morning reset: At 10:00 AM IST (the first run of the day), or when calendar day changes,
 *    all deals meeting the threshold are alerted to present the day's deals catalog.
 * 2. Subsequent runs (11 AM to 10 PM IST + 12 AM midnight):
 *    - An item is alerted ONLY if:
 *        a) It is a NEW deal (never seen before today), OR
 *        b) It is a meaningful PRICE DROP (cheaper + at least 5% higher discount), OR
 *        c) It RETURNED after being absent (was NOT present in the immediately preceding run).
 *    - If it was present in the immediately preceding run at the SAME price or different size variant,
 *      it is suppressed so users don't see repeated items every single hour.
 */
function findAlertWorthyDeals(items, minDiscount = 70, campaignKey = 'default', options = {}) {
  const cache = loadCache(campaignKey);
  const alertList = [];
  const refreshCycle = options.refreshCycle || 'daily';
  const resetDay = options.weeklyResetDay !== undefined ? options.weeklyResetDay : 1;
  const { dateStr, hour, runId, cycleId, now } = getIstContext(options.overrideDate, options.overrideHour, refreshCycle, resetDay);

  // Determine if this run is the start of a new cycle:
  // - Daily: Calendar date change (e.g. at 12:00 AM midnight) or 10:00 AM morning run
  // - Weekly: Cycle ID rollover (e.g. on resetDay at 12:00 AM midnight IST) or first run with cycle tracking
  const isFirstRunOfCycle = (cache.lastCycleId !== cycleId)
    || (!cache.lastCycleId && cache.lastDate !== dateStr)
    || (refreshCycle === 'daily' && hour === 10 && cache.lastRunHour !== 10);
  const lastRunId = cache.lastRunId;

  const seenInCurrentRun = new Map();

  for (const item of items) {
    let threshold = 70;
    if (typeof minDiscount === 'object' && minDiscount !== null) {
      threshold = item.dealType === 'essential'
        ? (minDiscount.essentials || 70)
        : (minDiscount.nonEssentials || 70);
    } else if (typeof minDiscount === 'number') {
      threshold = minDiscount;
    }

    if (item.discount < threshold) continue;

    const itemKey = getCanonicalItemKey(item);
    if (!itemKey) continue;

    // Intra-run deduplication: if multiple variants/sizes of the same product exist in this batch
    if (seenInCurrentRun.has(itemKey)) {
      const existingAlert = seenInCurrentRun.get(itemKey);
      if (item.price < existingAlert.price) {
        // Update alert with the cheaper variant
        existingAlert.price = item.price;
        existingAlert.mrp = item.mrp;
        existingAlert.discount = item.discount;
        existingAlert.name = item.name;
        existingAlert.searchLink = item.searchLink;
        if (cache.items[itemKey]) {
          cache.items[itemKey].price = item.price;
          cache.items[itemKey].discount = item.discount;
          cache.items[itemKey].lastAlertedPrice = item.price;
          cache.items[itemKey].lastAlertedDiscount = item.discount;
        }
      }
      continue;
    }

    const prev = cache.items[itemKey];

    // Meaningful price improvement: price lower AND at least 5% higher discount, or same item with genuine price drop
    const prevDisc = prev ? (prev.lastAlertedDiscount || prev.discount) : 0;
    const isPriceDrop = prev && (
      (item.price < prev.lastAlertedPrice && item.discount >= (prevDisc + 5))
    );
    const wasInPreviousRun = prev && Boolean(lastRunId) && (prev.lastSeenRunId === lastRunId);
    const alreadyAlertedInCycle = prev && (
      (prev.lastAlertedCycle && prev.lastAlertedCycle === cycleId) ||
      (!prev.lastAlertedCycle && refreshCycle === 'daily' && prev.lastAlertedDate === dateStr)
    );

    let shouldAlert = false;
    let alertType = 'NEW_DEAL';

    if (isFirstRunOfCycle) {
      // First run of the cycle (daily reset or weekly reset on resetDay at 12:00 AM IST)
      shouldAlert = true;
      alertType = prev ? (refreshCycle === 'weekly' ? 'WEEKLY_REFRESH' : 'DAILY_DROP') : 'NEW_DEAL';
    } else if (!prev || !alreadyAlertedInCycle) {
      // Brand new item or first time meeting criteria in this cycle
      shouldAlert = true;
      alertType = 'NEW_DEAL';
    } else if (isPriceDrop) {
      // Price dropped significantly lower than last alerted price today/this cycle
      shouldAlert = true;
      alertType = 'PRICE_DROP';
    } else if (lastRunId && !wasInPreviousRun && refreshCycle !== 'weekly') {
      // Item was absent in the immediately preceding run and came back after a few hours (daily cycles)
      shouldAlert = true;
      alertType = 'BACK_IN_STOCK';
    } else {
      // Consecutively present at the same price or already alerted in this weekly cycle: suppress duplicate alert
      shouldAlert = false;
    }

    if (shouldAlert) {
      const alertObj = {
        ...item,
        alertType,
        prevPrice: prev ? prev.lastAlertedPrice : null,
        prevDiscount: prev ? prev.discount : null,
        campaignKey,
        dealType: item.dealType || campaignKey,
        searchQuery: item.searchQuery || ''
      };
      alertList.push(alertObj);
      seenInCurrentRun.set(itemKey, alertObj);

      cache.items[itemKey] = {
        name: item.name,
        skuId: item.skuId || null,
        parentProductId: item.parentProductId || null,
        price: item.price,
        mrp: item.mrp,
        discount: item.discount,
        lastAlertedPrice: item.price,
        lastAlertedDiscount: item.discount,
        lastAlertedDate: dateStr,
        lastAlertedHour: hour,
        lastAlertedCycle: cycleId,
        lastSeenRunId: runId,
        firstSeen: prev ? prev.firstSeen : now,
        lastSeen: now
      };
    } else {
      // Keep tracking presence in cache without triggering Telegram alert
      seenInCurrentRun.set(itemKey, { price: item.price });
      cache.items[itemKey].lastSeenRunId = runId;
      cache.items[itemKey].price = item.price;
      cache.items[itemKey].discount = item.discount;
      cache.items[itemKey].lastSeen = now;
    }
  }

  // Sort deals descending by discount percentage (highest discount first)
  alertList.sort((a, b) => b.discount - a.discount);

  const totalMetCriteria = items.filter(it => it.discount >= (typeof minDiscount === 'number' ? minDiscount : 70)).length;
  const suppressedCount = Math.max(0, totalMetCriteria - alertList.length);
  console.log(`[DealTracker:${campaignKey}] Total Scanned: ${items.length} | Meets Criteria: ${totalMetCriteria} | Alerts Sent: ${alertList.length} | Suppressed Duplicates: ${suppressedCount} (Cycle: ${refreshCycle}/${cycleId})`);

  // Update run metadata
  cache.lastDate = dateStr;
  cache.lastRunHour = hour;
  cache.lastRunId = runId;
  cache.lastCycleId = cycleId;
  cache.lastRuns[runId] = {
    timestamp: now,
    cycleId,
    refreshCycle,
    totalItems: items.length,
    alertsFound: alertList.length,
    suppressedCount
  };

  saveCache(cache, campaignKey);
  return alertList;
}

function getCachedDeals(campaignKey = 'default', minDiscount = 0) {
  const cache = loadCache(campaignKey);
  const result = [];
  for (const [key, val] of Object.entries(cache.items || {})) {
    if (val.discount >= minDiscount) {
      result.push(val);
    }
  }
  result.sort((a, b) => b.discount - a.discount);
  return result;
}

module.exports = {
  loadCache,
  saveCache,
  findAlertWorthyDeals,
  getCachedDeals,
  getIstContext
};
