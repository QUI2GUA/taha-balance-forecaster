// app/page.tsx
export const dynamic = 'force-dynamic'

import { AddTransactionModal } from '@/components/AddTransactionModal';
import { CalendarView } from '@/components/CalendarView'; // The new calendar component
import prisma from '@/lib/db';

export default async function DashboardPage() {
  // 1. Fetch the main account
  const account = await prisma.account.findFirst() || await prisma.account.create({
    data: { name: "Main Checking", currentBalance: 0 }
  });

  // 2. Fetch all recurring transactions (the rules)
  const transactions = await prisma.transaction.findMany({
    where: { accountId: account.id },
    orderBy: { startDate: 'asc' }
  });

  return (
    // Use a simpler, full-width layout
    <div className="min-h-screen w-full bg-background flex flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Cash Flow Calendar
        </h1>
        <div className="ml-auto">
            <AddTransactionModal />
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <CalendarView 
            startingBalance={Number(account.currentBalance)} 
            transactions={transactions} 
        />
      </main>
    </div>
  );
}
