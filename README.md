# 🛒 Swiggy Instamart Deal Hunter & Scout Suite

A comprehensive toolkit for discovering hidden deals, clearance discounts, and massive price drops on **Swiggy Instamart**:

1. **⚡ Deal Scout (Browser Bookmarklet & Web Portal)**: Interactive in-browser overlay to cherry-pick subcategories and scan live deals directly within your active Swiggy session on Desktop and Mobile.
2. **🤖 9-Worker Parallel Deal Hunter (Telegram Bot)**: Automated 24/7 background scraper powered by GitHub Actions matrix runners that tracks **379+ curated subcategories & 73+ search keywords** across **9 parallel workers** and delivers instant Telegram alerts with smart duplicate suppression.

---

## 🌟 Features at a Glance

| Feature | ⚡ Deal Scout Bookmarklet | 🤖 Telegram Bot Deal Hunter |
| :--- | :--- | :--- |
| **Interface** | Visual in-page modal on Swiggy Instamart | Consolidated Telegram channel/chat alerts |
| **Execution** | Client-side (Runs inside your browser) | Cloud-based (9 Parallel GitHub Actions VMs) |
| **Catalog Coverage** | Pre-mapped **26 categories (340+ subcategories)** | **379+ Curated Aisles & 73+ Search Keywords** across 9 parallel workers |
| **Threshold** | User-selected via UI chips (e.g. 50%, 60%, 70%) | **Tiered per worker** (60%–89% OFF, fully customizable) |
| **Speed** | 1–2 seconds per selected subcategory | ~25–35 seconds total across all workers in parallel |
| **Pagination** | Page 1 always + Smart Page 2 auto-fetch | Page 1 high-to-low deals per aisle |
| **Rate-Limit Safety** | Zero risk (uses your authentic browser cookies) | Independent VM IPs with CloudFront backoff |
| **Spam Prevention** | Zepto-style card grid, brand filters & sorting | Consecutive run suppression & morning reset |

---

## ⚡ 1. Deal Scout (Browser Bookmarklet)

