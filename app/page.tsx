// app/page.tsx

import { ForecastLedger } from '@/components/ForecastLedger';
import { Transaction, RecurrenceType } from '@prisma/client';

export default async function DashboardPage() {
  // SIMULATED DATABASE CALL
  // In the future, this will be: const transactions = await prisma.transaction.findMany(...)
  
  const mockStartingBalance = 2450.00;
  
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      accountId: 'acc_1',
      title: 'Software Engineer Salary',
      amount: new Prisma.Decimal(3200.00), // Positive income
      startDate: new Date('2023-11-01'), // Started in past
      recurrence: 'BI_WEEKLY', // Every 2 weeks
      endDate: null,
      skippedDates: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      accountId: 'acc_1',
      title: 'Luxury Apartment Rent',
      amount: new Prisma.Decimal(-1800.00), // Negative expense
      startDate: new Date('2023-11-01'),
      recurrence: 'MONTHLY', // 1st of month
      endDate: null,
      skippedDates: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      accountId: 'acc_1',
      title: 'Car Loan',
      amount: new Prisma.Decimal(-450.00),
      startDate: new Date('2023-11-15'),
      recurrence: 'MONTHLY',
      endDate: new Date('2025-01-01'), // Loan ends eventually
      skippedDates: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ] as unknown as Transaction[]; // Casting for mock purposes due to Decimal type

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Cash Flow
            </h1>
            <p className="text-muted-foreground">
              Projecting your liquidity for the next 365 days.
            </p>
          </div>
          
          {/* Action Button Placeholder */}
          <button className="bg-zinc-900 text-white px-4 py-2 rounded-md hover:bg-zinc-800 transition">
            + Add Transaction
          </button>
        </div>

        {/* The Main Ledger */}
        <ForecastLedger 
            startingBalance={mockStartingBalance} 
            transactions={mockTransactions} 
        />
        
      </div>
    </main>
  );
}
