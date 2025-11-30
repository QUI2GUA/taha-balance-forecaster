// components/FinancialCharts.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ForecastEntry } from '@/lib/forecast';

interface FinancialChartsProps {
  forecast: ForecastEntry[];
  currentBalance: number;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export default function FinancialCharts({ forecast }: FinancialChartsProps) {
  if (!forecast || forecast.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No data available to display charts.</p>
        </CardContent>
      </Card>
    );
  }

  // Find the min and max balance for the Y-axis domain
  const balanceValues = forecast.map(item => item.balance);
  const yMin = Math.min(...balanceValues);
  const yMax = Math.max(...balanceValues);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={forecast}
            margin={{
              top: 5, right: 20, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis 
                domain={[yMin < 0 ? 'dataMin' : 0, 'dataMax']} 
                tickFormatter={formatCurrency}
                width={80}
            />
            <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Balance']}
                labelFormatter={(label) => formatDate(label)}
            />
            <Legend />
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--emerald-500)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--emerald-500)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="var(--emerald-500)" 
                fill="url(#colorBalance)" 
                fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
