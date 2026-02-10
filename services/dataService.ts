
import { Transaction, UserSettings, CategoryLimit } from '../types';
import { BASE_CATEGORIES } from '../constants';

const STORAGE_KEYS = {
  TRANSACTIONS: 'fa_transactions',
  SETTINGS: 'fa_settings',
  LOGS: 'fa_logs'
};

export const dataService = {
  // TRANSACTIONS
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },

  saveTransaction: (t: Transaction) => {
    const list = dataService.getTransactions();
    list.push(t);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
  },

  updateTransaction: (updated: Transaction) => {
    const list = dataService.getTransactions();
    const index = list.findIndex(t => t.id === updated.id);
    if (index !== -1) {
      list[index] = updated;
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
    }
  },

  deleteTransaction: (id: string) => {
    const list = dataService.getTransactions();
    const filtered = list.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
  },

  // SETTINGS
  getSettings: (): UserSettings | null => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  },

  saveSettings: (s: UserSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(s));
  },

  // LOGS
  logError: (error: any) => {
    console.error("Agent Error:", error);
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
    logs.push({ timestamp: Date.now(), error: error.message || error });
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(-50)));
  }
};