The Deal Scout bookmarklet injects a floating control panel on [swiggy.com/instamart](https://www.swiggy.com/instamart), allowing you to scout specific aisles on demand without getting rate-limited.

### 🌐 Setup Portal
Visit the setup portal:
👉 **[https://jairaj26.github.io/swiggy-instamart-deals/](https://jairaj26.github.io/swiggy-instamart-deals/)**

---

### 🖥️ Desktop Setup (Chrome, Edge, Brave, Safari, Firefox)
1. Show your browser bookmarks bar (<kbd>Ctrl+Shift+B</kbd> on Windows or <kbd>Cmd+Shift+B</kbd> on Mac).
2. Visit the [Setup Portal](https://jairaj26.github.io/swiggy-instamart-deals/).
3. Drag the orange **"🛒 Swiggy Deal Scout"** button directly onto your browser's Bookmarks bar.
4. Open **[swiggy.com/instamart](https://www.swiggy.com/instamart)** and ensure your delivery location is set.
5. Click the bookmark anytime to open the Deal Scout overlay.
6. Pick your category and subcategories, choose a discount threshold chip (50%, 60%, 70%), and click **Fetch**!

---

### 📱 Mobile Setup (Android & iOS — Chrome, Safari, Brave)
Mobile browsers do not support drag-and-drop bookmarking, but the mobile bookmarklet is **ultra-lightweight (only 167 characters)**:

1. **Copy the code**:
   - Open the [Setup Portal](https://jairaj26.github.io/swiggy-instamart-deals/) on your mobile browser.
   - Tap **📋 Copy Mobile Code (167 chars)**.
2. **Bookmark any page**:
   - Tap your browser menu (<kbd>⋮</kbd> on Android or Share icon on iOS) and tap **⭐ / Add Bookmark**.
3. **Edit the bookmark**:
   - Open your browser's **Bookmarks** list.
   - Tap the <kbd>⋮</kbd> menu next to the new bookmark and tap **Edit**.
   - Set **Name** to: `Swiggy Deal Scout`
   - Delete the **URL** field and **paste** the copied script. Save changes.
4. **How to run on Mobile**:
   - Go to **[swiggy.com/instamart](https://www.swiggy.com/instamart)** and make sure your delivery address is selected.
   - Tap your browser's **address bar** (URL bar) at the top.
   - Type `Swiggy Deal Scout`.
   - In the dropdown search suggestions, tap the **bookmark entry** named **Swiggy Deal Scout**.
   - The Deal Scout overlay will slide out immediately over the mobile page!

> [!NOTE]
> **How Bookmarklet Pagination Works**:
> The bookmarklet fetches Page 1 sorted by discount (highest to lowest). If Page 1 contains 15 or more items and the lowest discount item is still **> 50%**, it automatically fetches **Page 2** so you never miss deep discounts that spill over.

---

## 🤖 2. Telegram Deal Hunter Bot (9-Worker Architecture)

An automated deal hunter running on a scheduled cron. Every 30 minutes, it triggers **9 parallel worker VMs** via GitHub Actions to scan **379+ dark store aisles and 73+ search keywords** simultaneously.

### 🌾 The 9 Workers & Default Discount Thresholds

| Worker | Name / Campaign | Aisles | Default Threshold | Included Subcategories |
| :--- | :--- | :---: | :---: | :--- |
| **Worker 1 (`fresh`)** | **🥦 Daily Fresh Produce & Meats** | **48** | **≥ 60% OFF** | Fresh Vegetables, Leafy Greens, Exotic Vegetables, Cuts & Sprouts, Fresh Fruits, Seasonal Fruits, Poultry, Mutton, Fish & Seafood, Paneer, Tofu, Fresh Bakery, Eggs & Dairy. |
| **Worker 2 (`grocery`)** | **🌾 Daily Staples & Cooking Essentials** | **57** | **≥ 60% OFF** | Atta, Rice, Basmati Rice, Dals & Pulses (Toor, Moong, Urad, Chana), Besan, Sooji, Maida, Cooking Oils (Mustard, Sunflower, Olive), Ghee, Spices, Masalas, Salt, Dry Fruits & Nuts. |
| **Worker 3 (`treats`)** | **🍫 Sweets, Chocolates & Bakery** | **56** | **≥ 70% OFF** | Premium Chocolates, Chocolate Gift Boxes, Traditional Mithai (Kaju Katli, Gulab Jamun, Rasgulla), Ice Cream Tubs & Cones, Cakes, Cookies, Cream Biscuits, Wafers. |
| **Worker 4 (`munchies`)** | **🍿 Snacks, Munchies & Instant Foods** | **46** | **≥ 70% OFF** | Potato Chips, Bhujia & Namkeens, Nachos, Popcorn, Instant Noodles, Korean Ramen, Frozen Veg/Non-Veg Snacks, Momos, Ready-to-Eat Meals. |
| **Worker 5 (`beverages`)** | **🥤 Cold Drinks, Nutrition & Spreads** | **49** | **≥ 70% OFF** | Soft Drinks, Fruit Juices, Energy & Hydration Drinks, Coconut Water, Cold & Hot Coffee, Tea & Herbal Tea, Breakfast Cereals, Muesli, Oats, Peanut Butter, Chocolate Spreads, Sauces. |
| **Worker 6 (`personalCare`)** | **🧴 Personal Care, Bath & Skincare** | **47** | **≥ 70% OFF** | Soaps, Shower Gels, Hand Wash, Shampoos, Hair Conditioners & Serums, Face Wash & Scrubs, Moisturisers, Sunscreen, Sanitary Pads, Oral Care & Deodorants. |
| **Worker 7 (`lifestyle`)** | **👶 Baby Care & Lifestyle** | **24** | **≥ 85% OFF** | Curated Baby Essentials (Baby Bathing, Baby Cream, Gifts & More, Baby Oral Care) + Cookware, Kitchen Tools, Crockery, Headphones, Stationery & Home Clearance. |
| **Worker 8 (`household`)** | **🧹 Cleaning, Home & Electronics** | **52** | **≥ 70% OFF** | Detergents, Fabric Care, Dishwash, Surface Cleaners, Kitchen Essentials, Home Utility, Electricals & Mobile Accessories. |
| **Worker 9 (`clearance`)** | **🏷️ High-Discount Clearance Specials** | **51** | **≥ 89% OFF** | Steepest clearance deals, seasonal markdowns, apparel, footwear, toys, lifestyle accessories, and flash sales. |

---

### 🧠 Smart Duplicate & Spam Suppression

To prevent flooding your Telegram with repeated notifications:
- **09:01 AM IST (Morning Reset)**: Clears previous day tracking and sends the complete fresh morning deals catalog.
- **30-Minute Interval Runs (09:31 AM – 12:01 AM midnight IST)**:
  - **Identical price**: Suppressed (not re-sent).
  - **Price drops**: Alerted immediately (`PRICE_DROP`).
  - **New deals**: Alerted (`NEW_DEAL`).
  - **Restocked items**: Alerted when back in stock (`BACK_IN_STOCK`).
- **Silent Exit**: If no deals meet the threshold, the bot exits silently without sending empty messages.
- **Queue Staleness Guard**: Automatically drops runs if GitHub runner queues delay execution by >15 minutes past target slots (e.g. preventing delayed 1:20 AM alerts).
- **Auto-Retry on Server Busy**: If Swiggy is overloaded during peak sale drops (such as 12:00 AM midnight), workers automatically retry up to 3 times with a 75s buffer before giving up.

---

## 🚀 Setup Your Personal Deal Hunter Bot (100% Free on GitHub Actions)

Follow these simple steps to run your own 24/7 Deal Hunter bot for your local Swiggy Instamart pod.

### Step 1: Fork This Repository
Click the **Fork** button at the top-right corner of this GitHub repository to copy it into your own GitHub account.

---

### Step 2: Create Your Telegram Bot
1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Send `/newbot` and follow the prompts to choose a bot name and username (e.g. `MySwiggyDealsBot`).
3. BotFather will provide an **HTTP API Token** (e.g. `1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ...`). Save this token — this is your `TELEGRAM_BOT_TOKEN`.
4. Now search for [@userinfobot](https://t.me/userinfobot) on Telegram, tap **Start**, and copy your numeric **Id** (e.g. `123456789`). This is your `TELEGRAM_CHAT_ID`.
   > *Tip: If you want alerts sent to a Telegram Channel, create a public or private channel, add your bot as an Admin, and use the Channel Username (e.g. `@MyDealsChannel`) or Channel ID as `TELEGRAM_CHAT_ID`.*

---

### Step 3: Find Your Swiggy Dark Store IDs
1. Go to **[swiggy.com/instamart](https://www.swiggy.com/instamart)** in your browser and ensure your delivery address is selected.
2. Click on **any category** (such as *Atta, Rice & Dal* or *Dairy, Bread & Eggs*).
3. Look at your browser address bar URL. It will look like this:
   ```
   https://www.swiggy.com/instamart/category-listing?storeId=138294&primaryStoreId=138294&secondaryStoreId=138295...
   ```
4. Extract the IDs from the URL:
   - `storeId` → **`SWIGGY_STORE_ID`** (e.g. `138294`)
   - `primaryStoreId` → **`SWIGGY_PRIMARY_STORE_ID`** (same as `storeId`)
   - `secondaryStoreId` → **`SWIGGY_SECONDARY_STORE_ID`** (if present in your URL; if not present, leave empty)

---

### Step 4: Configure GitHub Secrets
In your forked GitHub repository:
1. Navigate to **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret** for each variable below:

#### Required Secrets:
| Secret Name | Value |
| :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | Token provided by @BotFather |
| `TELEGRAM_CHAT_ID` | Numeric Chat ID from @userinfobot (or channel username) |
| `SWIGGY_STORE_ID` | Your local store pod ID from Swiggy URL |
| `SWIGGY_PRIMARY_STORE_ID` | Same as `SWIGGY_STORE_ID` |

#### Optional Secrets:
| Secret Name | Default | Description |
| :--- | :---: | :--- |
| `SWIGGY_SECONDARY_STORE_ID` | *(empty)* | Secondary store fallback ID if present in URL |
| `FRESH_MIN_DISCOUNT` | `60` | Custom minimum % discount for Worker 1 (`fresh`) |
| `GROCERY_MIN_DISCOUNT` | `60` | Custom minimum % discount for Worker 2 (`grocery`) |
| `TREATS_MIN_DISCOUNT` | `70` | Custom minimum % discount for Worker 3 (`treats`) |
| `MUNCHIES_MIN_DISCOUNT` | `70` | Custom minimum % discount for Worker 4 (`munchies`) |
| `BEVERAGES_MIN_DISCOUNT` | `70` | Custom minimum % discount for Worker 5 (`beverages`) |
| `PERSONAL_MIN_DISCOUNT` | `70` | Custom minimum % discount for Worker 6 (`personalCare`) |
| `LIFESTYLE_MIN_DISCOUNT` | `85` | Custom minimum % discount for Worker 7 (`lifestyle`) |
| `HOUSEHOLD_MIN_DISCOUNT` | `70` | Custom minimum % discount for Worker 8 (`household`) |
| `CLEARANCE_MIN_DISCOUNT` | `89` | Custom minimum % discount for Worker 9 (`clearance`) |

---

### Step 5: Enable Workflows & Test
1. Go to the **Actions** tab in your forked repository.
2. GitHub automatically pauses scheduled workflows on newly forked repositories. Click the green button: **"I understand my workflows, go ahead and enable them"**.
3. Select **"Swiggy Instamart Keyword Deal Hunter"** from the left sidebar.
4. Click **Run workflow** → select `Skip top-of-hour wait sync (run immediately)` → Click **Run workflow**.
5. Within ~30 seconds, all 9 workers will execute in parallel and you will receive high-discount deals directly on Telegram!
6. From now on, GitHub Actions runs automatically **every 30 minutes** from **09:01 AM to 12:01 AM midnight IST**.
7. *(Recommended)* Ensure your repository's **Settings → Actions → General → Workflow permissions** is set to **"Read and write permissions"** so the built-in auto-retry companion workflow can automatically re-run any worker that encounters a temporary GitHub runner allocation glitch.

---

## 🛠️ Customization Guide

### 1. How to Adjust Discount Thresholds
You have 3 ways to customize discount thresholds:

- **Via GitHub Secrets (Recommended for Actions)**:
  Add any of the optional secrets listed above (e.g. `GROCERY_MIN_DISCOUNT = 50`) in GitHub Secrets.
- **Via Telegram Bot Commands (If running the interactive bot)**:
  Send commands directly to your bot:
  ```
  /setdiscount grocery 50     # Sets grocery worker to >= 50%
  /setdiscount fresh 55       # Sets fresh worker to >= 55%
  /setdiscount all 65         # Sets all workers to >= 65%
  /status                     # View current thresholds and store info
  ```
- **Via `swiggy-telegram-bot/config.json`**:
  Open `config.json` and change the `"minDiscount"` field inside any campaign:
  ```json
  "fresh": {
    "name": "Daily Fresh Produce & Meats",
    "minDiscount": 55
  }
  ```

---

### 2. How to Add or Remove Subcategories
All 379+ subcategories are defined in [`swiggy-telegram-bot/config.json`](./swiggy-telegram-bot/config.json).

To add an aisle to any worker:
1. Open `swiggy-telegram-bot/config.json`.
2. Locate the worker campaign (e.g. `fresh`, `grocery`, `treats`, etc.).
3. Add a new subcategory entry to its `subcategories` array:
   ```json
   {
     "category": "Fresh Fruits",
     "name": "Organic Apples",
     "id": "<sub_category_filter_id>",
     "taxonomyType": "Speciality taxonomy 1"
   }
   ```
4. Commit and push changes. Your GitHub Actions runners will automatically include the new subcategory on the next scan!

> [!TIP]
> **How to find the subcategory `id`**:
> Open DevTools (<kbd>F12</kbd>) → **Network** tab on Swiggy Instamart. When you click any subcategory filter, check the payload of the `category-listing/filter/v2` request for `filterId` and `categoryName`.

---

## 💻 Local Testing & Development

If you want to run or test the bot on your local machine:

1. Clone your repository:
   ```bash
   git clone https://github.com/jairaj26/swiggy-instamart-deals.git
   cd swiggy-instamart-deals/swiggy-telegram-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
   Fill in your `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and `SWIGGY_STORE_ID`.

4. Test individual workers locally:
   ```bash
   npm run test:fresh       # Scans Worker 1 (Fresh Produce & Meats)
   npm run test:grocery     # Scans Worker 2 (Staples & Cooking Essentials)
   npm run test:treats      # Scans Worker 3 (Sweets, Chocolates & Bakery)
   npm run test:munchies    # Scans Worker 4 (Snacks & Instant Foods)
   npm run test:beverages   # Scans Worker 5 (Cold Drinks & Nutrition)
   npm run test:personal    # Scans Worker 6 (Personal Care & Bath)
   npm run test:lifestyle   # Scans Worker 7 (Baby Care & Lifestyle)
   npm run test:household   # Scans Worker 8 (Cleaning, Home & Electronics)
   npm run test:clearance   # Scans Worker 9 (High-Discount Clearance Specials)
   ```

5. Run the interactive 24/7 Telegram bot locally:
   ```bash
   npm start
   ```

---

## 📁 Repository Structure

```
.
├── index.html                           # GitHub Pages setup portal for Deal Scout Bookmarklet
├── swiggy-hunter-v4.js                  # Bookmarklet unminified source code
├── swiggy-hunter-v4.min.js              # Bookmarklet minified production bundle
├── swiggy-hunter-v4.bookmarklet.txt     # Raw javascript:... bookmarklet link
├── .github/
│   └── workflows/
│       └── keyword-hunter.yml           # 9-Worker Parallel Deal Hunter GitHub Actions workflow
├── swiggy-telegram-bot/
│   ├── config.json                      # 379+ Subcategories, 73+ search keywords & campaign configurations
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── bot.js                       # Interactive Telegram bot handler (supports all 9 workers)
│       ├── cron-runner.js               # CLI runner for GitHub Actions & cron jobs
│       ├── dealTracker.js               # Deal state tracking & consecutive suppression
│       ├── userManager.js               # User preferences & threshold persistence
│       ├── swiggyApi.js                 # Swiggy Instamart catalog API & scraper
│       ├── cipher.js                    # Dynamic request headers & device signatures
│       └── notifier.js                  # HTML-formatted Telegram batch alerts
└── README.md                            # Comprehensive project documentation
```

---

## ⚖️ License & Disclaimer

This project is built for personal productivity and deals scouting. It is not affiliated with, endorsed by, or sponsored by Bundl Technologies Private Limited (Swiggy). All brand names and trademarks belong to their respective owners.
