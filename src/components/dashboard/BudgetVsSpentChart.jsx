import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboardKpis } from '@/hooks/useDashboardKpis';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const formatCurrency = (value) => {
  if (value === undefined || value === null) return 'N/A';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value}`;
};

const BudgetVsSpentChart = () => {
  const { data, isLoading, isError, error } = useDashboardKpis();

  const chartData = [
    {
      name: 'Overall',
      budget: data?.total_budget || 0,
      spent: data?.total_spent || 0,
    },
  ];

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-[250px] w-full" />;
    }

    if (isError) {
      return (
        <Alert variant="destructive" className="h-full">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={formatCurrency} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
            cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
          />
          <Legend iconType="circle" />
          <Bar dataKey="budget" fill="hsl(var(--primary))" name="Total Budget" radius={[4, 4, 0, 0]} />
          <Bar dataKey="spent" fill="hsl(var(--accent))" name="Total Spent" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="p-6 pb-6">
        <CardTitle>Budget vs. Spent</CardTitle>
        <CardDescription>A high-level overview of your project finances.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default BudgetVsSpentChart;