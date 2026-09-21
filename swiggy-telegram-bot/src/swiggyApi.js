const fs = require('fs');
const os = require('os');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { getHeaders, generateMatcher } = require('./cipher');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findBrowserExecutable() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/data/data/com.termux/files/usr/bin/chromium-browser',
    '/data/data/com.termux/files/usr/bin/headless_shell',
    '/data/data/com.termux/files/usr/bin/chromium',
    process.env.PREFIX ? path.join(process.env.PREFIX, 'bin', 'chromium-browser') : null,
    process.env.PREFIX ? path.join(process.env.PREFIX, 'bin', 'headless_shell') : null,
    process.env.PREFIX ? path.join(process.env.PREFIX, 'bin', 'chromium') : null,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
  ].filter(Boolean);

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function extractVariations(node, out, parentInfo = {}) {
  if (!node || typeof node !== 'object') return;
  const currentParent = {
    productId: node.productId || parentInfo.productId,
    parentProductId: node.parentProductId || parentInfo.parentProductId,
    displayName: node.displayName || parentInfo.displayName
  };

  if (node.variations && Array.isArray(node.variations)) {
    for (const v of node.variations) {
      if (currentParent.parentProductId) v.parentProductId = currentParent.parentProductId;
      if (currentParent.productId) v.productId = currentParent.productId;
      if (currentParent.displayName) v.parentDisplayName = currentParent.displayName;
      out.push(v);
    }
  } else if (node.displayName && (node.price || node.offerPrice)) {
    if (currentParent.parentProductId) node.parentProductId = currentParent.parentProductId;
    out.push(node);
  } else {
    Object.values(node).forEach((v) => extractVariations(v, out, currentParent));
  }
}

function parseItemsFromData(data) {
  if (!data?.data) return [];
  const rawList = [];
  extractVariations(data.data, rawList);
  if (!rawList.length) return [];

  const items = [];
  for (const v of rawList) {
    if (v.inventory?.inStock === false) continue;
    const mrp = parseFloat(v.price?.mrp?.units || v.price?.mrp || 0);
    const price = parseFloat(v.price?.offerPrice?.units || v.price?.offerPrice || 0);
    const discount = mrp > 0 ? ((mrp - price) / mrp) * 100 : 0;
    const roundedDiscount = Math.round(discount);
    const name = v.displayName;
    if (!name) continue;

    const rawSku = v.skuId || v.spinId;
    const skuId = rawSku || name;
    const parentProductId = v.parentProductId || v.productId || null;
    const imageId = v.imageIds?.[0] || v.imageId || '';
    const imageUrl = imageId
      ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_450,h_450,c_fit/${imageId}`
      : null;

    const searchLink = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(name)}`;
    const itemLink = searchLink;

    items.push({
      skuId,
      name,
      parentProductId,
      brand: v.brandName || v.brand || 'Instamart',
      pack: v.quantityDescription || '',
      price,
      mrp,
      discount: roundedDiscount,
      category: v.category || '',
      subCategory: v.subCategoryType || '',
      rating: v.rating?.value ? `${v.rating.value} ★` : null,
      ratingCount: v.rating?.count || null,
      imageUrl,
      itemLink,
      searchLink
    });
  }
  return items;
}

const INSTAMART_CATEGORIES = {
  veg: { name: 'Fresh Vegetables', tType: 'Speciality taxonomy 1', icon: '🥦' },
  fruits: { name: 'Fresh Fruits', tType: 'Speciality taxonomy 1', icon: '🍎' },
  dairy: { name: 'Dairy, Bread and Eggs', tType: 'Speciality taxonomy 1', icon: '🥛' },
  staples: { name: 'Atta, Rice and Dal', tType: 'taxonomy 5', icon: '🌾' },
  oils: { name: 'Oils and Ghee', tType: 'taxonomy 5', icon: '🛢️' },
  masalas: { name: 'Masalas', tType: 'taxonomy 5', icon: '🧂' },
  breakfast: { name: 'Cereals and Breakfast', tType: 'taxonomy 5', icon: '🥣' },
  snacks: { name: 'Chips and Namkeens', tType: 'taxonomy 10', icon: '🍿' },
  sweets: { name: 'Sweet Corner', tType: 'taxonomy 10', icon: '🍬' },
  chocolates: { name: 'Chocolates', tType: 'taxonomy 10', icon: '🍫' },
  drinks: { name: 'Cold Drinks and Juices', tType: 'taxonomy 10', icon: '🥤' },
  tea: { name: 'Tea, Coffee and Milk drinks', tType: 'taxonomy 10', icon: '☕' },
  cleaning: { name: 'Cleaning Essentials', tType: 'Speciality taxonomy 1', icon: '🧼' },
  personal: { name: 'Bath, Body and Hair', tType: 'taxonomy 14', icon: '✨' }
};

