// components/FinancialCharts.tsx
'use client'

import * as React from "react"
import { format, startOfWeek } from "date-fns"
import { 
  Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, 
  Pie, PieChart, Cell, Legend
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// --- CORRECTED IMPORT --- 
// We now import the SIMPLE, serializable type, not the Prisma type.
import { generateForecast, SimpleTransaction } from "@/lib/forecast"


interface FinancialChartsProps {
  startingBalance: number;
  // This now uses the simple, decoupled type.
  transactions: SimpleTransaction[];
}

export function FinancialCharts({ startingBalance, transactions }: FinancialChartsProps) {
  // 1. Generate Raw Data (90 days)
  const forecast = React.useMemo(() => 
    generateForecast(startingBalance, transactions, 90), 
  [startingBalance, transactions]);

  // 2. Data Prep: Stacked Weekly Data
  const weeklyData = React.useMemo(() => {
    const weeks: Record<string, { name: string; income: number; expense: number }> = {};
    
    forecast.forEach(item => {
      const weekStart = format(startOfWeek(item.date), "MMM dd");
      if (!weeks[weekStart]) {
        weeks[weekStart] = { name: weekStart, income: 0, expense: 0 };
      }
      if (item.amount > 0) weeks[weekStart].income += item.amount;
      else weeks[weekStart].expense += Math.abs(item.amount); // Store as positive for stacking
    });

    return Object.values(weeks);
  }, [forecast]);

  // 3. Data Prep: Recurrence Pie Data
  const recurrenceData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach(t => {
      const label = t.recurrence.replace("_", " ");
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [transactions]);

  // Chart Configuration
  const chartConfig = {
    balance: {
      label: "Balance",
      color: "hsl(var(--chart-1))",
    },
    income: {
      label: "Income",
      color: "hsl(var(--emerald-500))",
    },
    expense: {
      label: "Expense",
      color: "hsl(var(--red-500))",
    },
  } satisfies ChartConfig

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Financial Projections</CardTitle>
        <CardDescription>
          Visualizing your liquidity over the next 3 months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trend" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trend">Trend (Line)</TabsTrigger>
            <TabsTrigger value="net">Daily Net (Bar)</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Flow (Stacked)</TabsTrigger>
            <TabsTrigger value="distribution">Distribution (Pie)</TabsTrigger>
          </TabsList>

          {/* 1. LINE CHART (Running Balance) */}
          <TabsContent value="trend" className="h-[300px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={forecast}>
                <defs>
                  <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => format(new Date(value), "MMM dd")}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="line"/>} />
                <Area 
                  dataKey="runningBalance" 
                  type="monotone" 
                  fill="url(#fillBalance)" 
                  fillOpacity={0.4} 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </TabsContent>

          {/* 2. BAR CHART (Daily Net) */}
          <TabsContent value="net" className="h-[300px] w-full">
             <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={forecast}>
                <CartesianGrid vertical={false} />
                <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), "MMM dd")}
                    minTickGap={32}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                    dataKey="amount" 
                    fill="hsl(var(--chart-2))" 
                    radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ChartContainer>
          </TabsContent>

          {/* 3. STACKED BAR (Weekly) */}
          <TabsContent value="weekly" className="h-[300px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={weeklyData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {/* Income Bar */}
                <Bar dataKey="income" stackId="a" fill="var(--emerald-500)" radius={[0, 0, 4, 4]} />
                {/* Expense Bar */}
                <Bar dataKey="expense" stackId="a" fill="var(--red-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </TabsContent>

           {/* 4. PIE CHART (Recurrence Types) */}
           <TabsContent value="distribution" className="h-[300px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full mx-auto aspect-square max-h-[300px]">
              <PieChart>
                <Pie 
                    data={recurrenceData} 
                    dataKey="value" 
                    nameKey="name" 
                    innerRadius={60} 
                    strokeWidth={5}
                >
                    {recurrenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                    ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
              </PieChart>
            </ChartContainer>
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  )
}
