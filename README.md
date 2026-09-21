# 🛒 Swiggy Instamart Deal Hunter & Scout Suite

A comprehensive toolkit for discovering hidden deals, clearance discounts, and high-saving offers on **Swiggy Instamart**:

1. **⚡ Deal Scout (Browser Bookmarklet & Web Portal)**: Interactive in-browser overlay to cherry-pick subcategories and scan live deals directly within your active Swiggy session.
2. **🤖 5-Worker Parallel Deal Hunter (Telegram Bot)**: Automated 24/7 background scraper powered by GitHub Actions matrix runners that tracks 154 curated aisles across 5 parallel workers and sends instant Telegram alerts with smart duplicate suppression.

---

## 🌟 Features at a Glance

| Feature | ⚡ Deal Scout Bookmarklet | 🤖 Telegram Bot Deal Hunter |
| :--- | :--- | :--- |
| **Interface** | Visual in-page modal on Swiggy Instamart | Consolidated Telegram channel/chat alerts |
| **Execution** | Client-side (Runs inside your browser) | Cloud-based (5 Parallel GitHub Actions VMs) |
| **Catalog Coverage** | Pre-mapped **36 categories & all subcategories** | **154 Curated Aisles** across 5 parallel workers |
| **Threshold** | User-selected via UI chips (e.g. 50%, 60%, 70%) | **Tiered per worker** (60%–85% OFF, fully customizable) |
| **Speed** | 1–2 seconds per selected subcategory | ~20–30 seconds total for 154 aisles in parallel |
| **Rate-Limit Safety** | Zero risk (uses your authentic browser cookies) | Independent VM IPs with CloudFront backoff |
| **Spam Prevention** | Zepto-style card grid, brand filters & sorting | Consecutive run suppression & morning reset |

---

## ⚡ 1. Deal Scout (Browser Bookmarklet)

