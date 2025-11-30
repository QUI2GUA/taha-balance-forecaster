// components/ForecastLedger.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ForecastEntry, SimpleTransactionOccurrence } from '@/lib/forecast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ForecastLedgerProps {
  forecast: ForecastEntry[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};
  

export default function ForecastLedger({ forecast }: ForecastLedgerProps) {
    const allOccurrences = forecast.flatMap(entry => 
        entry.transactions.map(t => ({...t, date: entry.date}))
    );
  
    return (
    <Card>
      <CardHeader>
        <CardTitle>Forecast Ledger</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allOccurrences.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{format(new Date(item.date), 'MMM d')}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell className={cn(
                    "text-right font-medium",
                    item.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                )}>
                    {formatCurrency(item.amount)}
                </TableCell>
              </TableRow>
            ))}
            {allOccurrences.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center">
                        No upcoming transactions in this forecast period.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
