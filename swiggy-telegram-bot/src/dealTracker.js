const fs = require('fs');
const path = require('path');
let config = {};
try {
  config = require('../config.json');
} catch (e) {}

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
  const minuteSlot = istDate.getUTCMinutes() < 30 ? '00' : '30';
  const runId = `${dateStr}-${hour}:${minuteSlot}`;

  const dailyCycleId = `D-${dateStr}`;
  const weekStartStr = getIstWeekStart(istDate, resetDay);
  const weeklyCycleId = `W-${weekStartStr}`;
  const cycleId = refreshCycle === 'weekly' ? weeklyCycleId : dailyCycleId;

  return { dateStr, hour, runId, cycleId, dailyCycleId, weeklyCycleId, now: now.getTime() };
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

function extractPackFromItem(item) {
  if (item.pack && typeof item.pack === 'string' && item.pack.trim()) {
    return item.pack.trim().toLowerCase().replace(/\s+/g, '');
  }
  if (item.name && typeof item.name === 'string') {
    const m = item.name.match(/\b\d+(?:\.\d+)?\s*(?:ml|l|ltr|litres?|g|gm|gms|grams?|kg|kgs|pcs|pieces?|pack|units?)\b/i);
    if (m) return m[0].toLowerCase().replace(/\s+/g, '');
  }
  return '';
}

function getCanonicalItemKey(item) {
  const pack = extractPackFromItem(item);
  if (item.parentProductId) {
    return pack ? `pid:${item.parentProductId}:${pack}` : `pid:${item.parentProductId}`;
  }
  const norm = normalizeProductName(item.name);
  if (norm) {
    return pack ? `name:${norm}:${pack}` : `name:${norm}`;
  }
  return (item.name || '').trim().toLowerCase() || String(item.skuId || '');
}

