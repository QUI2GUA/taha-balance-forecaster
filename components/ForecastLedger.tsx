// components/ForecastLedger.tsx

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Shadcn utility
import { format } from 'date-fns';
import { generateForecast } from '@/lib/forecast'; // The logic we wrote earlier
import { Transaction } from '@prisma/client';

interface ForecastLedgerProps {
  startingBalance: number;
  transactions: Transaction[];
}

export const ForecastLedger = ({ startingBalance, transactions }: ForecastLedgerProps) => {
  // Generate the forecast for the next year
  const forecastData = generateForecast(startingBalance, transactions, 365);

  // Currency formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="w-full h-[800px] flex flex-col shadow-md border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Cash Flow Forecast</CardTitle>
            <div className="text-sm text-muted-foreground">
                Current Balance: <span className="font-mono text-foreground font-medium">{formatCurrency(startingBalance)}</span>
            </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead className="w-[300px]">Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Running Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forecastData.map((item, index) => {
              // Logic to group visually by week or highlight overdrafts
              const isOverdraft = item.runningBalance < 0;
              const isIncome = item.amount > 0;
              
              return (
                <TableRow 
                  key={`${item.transactionId}-${index}`}
                  className={cn(
                    "transition-colors",
                    // If balance < 0, highlight the whole row in light red (dark red in dark mode)
                    isOverdraft 
                      ? "bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <TableCell className="font-medium text-muted-foreground">
                    {format(item.date, 'MMM dd, yyyy')}
                    <div className="text-xs font-normal text-muted-foreground/60">
                        {format(item.date, 'EEEE')}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <span>{item.title}</span>
                        {/* Optional: Add badges for Recurring vs One-time */}
                    </div>
                  </TableCell>
                  
                  <TableCell className={cn(
                    "text-right font-mono tabular-nums",
                    isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-600 dark:text-zinc-400"
                  )}>
                    {isIncome ? "+" : ""}{formatCurrency(item.amount)}
                  </TableCell>
                  
                  <TableCell className={cn(
                    "text-right font-mono font-bold tabular-nums",
                    isOverdraft ? "text-red-600 dark:text-red-400" : "text-foreground"
                  )}>
                    {formatCurrency(item.runningBalance)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
