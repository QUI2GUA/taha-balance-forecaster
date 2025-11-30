// app/page.tsx
export const dynamic = 'force-dynamic'

import { ForecastLedger } from '@/components/ForecastLedger';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { FinancialCharts } from '@/components/FinancialCharts';
import prisma from '@/lib/db'; // CORRECT: Import the shared client

export default async function DashboardPage() {
  // 1. Fetch the main account
  // In a real app with Auth, you would filter by userId
  const account = await prisma.account.findFirst() || await prisma.account.create({
    data: { name: "Main Checking", currentBalance: 0 }
  });

  // 2. Fetch all recurring rules
  const transactions = await prisma.transaction.findMany({
    where: { accountId: account.id },
    orderBy: { startDate: 'asc' }
  });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Cash Flow
            </h1>
            <p className="text-muted-foreground">
              Projecting your liquidity for the next 365 days.
            </p>
          </div>
          
          {/* Replaced placeholder button with our new Modal */}
          <AddTransactionModal />
        </div>

        {/* The New Charts Section */}
        <FinancialCharts 
            startingBalance={Number(account.currentBalance)} 
            transactions={transactions} 
        />

        <ForecastLedger 
            startingBalance={Number(account.currentBalance)} 
            transactions={transactions} 
        />
        
      </div>
    </main>
  );
}
