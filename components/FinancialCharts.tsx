// components/FinancialCharts.tsx
'use client'

import * as React from "react"
import { format, startOfWeek } from "date-fns"
import { 
  Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, 
  Pie, PieChart, Cell, Legend, Sector
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
import { SimpleTransaction, generateForecast } from "@/lib/forecast"

// --- (Props and Data Generation - No changes here) ---
interface FinancialChartsProps {
  startingBalance: number;
  transactions: SimpleTransaction[];
}

// --- Active Pie Sector --- (For improved Pie Chart)
const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`Count ${value}`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`(Rate ${(percent * 100).toFixed(2)}%)`}
            </text>
        </g>
    );
};


export function FinancialCharts({ startingBalance, transactions }: FinancialChartsProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const onPieEnter = React.useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, [setActiveIndex]);

  const forecast = React.useMemo(() => 
    generateForecast(startingBalance, transactions, 90), 
  [startingBalance, transactions]);

  const weeklyData = React.useMemo(() => {
    const weeks: Record<string, { name: string; income: number; expense: number }> = {};
    forecast.forEach(item => {
      const weekStart = format(startOfWeek(item.date), "MMM dd");
      if (!weeks[weekStart]) {
        weeks[weekStart] = { name: weekStart, income: 0, expense: 0 };
      }
      if (item.amount > 0) weeks[weekStart].income += item.amount;
      else weeks[weekStart].expense += Math.abs(item.amount); // Store as positive
    });
    return Object.values(weeks);
  }, [forecast]);

  const recurrenceData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach(t => {
      const label = t.recurrence.replace("_", " ");
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [transactions]);

  const chartConfig = {
    balance: { label: "Balance", color: "hsl(var(--chart-1))" },
    income: { label: "Income", color: "hsl(var(--chart-2))" },
    expense: { label: "Expense", color: "hsl(var(--chart-3))" },
  } satisfies ChartConfig

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Financial Projections</CardTitle>
        <CardDescription>Visualizing your liquidity over the next 3 months.</CardDescription>
      </CardHeader>
      <CardContent>
         {transactions.length === 0 ? (
          <div className="h-[350px] flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">No Transactions Yet</h3>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Add your first transaction to see your financial forecast.
                </p>
          </div>
        ) : (
        <Tabs defaultValue="trend" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trend">Trend</TabsTrigger>
            <TabsTrigger value="net">Daily Net</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Flow</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          {/* 1. LINE CHART (Running Balance) */}
          <TabsContent value="trend" className="h-[350px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={forecast} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                 <defs>
                  <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-balance)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-balance)" stopOpacity={0.1}/>
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
                <ChartTooltip content={<ChartTooltipContent indicator="line" labelFormatter={(label) => format(new Date(label), "PPP")} />} />
                <Area 
                  dataKey="runningBalance" 
                  type="natural" 
                  fill="url(#fillBalance)" 
                  stroke="var(--color-balance)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          </TabsContent>

          {/* 2. BAR CHART (Daily Net) */}
          <TabsContent value="net" className="h-[350px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={forecast} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(new Date(value), "MMM dd")}
                        minTickGap={32}
                        tickLine={false}
                        axisLine={false}
                    />
                    <ChartTooltip 
                        content={<ChartTooltipContent indicator="rect" labelFormatter={(label) => format(new Date(label), "PPP")} />}
                    />
                    <Bar 
                        dataKey="amount" 
                        radius={[4, 4, 0, 0]} 
                        fill="hsl(var(--chart-2))"
                    />
                </BarChart>
            </ChartContainer>
        </TabsContent>


          {/* 3. STACKED BAR (Weekly) */}
          <TabsContent value="weekly" className="h-[350px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent indicator="rect"/>} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="income" stackId="a" fill="var(--color-income)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="expense" stackId="a" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </TabsContent>

           {/* 4. PIE CHART (Recurrence Types) */}
           <TabsContent value="distribution">
                <ChartContainer config={chartConfig} className="w-full h-[350px]">
                    <PieChart >
                        <Pie 
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={recurrenceData} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={120} 
                            innerRadius={80} 
                            fill="hsl(var(--chart-1))" 
                            onMouseEnter={onPieEnter}
                        >
                            {recurrenceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                            ))}
                        </Pie>
                         <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                </ChartContainer>
            </TabsContent>
        </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
