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
import { MoreHorizontal, Ban } from "lucide-react"; // Icons
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

// --- CORRECTED IMPORT --- 
// We now import the SIMPLE, serializable type, not the Prisma type.
import { generateForecast, SimpleTransaction } from '@/lib/forecast';

import { skipTransaction } from '@/app/actions'; // Import the action
import { toast } from "sonner";

interface ForecastLedgerProps {
  startingBalance: number;
  // This now uses the simple, decoupled type.
  transactions: SimpleTransaction[];
}

export const ForecastLedger = ({ startingBalance, transactions }: ForecastLedgerProps) => {
  const [isPending, startTransition] = useTransition();

  // Generate the forecast
  const forecastData = generateForecast(startingBalance, transactions, 365);

  const handleSkip = (transactionId: string, date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    
    startTransition(async () => {
      try {
        await skipTransaction(transactionId, dateString);
        console.log("Skipped occurrence on " + dateString);
      } catch (e) {
        console.error("Failed to skip", e);
      }
    });
  };

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
      
      <CardContent className="p-0 flex-1 overflow-auto relative">
        {isPending && (
            <div className="absolute inset-0 bg-background/50 z-50 flex items-center justify-center">
                <span className="text-sm text-muted-foreground animate-pulse">Updating forecast...</span>
            </div>
        )}

        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead className="w-[300px]">Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Running Balance</TableHead>
              <TableHead className="w-[50px]"></TableHead> {/* Actions Column */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {forecastData.map((item, index) => {
              const isOverdraft = item.runningBalance < 0;
              const isIncome = item.amount > 0;
              
              return (
                <TableRow 
                  key={`${item.transactionId}-${index}`}
                  className={cn(
                    "transition-colors group",
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
                    <span className="font-medium">{item.title}</span>
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

                  {/* ACTION MENU */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleSkip(item.transactionId, item.date)}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Skip this occurrence
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
