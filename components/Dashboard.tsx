'use client'

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { CalendarView } from '@/components/CalendarView';
import FinancialCharts from '@/components/FinancialCharts';
import ForecastLedger from '@/components/ForecastLedger';
import { generateForecast } from '@/lib/forecast';
import { Transaction } from '@prisma/client';

interface DashboardProps {
  startingBalance: number;
  transactions: Transaction[];
}

export default function Dashboard({ startingBalance, transactions }: DashboardProps) {
  const [forecastDays, setForecastDays] = useState(90);

  const forecast = useMemo(() => {
    return generateForecast(transactions, startingBalance, forecastDays);
  }, [transactions, startingBalance, forecastDays]);

  const onAddTransaction = () => {
    // In a real app, you would likely trigger a re-fetch of the transactions
    // For this example, we'll just log to the console
    console.log("Transaction added, need to re-fetch and re-generate forecast");
  };

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
        {/* Main Content: Calendar */}
        <div className="lg:col-span-2">
            <CalendarView 
                forecast={forecast} 
            />
        </div>

        {/* Sidebar */}
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