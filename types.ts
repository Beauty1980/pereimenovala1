
export type Currency = '₸' | '₽' | 'BYN';
export type TransactionType = 'income' | 'expense';
export type ObligationType = 'Essential' | 'Optional' | 'Impulse';
export type ToneType = 'soft' | 'strict' | 'hard';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  obligation?: ObligationType;
  timestamp: number;
}

export interface CategoryLimit {
  category: string;
  limit: number;
}

export interface UserSettings {
  currency: Currency;
  monthlyIncome: number;
  essentialPayments: number;
  freeBudget: number; // monthlyIncome - essentialPayments
  monthStart: number; // Day of month
  monthEnd: number;
  tone: ToneType;
  limits: CategoryLimit[];
}

export interface ParsingResult {
  date: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  confidence: number;
  needs_clarification: boolean;
  clarification_reason?: 'date' | 'category' | 'type' | 'amount';
}

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  transactions?: ParsingResult[];
  awaitingObligation?: ParsingResult;
  isRedZone?: boolean;
}
