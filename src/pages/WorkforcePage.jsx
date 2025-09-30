import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardShell from '@/components/dashboard/DashboardShell';
import ChartCard from '@/components/dashboard/ChartCard';
import { supabase } from '@/lib/customSupabaseClient';
import { useFX } from '@/contexts/CurrencyProvider';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function WorkforcePage() {
  const { currency } = useFX();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkforceSummary = async () => {
        setLoading(true);
        const { data, error } = await supabase.rpc('workforce_summary', { p_ccy: currency });
        if (error) {
            console.error('Error fetching workforce summary:', error);
            setRows([]);
        } else {
            setRows(data || []);
        }
        setLoading(false);
    };
    fetchWorkforceSummary();
  }, [currency]);

  return (
    <>
        <Helmet>
            <title>Workforce | DomusBuilder</title>
            <meta name="description" content="Monitor your workforce, contractors, and payroll." />
        </Helmet>
        <DashboardShell active="/dashboard/workforce">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="overflow-x-auto rounded-lg border shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-50 dark:bg-neutral-800">
                        <tr className="text-left text-muted-foreground">
                            <th className="p-3 font-medium">Contractor</th>
                            <th className="p-3 font-medium">Workers</th>
                            <th className="p-3 font-medium">Hours (30d)</th>
                            <th className="p-3 font-medium text-right">Payroll Due ({currency})</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i} className="bg-white dark:bg-neutral-900">
                                    <td className="p-3"><div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div></td>
                                    <td className="p-3"><div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div></td>
                                    <td className="p-3"><div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div></td>
                                    <td className="p-3"><div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 ml-auto"></div></td>
                                </tr>
                            ))
                        ) : rows.map(r => (
                            <tr key={r.contractor} className="bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                            <td className="p-3 font-medium">{r.contractor}</td>
                            <td className="p-3">{r.workers}</td>
                            <td className="p-3">{Number(r.hours || 0).toLocaleString()}</td>
                            <td className="p-3 text-right">{Number(r.payroll_due || 0).toLocaleString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <ChartCard title={`Payroll Due by Contractor (${currency})`}>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={rows} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="contractor" width={80} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value) => new Intl.NumberFormat('en').format(value)} />
                            <Legend />
                            <Bar dataKey="payroll_due" name="Payroll Due" fill="#8884d8" />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>
        </DashboardShell>
    </>
  );
}