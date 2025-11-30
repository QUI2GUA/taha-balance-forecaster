// components/ForecastLedger.tsx
'use client'

import React, { useTransition } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Ban, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { toast } from "sonner";

import { SimpleTransaction, generateForecast } from '@/lib/forecast';
import { skipTransaction } from '@/app/actions';

interface ForecastLedgerProps {
  startingBalance: number;
  transactions: SimpleTransaction[];
}

export const ForecastLedger = ({ startingBalance, transactions }: ForecastLedgerProps) => {
  const [isPending, startTransition] = useTransition();

  const forecastData = React.useMemo(() => 
    generateForecast(startingBalance, transactions, 365), 
  [startingBalance, transactions]);

  const handleSkip = (transactionId: string, date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    
    startTransition(async () => {
      const result = await skipTransaction(transactionId, dateString);
      if (result.success) {
        toast.success("Transaction occurrence skipped.");
      } else {
        toast.error(result.error || "Failed to skip transaction.");
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Card className="w-full h-[800px] flex flex-col shadow-sm border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Cash Flow Forecast</CardTitle>
            <div className="text-sm text-muted-foreground">
                Current Balance: <span className="font-mono text-foreground font-medium">{formatCurrency(startingBalance)}</span>
            </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-y-auto relative">
        {isPending && (
            <div className="absolute inset-0 bg-background/50 z-20 flex items-center justify-center">
                <span className="text-sm text-muted-foreground animate-pulse">Updating forecast...</span>
            </div>
        )}

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
              <TrendingUp className="w-12 h-12 text-emerald-400 mb-4" />
              <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Your Forecast Awaits</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                  Add your first transaction to project your financial future.
              </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecastData.map((item, index) => {
                const isOverdraft = item.runningBalance < 0;
                const isIncome = item.amount > 0;
                
                return (
                  <TableRow 
                    key={`${item.transactionId}-${index}`}
                    className={cn("transition-colors group", isOverdraft ? "bg-red-50 dark:bg-red-950/30" : "")}
                  >
                    <TableCell className="font-medium text-muted-foreground text-sm">
                      {format(item.date, 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell className={cn(
                      "text-right font-mono",
                      isIncome ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-600 dark:text-zinc-400"
                    )}>
                      {isIncome ? "+" : ""}{formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-mono font-semibold",
                      isOverdraft ? "text-red-600 dark:text-red-500" : "text-foreground"
                    )}>
                      {formatCurrency(item.runningBalance)}
                    </TableCell>
                    <TableCell>
                       {item.transactionId && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600 dark:focus:text-red-400"
                                  onClick={() => handleSkip(item.transactionId, item.date)}
                                  disabled={isPending}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Skip Occurrence
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                       )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
