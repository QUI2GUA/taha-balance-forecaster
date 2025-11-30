// components/CalendarView.tsx
'use client'

import * as React from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth,
  addWeeks, subWeeks, isSameDay 
} from 'date-fns';
import { 
  SimpleTransaction, generateForecast, SimpleTransactionOccurrence 
} from '@/lib/forecast';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TransactionCard } from './TransactionCard';
import { useMediaQuery } from '@/hooks/use-media-query';
import { AddTransactionModal } from './AddTransactionModal'; // Import the modal

interface CalendarViewProps {
  startingBalance: number;
  transactions: SimpleTransaction[];
}

const WEEK_START = 0; // Sunday

export function CalendarView({ startingBalance, transactions }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [view, setView] = React.useState('month'); // 'month' or 'week'
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handlePrev = () => {
    setCurrentDate(view === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    setCurrentDate(view === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1));
  };

  const handleViewChange = (newView: string) => {
    if (newView) setView(newView);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // --- Calendar Grid Generation ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: WEEK_START });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: WEEK_START });

  const startDate = view === 'month' ? startOfWeek(monthStart, { weekStartsOn: WEEK_START }) : weekStart;
  const endDate = view === 'month' ? endOfWeek(monthEnd, { weekStartsOn: WEEK_START }) : weekEnd;

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // --- Forecast & Data Grouping ---
  const forecast = React.useMemo(() => 
    generateForecast(startingBalance, transactions, (days.length + 1)), 
  [startingBalance, transactions, days.length]);

  const dailyData = React.useMemo(() => {
    const data: Record<string, { items: SimpleTransactionOccurrence[], balance: number }> = {};
    forecast.forEach(item => {
      const dayKey = format(item.date, 'yyyy-MM-dd');
      if (!data[dayKey]) {
        data[dayKey] = { items: [], balance: item.runningBalance };
      }
      data[dayKey].items.push(item);
      data[dayKey].balance = item.runningBalance; // Update with the last balance of the day
    });
    return data;
  }, [forecast]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev} className="h-8 w-8 md:h-9 md:w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl md:text-2xl font-bold text-foreground whitespace-nowrap">
            {format(currentDate, view === 'month' ? 'MMMM yyyy' : 'MMM d, yyyy')}
          </h2>
          <Button variant="outline" size="icon" onClick={handleNext} className="h-8 w-8 md:h-9 md:w-9">
            <ChevronRight className="h-4 w-4" />
          </Button>
           <Button variant="outline" onClick={() => setCurrentDate(new Date())} className="ml-4 hidden md:block">
            Today
          </Button>
        </div>
        <ToggleGroup type="single" value={view} onValueChange={handleViewChange} size={isDesktop ? 'default' : 'sm'}>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 flex-1 border-t border-l border-border rounded-lg overflow-hidden">
        {/* Weekday Headers */}
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center font-semibold text-muted-foreground border-b border-r border-border text-sm bg-muted/20 hidden md:block">
            {day}
          </div>
        ))}

        {/* Day Cells */}
        {days.map((day, index) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const data = dailyData[dayKey];
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={index}
              className={cn(
                "relative flex flex-col min-h-[120px] md:min-h-[160px] p-2 border-b border-r border-border bg-background transition-colors duration-150 group",
                !isCurrentMonth && view === 'month' ? "bg-muted/30 text-muted-foreground" : "",
                isToday ? "bg-blue-50 dark:bg-blue-950/30" : ""
              )}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={cn(
                  "font-semibold text-sm",
                  isToday ? "text-blue-600 dark:text-blue-300" : ""
                )}>
                  {format(day, 'd')}
                </span>
                 {data && (
                   <span className="font-mono text-xs text-muted-foreground">
                     {formatCurrency(data.balance)}
                   </span>
                 )}
              </div>
              <div className="flex-1 space-y-1 overflow-y-auto">
                {data?.items.map((item, itemIndex) => (
                  <TransactionCard key={itemIndex} item={item} />
                ))}
              </div>
              {/* Wrap the button in the modal, passing the day as the defaultDate */}
              <AddTransactionModal defaultDate={day}>
                <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="h-4 w-4" />
                </Button>
              </AddTransactionModal>
            </div>
          )
        })}
      </div>
    </div>
  );
}
