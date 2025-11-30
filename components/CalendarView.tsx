'use client'

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  add,
  format,
  getDay,
} from 'date-fns';
import { cn } from '@/lib/utils';
import {TransactionCard} from './TransactionCard'; // Assuming you have this component
import { ForecastEntry } from '@/lib/forecast'; // Import the type
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CalendarViewProps {
  forecast: ForecastEntry[];
}

// Helper to get Tailwind CSS color based on balance
const getBalanceColor = (balance: number, medianBalance: number) => {
    if (balance < 0) return 'text-red-500';
    if (balance < medianBalance * 0.5) return 'text-yellow-500';
    return 'text-emerald-500';
};

export function CalendarView({ forecast }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
    const { days, medianBalance } = useMemo(() => {
        const firstDay = viewMode === 'month' ? startOfMonth(currentDate) : startOfWeek(currentDate);
        const lastDay = viewMode === 'month' ? endOfMonth(currentDate) : endOfWeek(currentDate);
    
        const daysInView = eachDayOfInterval({ start: firstDay, end: lastDay });

        const forecastBalances = forecast.map(f => f.balance);
        const sortedBalances = [...forecastBalances].sort((a, b) => a - b);
        const mid = Math.floor(sortedBalances.length / 2);
        const median = sortedBalances.length % 2 !== 0 ? sortedBalances[mid] : (sortedBalances[mid - 1] + sortedBalances[mid]) / 2;

    
        return {
            days: daysInView.map(day => ({
                date: day,
                forecastEntry: forecast.find(f => isSameDay(new Date(f.date), day)),
            })),
            medianBalance: median,
        }
      }, [currentDate, viewMode, forecast]);

  const goToPrevious = () => {
    setCurrentDate(add(currentDate, { [viewMode === 'month' ? 'months' : 'weeks']: -1 }));
  };

  const goToNext = () => {
    setCurrentDate(add(currentDate, { [viewMode === 'month' ? 'months' : 'weeks']: 1 }));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="flex flex-col h-full">
      {/* Calendar Header */}
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevious}><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" onClick={goToNext}><ChevronRight className="w-4 h-4" /></Button>
            <Button variant="outline" onClick={goToToday}>Today</Button>
        </div>
        <CardTitle className="text-lg font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </CardTitle>
        <ToggleGroup type="single" value={viewMode} onValueChange={(value: 'month' | 'week') => value && setViewMode(value)} size="sm">
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      
      {/* Calendar Grid */}
      <CardContent className="flex-1 grid grid-cols-7 grid-rows-5 gap-1 p-2">
        {/* Weekday Headers */}
        {weekdays.map(day => (
          <div key={day} className="text-center font-medium text-muted-foreground text-sm">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {days.map(({ date, forecastEntry }, index) => (
          <div
            key={index}
            className={cn(
              'border rounded-md p-2 flex flex-col gap-1 overflow-hidden',
              !isSameMonth(date, currentDate) && 'bg-muted/50',
              isSameDay(date, new Date()) && 'bg-primary/10'
            )}
          >
            <span className="font-semibold text-sm">{format(date, 'd')}</span>
            
            {forecastEntry && (
              <div className="flex-1 overflow-y-auto text-xs">
                {/* Daily Balance */}
                <p className={cn("font-bold", getBalanceColor(forecastEntry.balance, medianBalance))}>
                    {forecastEntry.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>

                {/* Individual Transactions for the day */}
                {forecastEntry.transactions.map((trans, i) => (
                   <TransactionCard transaction={trans} key={i} />
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
