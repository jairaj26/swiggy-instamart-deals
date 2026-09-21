# 🤖 Swiggy Instamart Deal Hunter (Telegram Bot)

The Telegram bot component of the [Swiggy Instamart Deal Hunter Suite](../README.md).

For complete documentation, architecture diagrams, and setup instructions, please see the [Main Project README](../README.md).

---

## 🚀 Run 24/7 for Free on GitHub Actions (No Server Needed)
You do not need to keep your computer running to get deal alerts!
1. **Fork this repo** to your GitHub account.
2. Follow the 5-step setup guide in the [Main README](../README.md#-run-your-own-247-deal-hunter-bot-free-on-github-actions).
3. Add your Telegram Bot credentials and Swiggy Store IDs in **Settings → Secrets and variables → Actions**.
4. GitHub Actions will automatically run 5 parallel workers every hour between 10:00 AM and 10:00 PM IST (+ Wednesday Bazaar at midnight) completely free and send alerts directly to your Telegram!

---

## 💬 Interactive Telegram Bot Commands

When running the interactive bot (`npm start`):

| Command | Description |
| :--- | :--- |
| `/start` | Welcome message and command overview |
| `/store` | View your store or see instructions on how to get your Primary & Secondary Store IDs |
| `/store <primaryId> [secId]` | Set your local dark store pod IDs (e.g. `/store 1400216 1231805`) |
| `/setdiscount` | View or adjust alert threshold for each of the 5 parallel workers (with preset chips & worker picker) |
| `/setdiscount <worker> <percent>` | Directly set a worker's threshold (e.g. `/setdiscount essentials 65`) |
| `/myinfo` | View your configured Dark Store IDs and active worker thresholds |
| `/status` | View bot status, cache stats, and automated 5-worker scan schedules |
| `/categories` | Scan all subcategories in any grocery aisle for deals ≥ 50% OFF on demand |
| `/bazaar` | Scan Wednesday Bazaar Top Deals on demand |

---

## ⚡ Quick CLI Commands

```bash
# Install dependencies
npm install

# Test Worker 1: Daily Essentials & Fresh (36 aisles, ≥ 60% OFF)
npm run test:essentials

# Test Worker 2: Sweets, Snacks & Treats (40 aisles, ≥ 70% OFF)
npm run test:treats

# Test Worker 3: Lifestyle, Home & Fashion (20 aisles, ≥ 85% OFF)
npm run test:lifestyle

# Test Worker 4: Cold Drinks, Beverages & Spreads (30 aisles, ≥ 70% OFF)
npm run test:beverages

# Test Worker 5: Personal Care, Baby & Laundry (28 aisles, ≥ 70% OFF)
npm run test:personal

# Test Wednesday Bazaar Deals (Runs automatically at 12:00 AM on Wednesdays)
npm run test:bazaar

# Start interactive bot polling daemon
npm start
```

## ⚙️ Environment Variables

Create `.env` based on `.env.example`:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
MIN_DISCOUNT_PERCENT=70

# Dark Store Pod IDs (swiggy.com/instamart -> click any Category -> check URL for store IDs)
SWIGGY_STORE_ID=your_store_id_here
SWIGGY_PRIMARY_STORE_ID=your_store_id_here
SWIGGY_SECONDARY_STORE_ID=your_secondary_store_id_or_blank

# Optional: Per-worker custom thresholds
ESSENTIALS_MIN_DISCOUNT=60
TREATS_MIN_DISCOUNT=70
LIFESTYLE_MIN_DISCOUNT=85
BEVERAGES_MIN_DISCOUNT=70
PERSONAL_MIN_DISCOUNT=70
```

