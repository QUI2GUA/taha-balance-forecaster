// lib/forecast.ts

import { Transaction, RecurrenceType } from '@prisma/client';
import { addDays, addWeeks, addMonths, addYears, isSameDay, isAfter, isBefore } from 'date-fns';

export interface ForecastItem {
  date: Date;
  title: String;
  amount: number;
  runningBalance: number;
  isNegative: boolean; // Helper for UI styling (Red alert)
  transactionId: string;
}

// Helper to check if a date matches a recurrence rule
const isOccurrence = (date: Date, txn: Transaction): boolean => {
  const start = new Date(txn.startDate);
  
  // If the date is before the start date, ignore
  if (isBefore(date, start)) return false;
  
  // If the transaction has an end date and we are past it, ignore
  if (txn.endDate && isAfter(date, new Date(txn.endDate))) return false;

  // Check if this specific date was skipped by the user
  const skipped = (txn.skippedDates as string[]) || [];
  if (skipped.some(skipDate => isSameDay(new Date(skipDate), date))) return false;

  // Logic for each recurrence type
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
      return date.getDate() === start.getDate(); // Simplistic monthly logic (watch out for Feb 30th edge cases in prod)
    case 'QUARTERLY':
      // Check if day of month matches AND month diff is divisible by 3
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
  transactions: Transaction[],
  daysToForecast: number = 365
): ForecastItem[] => {
  let currentBalance = startingBalance;
  const forecast: ForecastItem[] = [];
  const today = new Date();

  // Sort transactions by date so one-time items appear correctly order
  // Note: For recurring, we iterate by DAY, so strict array sorting isn't enough.
  
  // We iterate day by day to build the chronological ledger
  for (let i = 0; i < daysToForecast; i++) {
    const currentDate = addDays(today, i);

    // Find all transactions that occur on this specific 'currentDate'
    const dailyTransactions = transactions.filter(txn => isOccurrence(currentDate, txn));

    // If multiple things happen on one day, process them
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
