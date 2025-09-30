import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardShell from '@/components/dashboard/DashboardShell';
import ChartCard from '@/components/dashboard/ChartCard';
import { supabase } from '@/lib/customSupabaseClient';
import { useFX } from '@/contexts/CurrencyProvider';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export default function FinancialsPage() {
  const { currency } = useFX();
  const [cash, setCash] = useState([]);
  const [spend, setSpend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const cashPromise = supabase.rpc('cash_flow_monthly', { p_ccy: currency });
      const spendPromise = supabase.rpc('spend_by_category', { p_ccy: currency });
      
      const [cashResult, spendResult] = await Promise.all([cashPromise, spendPromise]);

      if (cashResult.error) console.error('Error fetching cash flow:', cashResult.error);
      if (spendResult.error) console.error('Error fetching spend data:', spendResult.error);

      setCash(cashResult.data || []);
      setSpend(spendResult.data || []);
      setLoading(false);
    };

    fetchData();
  }, [currency]);

  return (
    <>
      <Helmet>
        <title>Financials | DomusBuilder</title>
        <meta name="description" content="Analyze your project financials, cash flow, and spending." />
      </Helmet>
      <DashboardShell active="/dashboard/financials">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title={`Cash Flow (monthly, ${currency})`}>
            <div className="h-72">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cash}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => new Intl.NumberFormat('en').format(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#16a34a" name="Income" />
                    <Line type="monotone" dataKey="expense" stroke="#dc2626" name="Expense" />
                    <Line type="monotone" dataKey="net" stroke="#2563eb" name="Net" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
          <ChartCard title={`Spend by Category (YTD, ${currency})`}>
            <div className="h-72">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip formatter={(value) => new Intl.NumberFormat('en').format(value)} />
                    <Legend />
                    <Bar dataKey="total" name="Total Spend" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
        </div>
      </DashboardShell>
    </>
  );
}