const NOICE_SUB_COLLECTIONS = [
  { id: '408822', name: 'Top Deals' },
  { id: '377503', name: 'Dairy, Bread Eggs & More' },
  { id: '377513', name: 'Chocolates & Ice Creams' },
  { id: '377515', name: 'Munchies' },
  { id: '395522', name: 'Atta & Ghee' },
  { id: '377517', name: 'Beverages' },
  { id: '377520', name: 'Spreads & Dips' },
  { id: '377510', name: 'Cakes & Cookies' },
  { id: '377514', name: 'Indian Sweets' },
  { id: '377516', name: 'Chocolates' },
  { id: '365176', name: 'Dry Fruits' },
  { id: '377519', name: 'Veg Frozen Food' },
  { id: '285297', name: 'Non Veg Frozen Food' },
  { id: '377521', name: 'Chutneys & Pickles' },
  { id: '359943', name: 'Coffee' },
  { id: '290645', name: 'Protein Bars' }
];

// Browser-backed scraper to reliably bypass Cloudflare / AWS WAF Challenge
async function scrapeWithBrowser(mode, storeConfig, options = {}) {
  const browserPath = findBrowserExecutable();
  if (!browserPath) {
    throw new Error('No compatible browser executable found (Edge/Chrome/Chromium).');
  }

  const { sid, pid, secid } = storeConfig;
  const tmpProfile = path.join(os.tmpdir(), 'swiggy-bot-' + Math.random().toString(36).slice(2));

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: 'new',
    userDataDir: tmpProfile,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://instamart.in', { waitUntil: 'domcontentloaded', timeout: 35000 }).catch(() => {});
    await sleep(5500);

    if (options.onProgress) {
      await page.exposeFunction('onBrowserProgress', (current, total, name) => {
        try { options.onProgress(current, total, name); } catch (e) {}
      });
    }

    const scrapedData = await page.evaluate(async (m, sid, pid, secid, opt) => {
      const rand5 = () => Math.floor(10000 + Math.random() * 90000).toString();
      const makeMatcher = () => {
        const raw = rand5() + Date.now().toString() + rand5();
        return raw.split('').map((d) => (parseInt(d, 10) + 7).toString(36)).join('');
      };
      const pSleep = (ms) => new Promise((r) => setTimeout(r, ms));

      if (m === 'noice') {
        const collections = opt.noiceCollections || [];
        const rawPages = [];
        const failedQueue = [];

        // Pass 1: Primary fetch with pacing
        for (let i = 0; i < collections.length; i++) {
          const coll = collections[i];
          let offset = 0;
          let keepPaging = true;
          let pageCount = 0;

          while (keepPaging && pageCount < 3) {
            pageCount++;
            const url = `https://instamart.in/api/instamart/collection/items?collectionId=${coll.id}&isMonetised=true&storeId=${sid}&primaryStoreId=${pid}&secondaryStoreId=${secid}&offset=${offset}&serviceLine=INSTAMART`;
            try {
              const res = await fetch(url, {
                headers: { 'accept': '*/*', 'content-type': 'application/json', 'matcher': makeMatcher() },
                credentials: 'include'
              });
              if (res.status === 200) {
                const json = await res.json();
                if (json?.data) {
                  rawPages.push(json);
                  const nextOffset = json.data?.pageOffset?.nextOffset;
                  if (nextOffset !== null && nextOffset !== undefined && nextOffset !== '' && Number(nextOffset) > offset) {
                    offset = Number(nextOffset);
                  } else {
                    keepPaging = false;
                  }
                } else {
                  keepPaging = false;
                }
              } else {
                failedQueue.push({ coll, offset });
                keepPaging = false;
              }
            } catch (e) {
              failedQueue.push({ coll, offset });
              keepPaging = false;
            }
            await pSleep(400 + Math.random() * 300);
          }
        }

        // Pass 2: Retry failed endpoints after cooldown
        if (failedQueue.length > 0) {
          await pSleep(2000);
          for (const item of failedQueue) {
            const url = `https://instamart.in/api/instamart/collection/items?collectionId=${item.coll.id}&isMonetised=true&storeId=${sid}&primaryStoreId=${pid}&secondaryStoreId=${secid}&offset=${item.offset}&serviceLine=INSTAMART`;
            try {
              const res = await fetch(url, {
                headers: { 'accept': '*/*', 'content-type': 'application/json', 'matcher': makeMatcher() },
                credentials: 'include'
              });
              if (res.status === 200) {
                const json = await res.json();
                if (json?.data) rawPages.push(json);
              }
            } catch (e) {}
            await pSleep(600 + Math.random() * 300);
          }
        }

        return { rawPages };
      }

      if (m === 'bazaar') {
        const rawPages = [];
        let offset = 0;
        let pageCount = 0;

        while (pageCount < 6) {
          pageCount++;
          const url = `https://instamart.in/api/instamart/collection/items?collectionId=397320&isMonetised=true&storeId=${sid}&primaryStoreId=${pid}&secondaryStoreId=${secid}&offset=${offset}&serviceLine=INSTAMART`;
          try {
            const res = await fetch(url, {
              headers: { 'accept': '*/*', 'content-type': 'application/json', 'matcher': makeMatcher() },
              credentials: 'include'
            });
            if (res.status !== 200) break;
            const json = await res.json();
            if (!json?.data) break;
            rawPages.push(json);

            const nextOffset = json.data?.pageOffset?.nextOffset;
            if (nextOffset !== null && nextOffset !== undefined && nextOffset !== '' && Number(nextOffset) > offset) {
              offset = Number(nextOffset);
            } else {
              break;
            }
          } catch (e) {
            break;
          }
          await pSleep(400 + Math.random() * 300);
        }
        return { rawPages };
      }

      if (m === 'category') {
        const cat = opt.categoryObj;
        const catUrl = `https://instamart.in/api/instamart/category-listing/v2?categoryName=${encodeURIComponent(cat.name)}&taxonomyType=${encodeURIComponent(cat.tType)}&offset=0&storeId=${sid}&primaryStoreId=${pid}&secondaryStoreId=${secid}`;
        const catRes = await fetch(catUrl, {
          headers: { 'accept': '*/*', 'content-type': 'application/json', 'matcher': makeMatcher() },
          credentials: 'include'
        });
        const catJson = await catRes.json();
        const subs = [];
        if (catJson?.data?.cards) {
          for (const c of catJson.data.cards) {
            const card = c?.card?.card;
            if (card?.navigationTabs && Array.isArray(card.navigationTabs)) {
              for (const t of card.navigationTabs) {
                const name = t.name;
                const dl = t.deepLink || '';
                const match = dl.match(/filterId=([^&]+)/);
                const id = match ? decodeURIComponent(match[1]) : '';
                if (name && id) subs.push({ name, id });
              }
            }
          }
        }

        const rawPages = [];
        for (let i = 0; i < subs.length; i++) {
          const sub = subs[i];
          if (window.onBrowserProgress) {
            await window.onBrowserProgress(i + 1, subs.length, sub.name);
          }

          const filterUrl = `https://instamart.in/api/instamart/category-listing/filter/v2?storeId=${sid}&primaryStoreId=${pid}&secondaryStoreId=${secid}&pageNo=0&offset=0&page_name=category_listing_filter`;
          const body = {
            categoryName: cat.name,
            filterName: sub.name,
            filterId: sub.id,
            taxonomyType: cat.tType,
            items_offset: "0",
            facets: [],
            sortAttribute: "discountPercentHighToLow"
          };

          try {
            const fRes = await fetch(filterUrl, {
              method: 'POST',
              headers: { 'accept': '*/*', 'content-type': 'application/json', 'matcher': makeMatcher() },
              body: JSON.stringify(body),
              credentials: 'include'
            });
            const fJson = await fRes.json();
            if (fJson?.data) rawPages.push(fJson);
          } catch (e) {}

          await pSleep(300 + Math.random() * 250);
        }

        return { rawPages, subcategoriesCount: subs.length };
      }

      if (m === 'aisles') {
        const subcategories = opt.subcategories || [];
        const rawPages = [];
        const total = subcategories.length;

        for (let i = 0; i < total; i++) {
          const item = subcategories[i];
          if (window.onBrowserProgress) {
            await window.onBrowserProgress(i + 1, total, item.name);
          }

          const filterUrl = `https://instamart.in/api/instamart/category-listing/filter/v2?storeId=${sid}&primaryStoreId=${pid}&secondaryStoreId=${secid}&pageNo=0&offset=0&page_name=category_listing_filter`;
          const body = {
            categoryName: item.category,
            filterName: item.name,
            filterId: item.id,
            taxonomyType: item.taxonomyType || 'taxonomy 5',
            items_offset: '0',
            facets: [],
            sortAttribute: 'discountPercentHighToLow'
          };

          try {
            const fRes = await fetch(filterUrl, {
              method: 'POST',
              headers: { 'accept': '*/*', 'content-type': 'application/json', 'matcher': makeMatcher() },
              body: JSON.stringify(body),
              credentials: 'include'
            });
            const fJson = await fRes.json();
            if (fJson?.data) {
              fJson._meta = {
                category: item.category,
                subCategory: item.name,
                dealType: opt.dealType || 'essential'
              };
              rawPages.push(fJson);
            }
          } catch (e) {}

          await pSleep(200 + Math.random() * 100);
        }

        return { rawPages };
      }

      if (m === 'keywords') {
        const keywordItems = opt.keywordItems || [];
        const rawPages = [];
        const total = keywordItems.length;

        for (let i = 0; i < total; i++) {
          const item = keywordItems[i];
          if (window.onBrowserProgress) {
            await window.onBrowserProgress(i + 1, total, item.query);
          }

          let offset = 0;
          let keepPaging = true;
          let pageCount = 0;

          while (keepPaging && pageCount < 2) {
            pageCount++;
            const searchUrl = `https://instamart.in/api/instamart/search/v2?offset=${offset / 32}&ageConsent=false&storeId=${sid}&primaryStoreId=${pid}&secondaryStoreId=${secid}`;
            const searchBody = {
              facets: [],
              sortAttribute: 'discountPercentHighToLow',
              query: item.query,
              search_results_offset: String(offset),
              page_type: 'INSTAMART_SEARCH_PAGE'
            };

            try {
              const res = await fetch(searchUrl, {
                method: 'POST',
                headers: { 'accept': '*/*', 'content-type': 'application/json', 'matcher': makeMatcher() },
                body: JSON.stringify(searchBody),
                credentials: 'include'
              });

              if (res.status === 200) {
                const json = await res.json();
                if (json?.data) {
                  const varList = [];
                  const findVars = (node) => {
                    if (!node || typeof node !== 'object') return;
                    if (node.variations && Array.isArray(node.variations)) {
                      varList.push(...node.variations);
                    } else if (node.displayName && (node.price || node.offerPrice)) {
                      varList.push(node);
                    } else {
                      Object.values(node).forEach(findVars);
                    }
                  };
                  findVars(json.data);

                  if (!varList.length) {
                    keepPaging = false;
                    break;
                  }

                  let maxDisc = 0;
                  for (const v of varList) {
                    if (v.inventory?.inStock === false) continue;
                    const m = parseFloat(v.price?.mrp?.units || v.price?.mrp || 0);
                    const p = parseFloat(v.price?.offerPrice?.units || v.price?.offerPrice || 0);
                    const d = m > 0 ? ((m - p) / m) * 100 : 0;
                    if (d > maxDisc) maxDisc = d;
                  }

                  json._meta = { query: item.query, dealType: item.type, threshold: item.threshold };
                  rawPages.push(json);

                  // Early exit: if highest discount is below the threshold, no need for next page
                  if (maxDisc < item.threshold) {
                    keepPaging = false;
                  } else {
                    offset += 32;
                  }
                } else {
                  keepPaging = false;
                }
              } else {
                keepPaging = false;
              }
            } catch (e) {
              keepPaging = false;
            }

            await pSleep(350 + Math.random() * 200);
          }
        }

        return { rawPages };
      }

      return { rawPages: [] };
    }, mode, sid, pid, secid, {
      noiceCollections: NOICE_SUB_COLLECTIONS,
      categoryObj: options.categoryObj,
      keywordItems: options.keywordItems,
      subcategories: options.subcategories,
      dealType: options.dealType,
      onProgress: !!options.onProgress
    });

    const resultMap = new Map();
    for (const pageJson of scrapedData.rawPages || []) {
      const meta = pageJson._meta || {};
      const items = parseItemsFromData(pageJson);
      for (const item of items) {
        if (meta.category) item.category = meta.category;
        if (meta.subCategory) item.subCategory = meta.subCategory;
        if (meta.dealType) item.dealType = meta.dealType;
        if (meta.query) item.searchQuery = meta.query;
        if (meta.threshold) item.threshold = meta.threshold;

        const existing = resultMap.get(item.name);
        if (!existing || item.price < existing.price) {
          resultMap.set(item.name, item);
        }
      }
    }

    const allItems = Array.from(resultMap.values());
    allItems.sort((a, b) => b.discount - a.discount);
    return allItems;
  } finally {
    await browser.close().catch(() => {});
    try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (e) {}
  }
}

