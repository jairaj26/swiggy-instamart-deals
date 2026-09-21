const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

function ensureDataDir() {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadUsers() {
  ensureDataDir();
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

function saveUsers(users) {
  ensureDataDir();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('[UserManager] Error saving users:', e.message);
  }
}

const DEFAULT_WORKER_DISCOUNTS = {
  essentials: 60,
  treats: 70,
  lifestyle: 85,
  beverages: 70,
  personalCare: 70
};

function getUser(chatId, defaultConfig = {}) {
  const users = loadUsers();
  const user = users[String(chatId)] || {};
  return {
    chatId: String(chatId),
    storeId: user.storeId || defaultConfig.sid || '',
    primaryStoreId: user.primaryStoreId || defaultConfig.pid || '',
    secondaryStoreId: user.secondaryStoreId || defaultConfig.secid || '',
    minDiscount: user.minDiscount || defaultConfig.minDiscount || 70,
    workerDiscounts: {
      ...DEFAULT_WORKER_DISCOUNTS,
      ...(user.workerDiscounts || {})
    }
  };
}

function updateUser(chatId, partialData) {
  const users = loadUsers();
  const id = String(chatId);
  const existing = users[id] || { chatId: id };
  const mergedWorkerDiscounts = partialData.workerDiscounts
    ? { ...(existing.workerDiscounts || DEFAULT_WORKER_DISCOUNTS), ...partialData.workerDiscounts }
    : (existing.workerDiscounts || DEFAULT_WORKER_DISCOUNTS);

  users[id] = {
    ...existing,
    ...partialData,
    workerDiscounts: mergedWorkerDiscounts,
    updatedAt: Date.now()
  };
  saveUsers(users);
  return users[id];
}

function getAllUsers() {
  const users = loadUsers();
  return Object.values(users);
}

module.exports = {
  DEFAULT_WORKER_DISCOUNTS,
  getUser,
  updateUser,
  getAllUsers
};
