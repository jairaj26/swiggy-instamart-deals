const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Compact deal format:
 * Product Name
 * MRP: ₹X | Price: ₹Y | Z% OFF
 * Click here (direct search link)
 */
function formatCompactItem(deal, index = null) {
  const directUrl = deal.itemLink || deal.searchLink || `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(deal.name)}`;
  const safeUrl = directUrl.replace(/"/g, '%22');
  const num = index !== null ? `${index}. ` : '• ';

  return (
`${num}<b>${escapeHtml(deal.name)}</b>
MRP: ₹${deal.mrp} | Price: ₹${deal.price} | <b>${deal.discount}% OFF</b>
<a href="${safeUrl}">Click here</a>`
  );
}

function formatDealMessage(deal) {
  return formatCompactItem(deal);
}

async function sendDealAlert(bot, chatId, deal) {
  const text = formatCompactItem(deal);

  try {
    await bot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    return true;
  } catch (err) {
    console.error('[Notifier] Failed to send alert for:', deal.name, err.message);
    return false;
  }
}

/**
 * Clubs deals together into consolidated messages (one message per worker),
 * chunking only if character length exceeds Telegram's 4096 character limit.
 */
async function sendBatchAlerts(bot, chatId, deals, options = {}) {
  if (!deals || !deals.length) return;
  console.log(`[Notifier] Sending ${deals.length} deals in consolidated message(s) to chat ${chatId}…`);

  const timeTag = options.timeString ? ` • ${options.timeString}` : '';
  const headerTag = options.workerInfo
    ? `<b>[${options.workerInfo} • ${deals.length} Found${timeTag}]</b>\n\n`
    : `<b>[Instamart Deals • ${deals.length} Found${timeTag}]</b>\n\n`;

  const messages = [];
  let currentMsg = headerTag;

  for (let i = 0; i < deals.length; i++) {
    const itemText = formatCompactItem(deals[i], i + 1) + '\n\n';

    // Leave a safe margin below Telegram's 4096 character limit
    if ((currentMsg + itemText).length > 3800) {
      messages.push(currentMsg.trim());
      currentMsg = itemText;
    } else {
      currentMsg += itemText;
    }
  }

  if (currentMsg.trim()) {
    messages.push(currentMsg.trim());
  }

  for (let i = 0; i < messages.length; i++) {
    try {
      await bot.sendMessage(chatId, messages[i], {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
    } catch (err) {
      console.error('[Notifier] Failed to send batch message:', err.message);
    }
    if (i < messages.length - 1) {
      await sleep(1000);
    }
  }
}

module.exports = {
  formatCompactItem,
  formatDealMessage,
  sendDealAlert,
  sendBatchAlerts
};