// Direct fetch fallback for Noice across all 16 collections
async function fetchNoiceDealsDirect(storeConfig) {
  const { sid, pid, secid } = storeConfig;
  const resultMap = new Map();

  for (let i = 0; i < NOICE_SUB_COLLECTIONS.length; i++) {
    const coll = NOICE_SUB_COLLECTIONS[i];
    let offset = 0;
    let keepPaging = true;
    let pageCount = 0;

    while (keepPaging && pageCount < 2) {
      pageCount++;
      const url = `https://instamart.in/api/instamart/collection/items?collectionId=${coll.id}&isMonetised=true&storeId=${sid}&primaryStoreId=${pid}&secondaryStoreId=${secid}&offset=${offset}&serviceLine=INSTAMART`;
      const json = await apiRequestSafe(url, 'GET');
      if (!json?.data) break;

      const pageItems = parseItemsFromData(json);
      for (const item of pageItems) {
        item.category = 'The NOICE Store';
        item.subCategory = coll.name;
        item.dealType = 'noice';
        const existing = resultMap.get(item.name);
        if (!existing || item.price < existing.price) {
          resultMap.set(item.name, item);
        }
      }

      const nextOffset = json.data?.pageOffset?.nextOffset;
      if (nextOffset !== null && nextOffset !== undefined && nextOffset !== '' && Number(nextOffset) > offset) {
        offset = Number(nextOffset);
        await sleep(250);
      } else {
        keepPaging = false;
      }
    }
    await sleep(200);
  }

  const allItems = Array.from(resultMap.values());
  allItems.sort((a, b) => b.discount - a.discount);
  return allItems;
}

