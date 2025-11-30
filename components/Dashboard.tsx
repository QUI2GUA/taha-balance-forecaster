'use client'

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { CalendarView } from '@/components/CalendarView';
import FinancialCharts from '@/components/FinancialCharts';
import ForecastLedger from '@/components/ForecastLedger';
import { generateForecast, SimpleRecurrence, SimpleTransaction } from '@/lib/forecast';
import NoSsr from './NoSsr';

// Define a type for the serialized transaction data from the server
export type SerializedTransaction = {
  id: string;
  accountId: string;
  description: string;
  amount: string;
  startDate: string;
  endDate: string | null;
  frequency: string; // "daily", "weekly", "monthly", "yearly", etc.
  interval: number;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  monthOfYear: number | null;
};

interface DashboardProps {
  startingBalance: number;
  transactions: SerializedTransaction[];
}

// Helper function to map database frequency to the SimpleRecurrence type
const mapFrequencyToRecurrence = (freq: string): SimpleRecurrence => {
  switch (freq.toUpperCase()) {
    case 'WEEKLY':
      return 'WEEKLY';
    case 'BI_WEEKLY':
      return 'BI_WEEKLY';
    case 'MONTHLY':
      return 'MONTHLY';
    case 'QUARTERLY':
      return 'QUARTERLY';
    case 'ANNUALLY':
      return 'ANNUALLY';
    default:
      return 'ONE_TIME';
  }
}

export default function Dashboard({ startingBalance, transactions }: DashboardProps) {
  const [forecastDays, setForecastDays] = useState(90);

  const forecast = useMemo(() => {
    // Convert the serialized server data to the SimpleTransaction format required by the forecast generator
    const simpleTransactions: SimpleTransaction[] = transactions.map(t => ({
      id: t.id,
      title: t.description, // Map description to title
      amount: Number(t.amount),
      startDate: new Date(t.startDate),
      endDate: t.endDate ? new Date(t.endDate) : null,
      recurrence: mapFrequencyToRecurrence(t.frequency) // Map frequency to recurrence enum
    }));

    // Call generateForecast with the correct arguments
    return generateForecast(startingBalance, simpleTransactions, forecastDays);
  }, [transactions, startingBalance, forecastDays]);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Cash Flow Calendar
        </h1>
        <div className="ml-auto">
          <AddTransactionModal>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </AddTransactionModal>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NoSsr>
            <CalendarView 
                forecast={forecast} 
            />
          </NoSsr>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <FinancialCharts 
            forecast={forecast} 
            currentBalance={startingBalance} 
          />
          <ForecastLedger forecast={forecast} />
        </div>
      </main>
    </div>
  );
}