The Deal Scout bookmarklet injects a floating control panel on [swiggy.com/instamart](https://www.swiggy.com/instamart), allowing you to scout specific aisles on demand without getting rate-limited.

### 🚀 Desktop Installation & Usage (Chrome, Edge, Brave, Safari, Firefox)
1. Visit the GitHub Pages setup portal:
   👉 **[https://jairaj26.github.io/swiggy-instamart-deals/](https://jairaj26.github.io/swiggy-instamart-deals/)**
2. Show your browser bookmarks bar (<kbd>Ctrl+Shift+B</kbd> on Windows or <kbd>Cmd+Shift+B</kbd> on Mac).
3. Drag the orange **"🛒 Swiggy Deal Scout"** button directly to your browser's Bookmarks bar.
4. Open **[swiggy.com/instamart](https://www.swiggy.com/instamart)** and click the bookmark anytime you want to scout deals.
5. Pick your category and subcategories, then click **Fetch**!

---

### 📱 Mobile Installation & Usage (Chrome, Safari, Brave on Android & iOS)
Mobile browsers don't have an "Import HTML" menu in their mobile apps, but the mobile bookmarklet is **ultra-lightweight (only 167 characters)**, making setup take just 10 seconds:

1. **Copy the 167-char code**:
   - Open the setup portal on your phone: 👉 **[https://jairaj26.github.io/swiggy-instamart-deals/](https://jairaj26.github.io/swiggy-instamart-deals/)**
   - Tap **📋 Copy Mobile Code (167 chars)**.
2. **Create a temporary bookmark**:
   - Tap your mobile browser menu (<kbd>⋮</kbd> on Android or Share icon on iOS) and tap **⭐ / Add Bookmark** to bookmark this page.
3. **Edit the bookmark**:
   - Open your browser's **Bookmarks** list.
   - Tap the <kbd>⋮</kbd> menu next to the new bookmark and select **Edit**.
   - Change the **Name** to `Swiggy Deal Scout`.
   - Clear the **URL** field and **paste** the 167-char copied script. Save changes.
4. **How to run on Mobile**:
   - Navigate to **[swiggy.com/instamart](https://www.swiggy.com/instamart)** and ensure your delivery location is set.
   - Tap your browser's **address bar** (URL bar) at the top.
   - Type `Swiggy Deal Scout`.
   - In the dropdown search suggestions, tap the **bookmark icon** named **Swiggy Deal Scout**.
   - The Deal Scout overlay will slide out immediately over the mobile page!

> 💡 **Desktop Sync Alternative**: If you use Google Chrome or Apple iCloud account sync, click **"📥 Download Bookmarks (.html)"** on your computer and import it via *Bookmarks → Import Bookmarks*. It will automatically appear in your mobile phone's bookmarks!

---

## 🤖 2. Telegram Deal Hunter Bot (5-Worker Architecture)

An automated deal hunter running on a scheduled cron. Every hour, it triggers **5 parallel worker VMs** via GitHub Actions to scan 154 dark store aisles simultaneously.

### 🌾 The 5 Workers (154 Curated Aisles)

| Worker | Campaign Name | Aisles | Default Min Discount | Included Subcategories |
| :--- | :--- | :---: | :---: | :--- |
| **Worker 1** | **🌾 Daily Essentials & Fresh** | **36** | **≥ 60% OFF** | **Fresh Produce (Vegetables, Leafy & Seasonings, Cuts & Sprouts, Fruits)**, Atta, Rice, Basmati Rice, Toor/Moong/Urad Dal, Besan/Sooji/Maida, Rajma/Chola, Poha, Sunflower/Mustard/Olive Oils, Ghee, Spices & Salt, Ginger-Garlic Pastes, Paneer & Tofu, Butter, Cheese, Curd & Yogurt, Eggs, Bread & Buns, Fresh Bakery, **Dry Fruits (Cashews, Almonds, Dates, Pista, Berries)**. *(Also triggers Wednesday Bazaar at 12:00 AM midnight).* |
| **Worker 2** | **🍿 Sweets, Snacks & Treats** | **40** | **≥ 70% OFF** | Chips & Crisps, Bhujia & Namkeens, Indian Snacks, Nachos, Puffs, Popcorn, Chocolates (Milk, Dark, Gift Boxes, Shared Packs, Wafers, Candies), Traditional Sweets (Kaju Katli, Gulab Jamun, Rasgulla, Mysore Pak, Ladoos, Chikki), Cookies, Cream Biscuits, Cakes, Rusks, Ice Cream (Tubs, Cones, Sticks, Kulfi), Instant & Korean Noodles, Veg & Non-Veg Frozen Snacks, Momos & Kebabs. |
| **Worker 3** | **🛍️ Lifestyle, Home & Fashion** | **20** | **≥ 85% OFF** | Non-Toxic Cookware, Cookware, Kitchen Tools, 304 Stainless Steel, Serveware & Crockery, Bakeware & BBQ, Personal Care Appliances, Earphones & Headsets, Stationery (Pens, Notebooks, Office & School Supplies, Art & Craft), STEM & Learning, Books, Men's & Women's Innerwear, Footwear, Belts & Wallets. |
| **Worker 4** | **🥤 Cold Drinks, Beverages & Spreads** | **30** | **≥ 70% OFF** | Soft Drinks, Fruit Juices, Energy & Hydration Drinks, Mango Drinks, Coconut Water, Soda & Mixers, Ice Tea & Kombucha, Diet Soft Drinks, Tea & Herbal Tea, Instant & Filter Coffee, Cold Coffee, Oats, Muesli & Granola, Cereals, Ketchup, Mayonnaise & Spreads, Peanut Butter, Chocolate Spreads, Jams, Honey & Vinegars, Asian Sauces & Dips. |
| **Worker 5** | **🧴 Personal Care, Baby & Laundry** | **28** | **≥ 70% OFF** | Soaps, Shower Gels, Handwash, Body Lotions & Oils, Oral Care, Fragrance & Talc, Shampoo, Hair Oils & Serums, Conditioners & Masks, Face Wash & Scrubs, Creams & Sunscreen, Serums & Toners, Sanitary Pads, Period Panties, Baby Wipes & Bathing, Baby Lotions, Detergents (Liquid & Powder), Laundry Additives, Dishwash Gel, Floor & Toilet Cleaners, Mosquito & Cockroach Repellents. |

---

### 🛠️ Customizing Workers & Adding Categories (Pet Care, Pooja Store, etc.)

Certain departments (such as **Pet Supplies**, **Pooja Store**, **Health & Pharma**, **Paan Corner**, and **Fine Apparel**) were deliberately excluded from default workers to keep scans focused on high-demand essentials and allow lightning-fast ~25s execution without rate-limiting.

If you want to track any of these categories for your personal bot:
1. Open `swiggy-telegram-bot/config.json`.
2. Locate the desired worker campaign (or create a new one).
3. Add the subcategory object using its taxonomy data:
   ```json
   {
     "category": "Pet Care",
     "name": "Dog Food",
     "id": "<taxonomy_id_from_swiggy_url>",
     "taxonomyType": "IM Meatsy"
   }
   ```
4. Commit and push — your GitHub Actions workers will immediately begin tracking the new aisle!

---

### 🧠 Smart Consecutive Run Suppression (No Hourly Spam)

To prevent sending repeated deals every single hour:
- **10:00 AM IST (Morning Reset)**: Resets daily counters and delivers the complete morning deals catalog.
- **Subsequent Runs (11:00 AM – 10:00 PM IST + 12:00 AM Midnight)**:
  - **Same price consecutive hours**: **Suppressed** (not re-sent).
  - **Price drops**: **Alerted** immediately (`PRICE_DROP`).
  - **New deals**: **Alerted** (`NEW_DEAL`).
  - **Returning deals**: If an item went out of stock and reappears after a few hours, it alerts as `BACK_IN_STOCK`.
- **Silent when 0 deals**: If no new or price-dropped items meet the threshold, the worker exits completely silent.

---

## 🚀 Run Your Own 24/7 Deal Hunter Bot (Free on GitHub Actions)

You can easily set up your own personal Deal Hunter bot that scans 154 Instamart aisles every hour for your local dark store and delivers high-discount deals directly to your Telegram — completely free using GitHub Actions.

### Step 1: Fork This Repository
Click the **Fork** button at the top-right corner of this GitHub repository to copy it into your own GitHub account.

### Step 2: Create Your Telegram Bot
1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Send `/newbot` and follow the prompts to choose a name and username.
3. BotFather will provide an **HTTP API Token** (e.g. `8938917149:AAEukMEm9pu...`). Save this token.
4. Search for [@userinfobot](https://t.me/userinfobot) on Telegram, tap **Start**, and copy your **Id** (e.g. `5747888529`). *(Or add your bot to a channel/group and use the channel ID)*.

### Step 3: Find Your Swiggy Dark Store IDs
1. Navigate to **[swiggy.com/instamart](https://www.swiggy.com/instamart)** in your browser (PC or mobile) and ensure your delivery location/address is selected.
2. Click on **any category** (e.g. *Atta, Rice & Dal* or *Dairy, Bread & Eggs*).
3. Look at your browser address bar URL. It will look like this:
   ```
   https://www.swiggy.com/instamart/category-listing?storeId=<your_store_id>&primaryStoreId=<your_primary_store_id>&secondaryStoreId=<optional_secondary_store_id>...
   ```
4. Extract the numeric IDs:
   - `storeId` is your **`SWIGGY_STORE_ID`** (e.g. `1400216`).
   - `primaryStoreId` is your **`SWIGGY_PRIMARY_STORE_ID`** *(Store ID and Primary ID are identical)*.
   - `secondaryStoreId` is your **`SWIGGY_SECONDARY_STORE_ID`** *(Copy if present; if not present in your URL, leave it blank)*.

### Step 4: Configure GitHub Repository Secrets
In your forked GitHub repository:
1. Navigate to **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret** and add the following:

| Secret Name | Description | Default / Required |
| :--- | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | Your Telegram Bot token from BotFather | **Required** |
| `TELEGRAM_CHAT_ID` | Your Telegram User ID or Channel ID | **Required** |
| `SWIGGY_STORE_ID` | Your local dark store pod ID | **Required** |
| `SWIGGY_PRIMARY_STORE_ID` | Primary store ID (same as `SWIGGY_STORE_ID`) | **Required** |
| `SWIGGY_SECONDARY_STORE_ID` | Secondary fallback store ID (if available in URL) | Optional |
| `ESSENTIALS_MIN_DISCOUNT` | Custom alert threshold for Worker 1 | Optional (Default: `60`) |
| `TREATS_MIN_DISCOUNT` | Custom alert threshold for Worker 2 | Optional (Default: `70`) |
| `LIFESTYLE_MIN_DISCOUNT` | Custom alert threshold for Worker 3 | Optional (Default: `85`) |
| `BEVERAGES_MIN_DISCOUNT` | Custom alert threshold for Worker 4 | Optional (Default: `70`) |
| `PERSONAL_MIN_DISCOUNT` | Custom alert threshold for Worker 5 | Optional (Default: `70`) |

*(Note: `SWIGGY_COOKIE` and `SWIGGY_DEVICE_ID` are optional; direct API requests automatically generate authentic device headers and signatures).*

### Step 5: Enable Workflows & Run
1. Go to the **Actions** tab in your forked repository.
2. GitHub automatically disables scheduled workflows on forks by default. Click the green button: **"I understand my workflows, go ahead and enable them"**.
3. Select **"Swiggy Instamart Keyword Deal Hunter"** in the left sidebar, click **Run workflow**, and check **Run workflow** to test it immediately!
4. From now on, GitHub Actions will automatically wake up every hour between **10:00 AM and 10:00 PM IST** (plus 12:00 AM midnight for Wednesday Bazaar), scrape all 154 aisles across 5 parallel workers, suppress repeated alerts, and send fresh deals straight to your Telegram!

---

## 🧪 Local Testing & Development

Clone the repository and enter the bot folder:
```bash
git clone https://github.com/jairaj26/swiggy-instamart-deals.git
cd swiggy-telegram-bot
npm install
```

Create a `.env` file (see `.env.example`):
```env
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
MIN_DISCOUNT_PERCENT=70

# Dark Store Pod IDs
SWIGGY_STORE_ID=your_store_id_here
SWIGGY_PRIMARY_STORE_ID=your_store_id_here
SWIGGY_SECONDARY_STORE_ID=your_secondary_store_id_here
```

Run test scans for each worker:
```bash
# Test Worker 1 (Essentials & Fresh - 36 aisles, ≥ 60% OFF)
npm run test:essentials

# Test Worker 2 (Sweets, Snacks & Treats - 40 aisles, ≥ 70% OFF)
npm run test:treats

# Test Worker 3 (Lifestyle & Fashion - 20 aisles, ≥ 85% OFF)
npm run test:lifestyle

# Test Worker 4 (Cold Drinks, Beverages & Spreads - 30 aisles, ≥ 70% OFF)
npm run test:beverages

# Test Worker 5 (Personal Care, Baby & Laundry - 28 aisles, ≥ 70% OFF)
npm run test:personal

# Test Wednesday Bazaar Deals
npm run test:bazaar
```

---

## 📁 Repository Structure

```
.
├── index.html                           # GitHub Pages setup portal for the Bookmarklet
├── swiggy-hunter-v4.js                  # Bookmarklet unminified source code
├── swiggy-hunter-v4.min.js              # Bookmarklet minified production bundle
├── swiggy-hunter-v4.bookmarklet.txt     # Raw javascript:... bookmarklet link
├── .github/
│   └── workflows/
│       └── keyword-hunter.yml           # 5-Worker Parallel Deal Hunter workflow
├── swiggy-telegram-bot/
│   ├── config.json                      # 154 Subcategories & campaign configuration
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── bot.js                       # Interactive Telegram bot handler
│       ├── cron-runner.js               # CLI runner for GitHub Actions & cron jobs
│       ├── dealTracker.js               # Deal state tracking & consecutive suppression
│       ├── userManager.js               # User preference & threshold management
│       ├── swiggyApi.js                 # Swiggy Instamart catalog API & browser scraper
│       ├── cipher.js                    # Dynamic request headers & device signatures
│       └── notifier.js                  # HTML-formatted Telegram batch alerts
└── README.md                            # Main project documentation
```

---

## ⚖️ License & Disclaimer

This project is built for personal productivity and deal scouting. It is not affiliated with, endorsed by, or sponsored by Bundl Technologies Private Limited (Swiggy). All trademarks belong to their respective owners.
