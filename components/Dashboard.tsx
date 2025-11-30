'use client'

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { CalendarView } from '@/components/CalendarView';
import { Transaction } from '@prisma/client'; // Import the Transaction type

interface DashboardProps {
  startingBalance: number;
  transactions: Transaction[];
}

export default function Dashboard({ startingBalance, transactions }: DashboardProps) {
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
      <main className="flex-1 p-4 md:p-6">
        <CalendarView 
            startingBalance={startingBalance} 
            transactions={transactions} 
        />
      </main>
    </div>
  );
}
