
import { Currency } from './types';

export const BASE_CATEGORIES = [
  "Продукты",
  "Транспорт",
  "Подарки",
  "Образование",
  "Домашнее хозяйство",
  "Здоровье",
  "Красота и уход за собой",
  "Подписки",
  "Коммуналка",
  "Кредиты/рассрочки",
  "Дети (садик/кружки/школа)",
  "Одежда",
  "Другое"
];

export const COLORS = {
  primary: "#007AFF", // Apple Blue
  background: "#000B1E", // Electric Cobalt Dark
  panel: "rgba(15, 23, 42, 0.8)",
  accent: "#38BDF8",
  danger: "#EF4444",
  success: "#10B981"
};

export const STRICT_THRESHOLDS: Record<Currency, number> = {
  '₸': 5000,
  '₽': 1000,
  'BYN': 0 // No strict threshold defined in requirement, using 0 for bypass
};

export function getLocalDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getDaysRemaining(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate() + 1;
}
