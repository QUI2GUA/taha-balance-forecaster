// app/actions.ts
'use server'

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// Define the validation schema matching our form
const transactionSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  startDate: z.date(),
  recurrence: z.enum([
    "ONE_TIME", "WEEKLY", "BI_WEEKLY", "MONTHLY", 
    "BI_MONTHLY", "QUARTERLY", "ANNUALLY"
  ]),
});

export async function createTransaction(formData: z.infer<typeof transactionSchema>) {
  // 1. Calculate final amount (flip sign for expense)
  const finalAmount = formData.type === 'EXPENSE' 
    ? -formData.amount 
    : formData.amount;

  // 2. Insert into DB
  // Note: We are hardcoding accountId for now since we haven't built Auth yet.
  // In a real app, you'd get the user's Account ID here.
  
  // Find or create a default account for the demo
  const account = await prisma.account.findFirst() || await prisma.account.create({
    data: { name: "Main Checking", currentBalance: 2000 }
  });

  await prisma.transaction.create({
    data: {
      accountId: account.id,
      title: formData.title,
      amount: finalAmount,
      startDate: formData.startDate,
      recurrence: formData.recurrence,
    }
  });

  // 3. Revalidate the dashboard so the new data shows up instantly
  revalidatePath('/');
  
  return { success: true };
}

export async function skipTransaction(transactionId: string, dateString: string) {
  // 1. Find the transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId }
  });

  if (!transaction) throw new Error("Transaction not found");

  // 2. Get existing skipped dates safely
  const existingSkipped = (transaction.skippedDates as string[]) || [];

  // 3. Add new date if not already present
  if (!existingSkipped.includes(dateString)) {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        skippedDates: [...existingSkipped, dateString]
      }
    });
  }

  // 4. Update the UI
  revalidatePath('/');
}
