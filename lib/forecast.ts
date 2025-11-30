// lib/forecast.ts
import { format, addDays, isAfter, isBefore, isSameDay } from 'date-fns';

// --- NEW, DECOUPLED TYPES ---
// These types are simple, serializable, and have no server-side dependencies.
export type SimpleRecurrence = 
  | "ONE_TIME" 
  | "WEEKLY" 
  | "BI_WEEKLY" 
  | "MONTHLY" 
  | "QUARTERLY" 
  | "ANNUALLY";

export interface SimpleTransaction {
  id: string;
  title: string;
  amount: number;
  startDate: Date;
  recurrence: SimpleRecurrence;
  endDate?: Date | null;
  skippedDates?: string[]; // Make it optional and an array of strings
}

// --- FORECAST LOGIC (UNCHANGED, BUT NOW USES SIMPLE TYPES) ---

export interface ForecastItem {
  date: Date;
  title: String;
  amount: number;
  runningBalance: number;
  isNegative: boolean;
  transactionId: string;
}

// Helper to check if a date matches a recurrence rule
const isOccurrence = (date: Date, txn: SimpleTransaction): boolean => {
  const start = new Date(txn.startDate);
  if (isBefore(date, start)) return false;
  if (txn.endDate && isAfter(date, new Date(txn.endDate))) return false;

  const currentDateString = format(date, 'yyyy-MM-dd');
  if (txn.skippedDates?.includes(currentDateString)) return false;

  const diffTime = date.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  switch (txn.recurrence) {
    case 'ONE_TIME':
      return isSameDay(date, start);
    case 'WEEKLY':
      return diffDays % 7 === 0;
    case 'BI_WEEKLY':
      return diffDays % 14 === 0;
    case 'MONTHLY':
      return date.getDate() === start.getDate();
    case 'QUARTERLY':
      const monthDiff = (date.getFullYear() - start.getFullYear()) * 12 + (date.getMonth() - start.getMonth());
      return date.getDate() === start.getDate() && monthDiff % 3 === 0;
    case 'ANNUALLY':
      return date.getDate() === start.getDate() && date.getMonth() === start.getMonth();
    default:
      return false;
  }
};

export const generateForecast = (
  startingBalance: number,
  transactions: SimpleTransaction[],
  daysToForecast: number = 365
): ForecastItem[] => {
  let currentBalance = startingBalance;
  const forecast: ForecastItem[] = [];
  const today = new Date();

  for (let i = 0; i < daysToForecast; i++) {
    const currentDate = addDays(today, i);
    const dailyTransactions = transactions.filter(txn => isOccurrence(currentDate, txn));

    dailyTransactions.forEach(txn => {
      const amount = Number(txn.amount);
      currentBalance += amount;

      forecast.push({
        date: currentDate,
        title: txn.title,
        amount: amount,
        runningBalance: currentBalance,
        isNegative: currentBalance < 0,
        transactionId: txn.id
      });
    });
  }

  return forecast;
};