// Fallback direct HTTP API client
async function apiRequestSafe(url, method = 'GET', body = null, retry = 0) {
  const headers = getHeaders();
  try {
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    let json = null;
    try { json = await res.json(); } catch (e) {}

    const isCloudfrontRateLimited =
      Boolean(res.headers?.get('x-rate-limit')) ||
      (res.headers?.get('x-cache') || '').includes('Error') ||
      (res.status === 200 && res.headers?.get('content-length') === '0');

    const isRateLimited =
      res.status === 429 ||
      res.status === 403 ||
      json?.statusCode === 429 ||
      json?.statusCode === 403 ||
      isCloudfrontRateLimited;

    if (isRateLimited) {
      if (isCloudfrontRateLimited) {
        // CloudFront 0-byte response or WAF challenge requires valid cookie / browser session
        console.warn('[SwiggyAPI] CloudFront challenge detected (0-byte response). Skipping retry.');
        return null;
      }
      if (retry >= 1) return null;
      const waitSec = 3 + Math.floor(Math.random() * 3);
      console.warn(`[SwiggyAPI] Rate-limited (retry ${retry + 1}/1). Waiting ${waitSec}s...`);
      await sleep(waitSec * 1000);
      return apiRequestSafe(url, method, body, retry + 1);
    }

    if (res.status === 200 && json && json.data) {
      return json;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Main exported functions
async function fetchNoiceDeals(storeConfig) {
  if (process.env.USE_BROWSER !== 'false' && findBrowserExecutable()) {
    try {
      return await scrapeWithBrowser('noice', storeConfig);
    } catch (err) {
      console.warn('[SwiggyAPI] Browser scrape for NOICE failed, falling back to direct fetch…', err.message);
    }
  }
  return fetchNoiceDealsDirect(storeConfig);
}

async function fetchWednesdayBazaarDeals(storeConfig) {
  if (process.env.USE_BROWSER !== 'false' && findBrowserExecutable()) {
    try {
      return await scrapeWithBrowser('bazaar', storeConfig);
    } catch (err) {
      console.warn('[SwiggyAPI] Browser scrape for Bazaar failed:', err.message);
    }
  }
  return [];
}

async function fetchCategoryDeals(catKey, storeConfig, onProgress = null) {
  const catObj = INSTAMART_CATEGORIES[catKey];
  if (!catObj) throw new Error(`Unknown category key: ${catKey}`);

  if (process.env.USE_BROWSER !== 'false' && findBrowserExecutable()) {
    return await scrapeWithBrowser('category', storeConfig, {
      categoryObj: catObj,
      onProgress
    });
  }
  return [];
}

// Direct fetch fallback for keywords
async function fetchKeywordDealsDirect(storeConfig, keywordItems) {
  const { sid, pid, secid } = storeConfig;
  const resultMap = new Map();

  for (const item of keywordItems) {
    let offset = 0;
    let keepPaging = true;
    let pageCount = 0;

    while (keepPaging && pageCount < 2) {
      pageCount++;
      const searchUrl = `https://instamart.in/api/instamart/search/v2?offset=${offset / 32}&ageConsent=false&storeId=${sid}&primaryStoreId=${pid}&secondaryStoreId=${secid}`;
      const searchBody = {
        facets: [],
        sortAttribute: 'discountPercentHighToLow',
        query: item.query,
        search_results_offset: String(offset),
        page_type: 'INSTAMART_SEARCH_PAGE'
      };

      const json = await apiRequestSafe(searchUrl, 'POST', searchBody);
      if (!json?.data) break;

      const pageItems = parseItemsFromData(json);
      if (!pageItems.length) break;

      let maxDisc = 0;
      for (const pi of pageItems) {
        if (pi.discount > maxDisc) maxDisc = pi.discount;
        pi.dealType = item.type;
        pi.searchQuery = item.query;
        pi.threshold = item.threshold;

        const existing = resultMap.get(pi.name);
        if (!existing || pi.price < existing.price) {
          resultMap.set(pi.name, pi);
        }
      }

      if (maxDisc < item.threshold) {
        keepPaging = false;
      } else {
        offset += 32;
        await sleep(350);
      }
    }
    await sleep(350);
  }

  const allItems = Array.from(resultMap.values());
  allItems.sort((a, b) => b.discount - a.discount);
  return allItems;
}

async function fetchKeywordDeals(storeConfig, options = {}) {
  const cfg = require('../config.json');
  const catConfig = options.categories || cfg.campaigns?.keywordHunter?.categories || {};
  const thresholds = options.thresholds || cfg.campaigns?.keywordHunter?.thresholds || { essentials: 65, nonEssentials: 75 };

  const essentials = (catConfig.essentials || []).map((q) => ({ query: q, type: 'essential', threshold: thresholds.essentials }));
  const nonEssentials = (catConfig.nonEssentials || []).map((q) => ({ query: q, type: 'nonEssential', threshold: thresholds.nonEssentials }));
  const allKeywords = [...essentials, ...nonEssentials];

  const totalChunks = options.totalChunks || 1;
  const chunkIndex = options.chunkIndex || 0;

  const keywordItems = allKeywords.filter((_, idx) => idx % totalChunks === chunkIndex);

  console.log(`[SwiggyAPI] Running Keyword Deal Hunter for ${keywordItems.length}/${allKeywords.length} queries (Chunk ${chunkIndex + 1}/${totalChunks})`);

  if (process.env.USE_BROWSER !== 'false' && findBrowserExecutable()) {
    try {
      return await scrapeWithBrowser('keywords', storeConfig, {
        keywordItems,
        onProgress: options.onProgress
      });
    } catch (err) {
      console.warn('[SwiggyAPI] Browser scrape for keywords failed, falling back to direct fetch…', err.message);
    }
  }

  return fetchKeywordDealsDirect(storeConfig, keywordItems);
}

async function fetchEssentialAisleDealsDirect(storeConfig, options = {}) {
  const cfg = require('../config.json');
  const subcategories = options.subcategories || cfg.campaigns?.essentials?.subcategories || cfg.campaigns?.essentialAisles?.subcategories || [];
  const campaignName = options.campaignName || 'Aisles';
  const dealType = options.dealType || 'essential';
  const { sid, pid, secid } = storeConfig;
  const resultMap = new Map();

  console.log(`[SwiggyAPI] Scanning ${subcategories.length} ${campaignName} for Store ${sid}...`);

  let consecutiveBlocks = 0;
  for (let i = 0; i < subcategories.length; i++) {
    const item = subcategories[i];
    const filterUrl = `https://instamart.in/api/instamart/category-listing/filter/v2?storeId=${sid}&primaryStoreId=${pid}&secondaryStoreId=${secid}&pageNo=0&offset=0&page_name=category_listing_filter`;
    const body = {
      categoryName: item.category,
      filterName: item.name,
      filterId: item.id,
      taxonomyType: item.taxonomyType || 'taxonomy 5',
      items_offset: '0',
      facets: [],
      sortAttribute: 'discountPercentHighToLow'
    };

    const json = await apiRequestSafe(filterUrl, 'POST', body);
    if (json?.data) {
      consecutiveBlocks = 0;
      const items = parseItemsFromData(json);
      for (const it of items) {
        it.category = item.category;
        it.subCategory = item.name;
        it.dealType = dealType;

        const existing = resultMap.get(it.name);
        if (!existing || it.price < existing.price) {
          resultMap.set(it.name, it);
        }
      }
    } else {
      consecutiveBlocks++;
      if (consecutiveBlocks >= 4) {
        console.warn(`[SwiggyAPI] CloudFront WAF challenge active (4 consecutive blocked requests). Halting scan to prevent IP block.`);
        break;
      }
    }
    await sleep(350);
  }

  const allItems = Array.from(resultMap.values());
  allItems.sort((a, b) => b.discount - a.discount);
  console.log(`[SwiggyAPI] Scraped ${allItems.length} unique items across ${subcategories.length} ${campaignName}.`);
  return allItems;
}

async function fetchEssentialAisleDeals(storeConfig, options = {}) {
  const cfg = require('../config.json');
  const subcategories = options.subcategories || cfg.campaigns?.essentials?.subcategories || cfg.campaigns?.essentialAisles?.subcategories || [];
  const campaignName = options.campaignName || 'Aisles';
  const dealType = options.dealType || 'essential';

  if (process.env.USE_BROWSER !== 'false' && findBrowserExecutable()) {
    try {
      console.log(`[SwiggyAPI] Scraping ${subcategories.length} ${campaignName} via Browser...`);
      return await scrapeWithBrowser('aisles', storeConfig, {
        subcategories,
        dealType,
        campaignName
      });
    } catch (err) {
      console.warn(`[SwiggyAPI] Browser scrape for ${campaignName} failed, falling back to direct fetch…`, err.message);
    }
  }

  return fetchEssentialAisleDealsDirect(storeConfig, options);
}

module.exports = {
  INSTAMART_CATEGORIES,
  apiRequestSafe,
  fetchNoiceDeals,
  fetchWednesdayBazaarDeals,
  fetchCategoryDeals,
  fetchKeywordDeals,
  fetchEssentialAisleDeals
};
