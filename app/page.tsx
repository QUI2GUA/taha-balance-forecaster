// app/page.tsx
export const dynamic = 'force-dynamic'

import prisma from '@/lib/db';
import Dashboard from '@/components/Dashboard'; // Import the new Dashboard client component

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

  // 3. Render the client-side Dashboard, passing in the server-fetched data
  return (
    <Dashboard 
      startingBalance={Number(account.currentBalance)} 
      transactions={transactions} 
    />
  );
}
