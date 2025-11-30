// app/page.tsx
export const dynamic = 'force-dynamic'

import prisma from '@/lib/db';
import Dashboard from '@/components/Dashboard';
import { Transaction } from '@prisma/client';

// Helper function to serialize data
const serializeTransactions = (transactions: Transaction[]) => {
  return transactions.map(t => ({
    ...t,
    amount: t.amount.toString(), // Convert Decimal to string
    startDate: t.startDate.toISOString(), // Convert DateTime to string
    endDate: t.endDate ? t.endDate.toISOString() : null, // Handle optional DateTime
  }));
};

export default async function DashboardPage() {
  // 1. Fetch the main account
  const account = await prisma.account.findFirst() || await prisma.account.create({
    data: { name: "Main Checking", currentBalance: 0 }
  });

  // 2. Fetch all recurring transactions
  const transactions = await prisma.transaction.findMany({
    where: { accountId: account.id },
    orderBy: { startDate: 'asc' }
  });

  // 3. Serialize the data before passing it to the client component
  const serializedTransactions = serializeTransactions(transactions);

  // 4. Render the client-side Dashboard with the serialized data
  return (
    <Dashboard 
      startingBalance={Number(account.currentBalance)} 
      transactions={serializedTransactions} 
    />
  );
}