function isStaticCooldownCandidate(item) {
  const cat = (item.category || '').toLowerCase();
  const sub = (item.subCategory || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  const brand = (item.brand || '').toLowerCase();
  const text = `${brand} ${name} ${sub} ${cat}`;

  // 1. Decor items in Home & Kitchen or anywhere
  if (sub.includes('decor') || name.includes('decor') || name.includes('string light') || name.includes('fairy light') || name.includes('diya') || name.includes('candle') || name.includes('lamp') || name.includes('curtain light')) {
    return true;
  }

  // 2. Electronics: Cables, Chargers, Batteries, Extensions, Lights
  if (sub.includes('cable') || sub.includes('charger') || sub.includes('battery') || sub.includes('light') || sub.includes('bulb')) {
    return true;
  }
  if (name.includes('cable') || name.includes('charging') || name.includes('cord') || name.includes('adapter')) {
    return true;
  }

  // 3. Smartwatches
  if (sub.includes('smartwatch') || name.includes('smartwatch') || name.includes('smart watch')) {
    return true;
  }

  // 4. Inflated-MRP & Chronic High-Discount Brands:
  // Electronics/Audio: Dubstep, Hammer, boAt, Noise, Boult, Fire-Boltt, Nu Republic, Portronics, Tizum, truke, Tecsox, Bersache
  // Fashion Jewelry, Gifting & Decor: NVR, You Bella, Palmonas, Meenaz, Zeneme, Tied Ribbons, Desidiya, Rudraksh, BSB Home, Yellow Chimes, Shining Diva, Sukkhi, Voylla, Zaveri Pearls, GIVA
  if (/\b(dubstep|hammer|boat|bo-at|noise|goboult|boult|fire-boltt|fireboltt|nu republic|portronics|tizum|truke|tecsox|bersache|nvr|you bella|youbella|palmonas|meenaz|zeneme|tied ribbons|tiedribbons|desidiya|desi diya|rudraksh|bsb home|bsbhome|yellow chimes|shining diva|sukkhi|voylla|zaveri pearls|giva)\b/i.test(text)) {
    return true;
  }

  // 5. Artificial / Fashion Jewelry & Rakhis
  if (
    sub.includes('necklace') || sub.includes('bracelet') || sub.includes('bangle') ||
    sub.includes('earring') || sub.includes('jewel') || sub.includes('anklet') ||
    name.includes('rakhi') || name.includes('jhumk') || name.includes('earring') ||
    name.includes('bracelet') || name.includes('necklace') || name.includes('bangle') ||
    name.includes('pendant') || name.includes('studs') || name.includes('evil eye')
  ) {
    return true;
  }

  // 6. Footwear & Slippers
  if (sub.includes('footwear') || name.includes('slipper') || name.includes('clog') || name.includes('slides') || name.includes('sandals')) {
    return true;
  }

  return false;
}

/**
 * Checks if an item matches any brand in the brandThresholds configuration.
 * Evaluates both item.brand and item.name using regex word boundary matching.
 *
 * @param {Object} item - Product item { name, brand, ... }
 * @param {Object} brandThresholds - Map of brand name to required min discount percentage
 * @returns {{ brand: string, threshold: number } | null}
 */
function getBrandThresholdMatch(item, brandThresholds = {}) {
  if (!brandThresholds || typeof brandThresholds !== 'object') return null;

  const rawBrand = (item.brand || '').trim();
  const rawName = (item.name || '').trim();
  const brandLower = rawBrand.toLowerCase();
  const nameLower = rawName.toLowerCase();
  const catLower = (item.category || '').toLowerCase();
  const subCatLower = (item.subCategory || '').toLowerCase();

  // Sort keys by length descending so more specific names (e.g. 'MEENAZ Resam') match first
  const sortedEntries = Object.entries(brandThresholds).sort((a, b) => b[0].length - a[0].length);

  for (const [brandKey, minDisc] of sortedEntries) {
    const threshold = typeof minDisc === 'number' ? minDisc : parseInt(minDisc, 10);
    if (isNaN(threshold)) continue;

    const keyLower = brandKey.toLowerCase().trim();
    if (!keyLower) continue;

    // Guard: Capsicum (Brand, NOT the vegetable like Green Capsicum / Shimla Mirch)
    if (keyLower === 'capsicum') {
      const isVegetableCat = catLower.includes('vegetable') || catLower.includes('produce') ||
                             subCatLower.includes('vegetable') || subCatLower.includes('produce') ||
                             catLower.includes('fresh') || subCatLower.includes('fresh');
      const isVegName = /\b(?:green|red|yellow)\s+capsicum\b/i.test(nameLower) ||
                        /\bcapsicum\s*[-–(]?\s*(?:green|red|yellow|shimla)\b/i.test(nameLower) ||
                        /\bshimla\s*mirch\b/i.test(nameLower);
      if (isVegetableCat || isVegName) {
        continue; // Skip Capsicum brand rule for actual fresh vegetables
      }
    }

    // Guard: ANT (Brand, NOT pest control like ant killer / ant chalk / roach spray)
    if (keyLower === 'ant') {
      const isPestControl = /\b(pest|insect|cockroach|roach|mosquito|bug|termite|lizard|rat|rodent)\b/i.test(nameLower) ||
                            /\bant\s*(?:&|\band\b)?\s*.*?(killer|repellent|spray|chalk|bait|trap|powder)\b/i.test(nameLower) ||
                            catLower.includes('pest');
      if (isPestControl) {
        continue; // Skip ANT brand rule for household insecticides
      }
      const isBrandAnt = brandLower === 'ant' || brandLower.startsWith('ant ');
      const isAntName = /\bant\b/i.test(nameLower);
      if (!isBrandAnt && !isAntName) {
        continue;
      }
    }

    // Guard: Noise (Brand, NOT audio feature like 'active noise cancellation' or 'noisemakers')
    if (keyLower === 'noise') {
      const isNoiseFeature = /\b(active\s+noise|noise\s+(?:cancellation|cancelling|reduction|isolation|maker|makers))\b/i.test(nameLower);
      if (isNoiseFeature && brandLower !== 'noise') {
        continue;
      }
    }

    // 1. Direct match on item.brand (if present and not generic instamart/swiggy)
    if (brandLower && brandLower !== 'instamart' && brandLower !== 'swiggy') {
      if (brandLower === keyLower || brandLower.includes(keyLower) || keyLower.includes(brandLower)) {
        return { brand: brandKey, threshold };
      }
    }

    // 2. Safe regex word boundary matching on item.name and item.brand
    let patternStr = keyLower
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\@/g, '[\\s@]+')
      .replace(/\\-/g, '[\\s\\-]+')
      .replace(/\\&/g, '(?:&|and)')
      .replace(/\\\s+/g, '[\\s\\-_]+');

    const regex = new RegExp(`(^|[^a-zA-Z0-9])${patternStr}([^a-zA-Z0-9]|$)`, 'i');
    if (regex.test(nameLower) || regex.test(brandLower)) {
      return { brand: brandKey, threshold };
    }
  }

  return null;
}

/**
 * Evaluates a list of fetched items against the minimum discount threshold.
 * 
 * Deal Suppression Logic:
 * 1. Cycle Start (Morning Reset / Weekly Reset):
 *    - Daily items: At 10:00 AM IST (the first run of the day), or when calendar date changes,
 *      deals meeting threshold are alerted to present the day's deals catalog (DAILY_DROP / NEW_DEAL).
 *    - Weekly items (e.g. Electronics / Lifestyle): On weeklyResetDay (Monday) at cycle rollover,
 *      weekly deals refresh (WEEKLY_REFRESH / NEW_DEAL).
 * 2. Subsequent runs (Intra-day 11 AM to 10 PM IST):
 *    - Once an item is alerted during the cycle, it is SUPPRESSED as long as its discount stays the SAME.
 *    - An item is re-alerted on the SAME day ONLY if:
 *        a) It is a NEW deal (never seen before in this cycle), OR
 *        b) Its DISCOUNT PERCENTAGE HAS CHANGED (e.g. 70% -> 80% or 80% -> 75%) while still meeting threshold.
 *    - If an item goes out of stock or dips out of discount and returns later at the SAME discount,
 *      it is NOT re-alerted (suppresses redundant come-and-go spam).
 * 3. 30-Day Static Price Cooldown:
 *    - Decor items, Cables, Smartwatches, Fashion Jewelry, and inflated-MRP brands
 *      (NVR, You Bella, Palmonas, Meenaz, Tied Ribbons, Desidiya, Rudraksh, boAt, Noise, Hammer, etc.)
 *      are suppressed for 30 days if their price does not drop below their last alerted price.
 */
function findAlertWorthyDeals(items, minDiscount = 70, campaignKey = 'default', options = {}) {
  const cache = loadCache(campaignKey);
  const alertList = [];
  const refreshCycle = options.refreshCycle || 'daily';
  const resetDay = options.weeklyResetDay !== undefined ? options.weeklyResetDay : 1;
  const weeklyCategories = options.weeklyCategories || [];
  const { dateStr, hour, runId, cycleId, dailyCycleId, weeklyCycleId, now } = getIstContext(
    options.overrideDate,
    options.overrideHour,
    refreshCycle,
    resetDay
  );

  // Daily cycle first run: date change or morning kickoff run (09:00 AM or 10:00 AM IST)
  const isDailyFirstRun = (cache.lastDailyCycleId !== dailyCycleId)
    || (!cache.lastDailyCycleId && cache.lastDate !== dateStr)
    || ((hour === 9 || hour === 10) && (cache.lastRunHour === null || cache.lastRunHour < 9));

  // Weekly cycle first run: weekly cycle ID rollover on resetDay
  const isWeeklyFirstRun = (cache.lastWeeklyCycleId !== weeklyCycleId)
    || (!cache.lastWeeklyCycleId && cache.lastCycleId !== cycleId && refreshCycle === 'weekly');

  const lastRunId = cache.lastRunId;
  const seenInCurrentRun = new Map();
  let totalMetCriteria = 0;
  let discardedByBrandThreshold = 0;

  // Resolve Brand Thresholds (options > env > config)
  let envBrandDiscounts = {};
  if (process.env.BRAND_MIN_DISCOUNTS) {
    try {
      envBrandDiscounts = JSON.parse(process.env.BRAND_MIN_DISCOUNTS);
    } catch (e) {
      console.warn('[DealTracker] Could not parse BRAND_MIN_DISCOUNTS env var:', e.message);
    }
  }
  const brandThresholds = {
    ...(config.brandThresholds || {}),
    ...(options.brandThresholds || {}),
    ...envBrandDiscounts
  };

  for (const item of items) {
    let threshold = 70;
    if (options.forceThreshold && typeof minDiscount === 'number') {
      threshold = minDiscount;
    } else if (item.minDiscount !== undefined && item.minDiscount !== null) {
      threshold = item.minDiscount;
    } else if (item.threshold !== undefined && item.threshold !== null) {
      threshold = item.threshold;
    } else if (options.categoryThresholds && options.categoryThresholds[item.category]) {
      threshold = options.categoryThresholds[item.category];
    } else if (typeof minDiscount === 'object' && minDiscount !== null) {
      threshold = item.dealType === 'essential'
        ? (minDiscount.essentials || 70)
        : (minDiscount.nonEssentials || 70);
    } else if (typeof minDiscount === 'number') {
      threshold = minDiscount;
    }

    // Layer 1: Worker / General Minimum Discount Threshold
    if (item.discount < threshold) {
      continue;
    }

    // Layer 2: Brand-Specific Second Layer Threshold
    const brandMatch = getBrandThresholdMatch(item, brandThresholds);
    if (brandMatch && item.discount < brandMatch.threshold) {
      discardedByBrandThreshold++;
      continue; // Discard: passes worker threshold, but fails specific brand threshold
    }

    totalMetCriteria++;

    const itemKey = getCanonicalItemKey(item);
    if (!itemKey) continue;

    // Intra-run deduplication: if multiple variants/sizes of the same product exist in this batch
    if (seenInCurrentRun.has(itemKey)) {
      const existingAlert = seenInCurrentRun.get(itemKey);
      // Keep higher discount; if discount is equal, keep lower price
      if (item.discount > (existingAlert.discount || 0) || (item.discount === existingAlert.discount && item.price < existingAlert.price)) {
        existingAlert.price = item.price;
        existingAlert.mrp = item.mrp;
        existingAlert.discount = item.discount;
        existingAlert.name = item.name;
        existingAlert.itemLink = item.itemLink;
        existingAlert.searchLink = item.searchLink;
        existingAlert.productId = item.productId;
        existingAlert.skuId = item.skuId;
        existingAlert.parentProductId = item.parentProductId;
        if (cache.items[itemKey]) {
          cache.items[itemKey].price = item.price;
          cache.items[itemKey].discount = item.discount;
          if (existingAlert.alertType) {
            cache.items[itemKey].lastAlertedPrice = item.price;
            cache.items[itemKey].lastAlertedDiscount = item.discount;
          }
        }
      }
      continue;
    }

    // Determine cycle for this specific item:
    // If weeklyCategories includes item.category, or if campaign-level refreshCycle is weekly
    const isItemWeekly = (weeklyCategories && weeklyCategories.includes(item.category))
      || (refreshCycle === 'weekly');
    const itemCycle = isItemWeekly ? 'weekly' : 'daily';
    const itemCycleId = isItemWeekly ? weeklyCycleId : dailyCycleId;
    const isFirstRunOfItemCycle = isItemWeekly ? isWeeklyFirstRun : isDailyFirstRun;

    const prev = cache.items[itemKey];
    const prevAlertedDisc = prev ? (prev.lastAlertedDiscount !== undefined ? prev.lastAlertedDiscount : prev.discount) : null;
    const prevAlertedPrice = prev ? (prev.lastAlertedPrice !== undefined ? prev.lastAlertedPrice : prev.price) : null;

    // Has discount percentage changed from the last alerted discount?
    const isDiscountChange = prev && prevAlertedDisc !== null && (item.discount !== prevAlertedDisc);
    const isPriceDrop = isDiscountChange && (item.discount > prevAlertedDisc);

    const alreadyAlertedInCycle = prev && (
      (prev.lastAlertedCycle && prev.lastAlertedCycle === itemCycleId) ||
      (!prev.lastAlertedCycle && itemCycle === 'daily' && prev.lastAlertedDate === dateStr)
    );

    let shouldAlert = false;
    let alertType = 'NEW_DEAL';

    if (isFirstRunOfItemCycle) {
      // First run of the cycle (daily morning reset at 10:00 AM IST or weekly reset on resetDay)
      shouldAlert = true;
      alertType = prev ? (itemCycle === 'weekly' ? 'WEEKLY_REFRESH' : 'DAILY_DROP') : 'NEW_DEAL';
    } else if (!prev || !alreadyAlertedInCycle) {
      // Brand new item or first time meeting criteria in this cycle
      shouldAlert = true;
      alertType = 'NEW_DEAL';
    } else if (isDiscountChange) {
      // Discount percentage changed while still meeting threshold (e.g., 70% -> 80% or 80% -> 75%)
      shouldAlert = true;
      alertType = isPriceDrop ? 'PRICE_DROP' : 'DISCOUNT_CHANGE';
    } else {
      // Already alerted in this cycle at the SAME discount:
      // Suppress duplicate alert (even if item flickered out of stock or below threshold and returned at same discount).
      shouldAlert = false;
    }

    // 30-Day Static Price Cooldown:
    // If item is a candidate (Decor, Cables, Smartwatches, Fashion Jewelry, Inflated-MRP brands),
    // and was previously alerted, suppress if its price hasn't dropped within 30 days.
    const isCooldownCandidate = isStaticCooldownCandidate(item);
    if (shouldAlert && isCooldownCandidate && prev && (prev.lastAlertedPrice !== undefined && prev.lastAlertedPrice !== null)) {
      const isPriceSameOrHigher = item.price >= prev.lastAlertedPrice;
      const lastAlertTime = prev.lastAlertedTimestamp || (prev.lastAlertedDate ? new Date(prev.lastAlertedDate).getTime() : 0);
      const daysSinceAlert = (now - lastAlertTime) / (24 * 60 * 60 * 1000);

      if (isPriceSameOrHigher && daysSinceAlert < 30) {
        // Price has not dropped and 30-day cooldown has not expired: suppress alert
        shouldAlert = false;
      }
    }

    if (shouldAlert) {
      const alertObj = {
        ...item,
        alertType,
        prevPrice: prev ? (prev.lastAlertedPrice !== undefined ? prev.lastAlertedPrice : prev.price) : null,
        prevDiscount: prev ? (prev.lastAlertedDiscount !== undefined ? prev.lastAlertedDiscount : prev.discount) : null,
        campaignKey,
        dealType: item.dealType || campaignKey,
        searchQuery: item.searchQuery || ''
      };
      alertList.push(alertObj);
      seenInCurrentRun.set(itemKey, alertObj);

      cache.items[itemKey] = {
        name: item.name,
        category: item.category || '',
        skuId: item.skuId || null,
        productId: item.productId || null,
        parentProductId: item.parentProductId || null,
        itemLink: item.itemLink || null,
        price: item.price,
        mrp: item.mrp,
        discount: item.discount,
        lastAlertedPrice: item.price,
        lastAlertedDiscount: item.discount,
        lastAlertedDate: dateStr,
        lastAlertedTimestamp: now,
        lastAlertedHour: hour,
        lastAlertedCycle: itemCycleId,
        lastSeenRunId: runId,
        firstSeen: prev ? prev.firstSeen : now,
        lastSeen: now
      };
    } else {
      // Keep tracking presence in cache without triggering Telegram alert
      seenInCurrentRun.set(itemKey, { price: item.price, discount: item.discount, alertType: null });
      if (!cache.items[itemKey]) {
        cache.items[itemKey] = {
          name: item.name,
          category: item.category || '',
          skuId: item.skuId || null,
          productId: item.productId || null,
          parentProductId: item.parentProductId || null,
          itemLink: item.itemLink || null,
          price: item.price,
          mrp: item.mrp,
          discount: item.discount,
          lastAlertedPrice: null,
          lastAlertedDiscount: null,
          lastAlertedDate: null,
          lastAlertedHour: null,
          lastAlertedCycle: null,
          lastSeenRunId: runId,
          firstSeen: now,
          lastSeen: now
        };
      } else {
        cache.items[itemKey].lastSeenRunId = runId;
        cache.items[itemKey].price = item.price;
        cache.items[itemKey].discount = item.discount;
        cache.items[itemKey].lastSeen = now;
      }
    }
  }

  // Sort deals descending by discount percentage (highest discount first)
  alertList.sort((a, b) => b.discount - a.discount);

  const suppressedCount = Math.max(0, totalMetCriteria - alertList.length);
  console.log(`[DealTracker:${campaignKey}] Total Scanned: ${items.length} | Meets Criteria: ${totalMetCriteria} | Discarded by Brand Threshold: ${discardedByBrandThreshold} | Alerts Sent: ${alertList.length} | Suppressed Duplicates: ${suppressedCount} (Cycle: ${refreshCycle}/${cycleId})`);

  // Update run metadata
  cache.lastDate = dateStr;
  cache.lastRunHour = hour;
  cache.lastRunId = runId;
  cache.lastCycleId = cycleId;
  cache.lastDailyCycleId = dailyCycleId;
  cache.lastWeeklyCycleId = weeklyCycleId;
  cache.lastRuns[runId] = {
    timestamp: now,
    cycleId,
    refreshCycle,
    totalItems: items.length,
    alertsFound: alertList.length,
    suppressedCount
  };

  // 1. Prune lastRuns to keep only the most recent 50 entries
  const runKeys = Object.keys(cache.lastRuns || {});
  if (runKeys.length > 50) {
    runKeys.sort((a, b) => (cache.lastRuns[a].timestamp || 0) - (cache.lastRuns[b].timestamp || 0));
    const excess = runKeys.length - 50;
    for (let i = 0; i < excess; i++) {
      delete cache.lastRuns[runKeys[i]];
    }
  }

  // 2. Prune items inactive for > 60 days (allows 30-day cooldown items to safely remain in history)
  const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
  for (const [key, itm] of Object.entries(cache.items || {})) {
    if (now - (itm.lastSeen || 0) > SIXTY_DAYS_MS) {
      delete cache.items[key];
    }
  }

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
  getBrandThresholdMatch,
  getCachedDeals,
  getIstContext
};
