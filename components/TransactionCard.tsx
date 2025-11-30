// components/TransactionCard.tsx
'use client'

import { format } from 'date-fns';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Ban, MoreHorizontal, TrendingDown, TrendingUp } from 'lucide-react';

import { skipTransaction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { SimpleTransactionOccurrence } from '@/lib/forecast';

interface TransactionCardProps {
  transaction: SimpleTransactionOccurrence;
}

export function TransactionCard({ transaction: item }: TransactionCardProps) {
  const [isPending, startTransition] = useTransition();
  const isIncome = item.amount > 0;

  const handleSkip = () => {
    if (!item.transactionId) return;
    const dateString = format(item.date, 'yyyy-MM-dd');
    startTransition(async () => {
      const result = await skipTransaction(item.transactionId!, dateString);
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
    <div className="relative flex items-center justify-between p-2 rounded-lg bg-card/50 hover:bg-card/90 border border-border shadow-sm transition-all">
      <div className="flex items-center gap-3">
        {isIncome ? (
          <TrendingUp className="h-5 w-5 text-emerald-500" />
        ) : (
          <TrendingDown className="h-5 w-5 text-rose-500" />
        )}
        <span className="font-semibold text-sm truncate">{item.title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn(
          "font-mono text-sm font-semibold",
          isIncome ? "text-emerald-600" : "text-rose-600"
        )}>
          {formatCurrency(Math.abs(item.amount))}
        </span>
        {item.transactionId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleSkip} disabled={isPending} className="text-red-600">
                <Ban className="mr-2 h-4 w-4" />
                Skip Occurrence
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
