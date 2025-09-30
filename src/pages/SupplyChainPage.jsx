import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { supabase } from '@/lib/customSupabaseClient';
import { useFX } from '@/contexts/CurrencyProvider';
import { Skeleton } from '@/components/ui/skeleton';

export default function SupplyChainPage() {
  const { currency } = useFX();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryStatus = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('inventory_status', { p_ccy: currency });
      if (error) {
        console.error('Error fetching inventory status:', error);
        setRows([]);
      } else {
        setRows(data || []);
      }
      setLoading(false);
    };
    fetchInventoryStatus();
  }, [currency]);

  return (
    <>
      <Helmet>
        <title>Supply Chain | DomusBuilder</title>
        <meta name="description" content="Monitor your supply chain, inventory status, and material movements." />
      </Helmet>
      <DashboardShell active="/dashboard/supply-chain">
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr className="text-left text-muted-foreground">
                <th className="p-3 font-medium">Material Category</th>
                <th className="p-3 font-medium">Received</th>
                <th className="p-3 font-medium">Issued</th>
                <th className="p-3 font-medium">In Stock</th>
                <th className="p-3 font-medium text-right">Stock Value ({currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="bg-white dark:bg-neutral-900">
                    <td className="p-3"><Skeleton className="h-4 w-3/4" /></td>
                    <td className="p-3"><Skeleton className="h-4 w-1/2" /></td>
                    <td className="p-3"><Skeleton className="h-4 w-1/2" /></td>
                    <td className="p-3"><Skeleton className="h-4 w-1/2" /></td>
                    <td className="p-3 text-right"><Skeleton className="h-4 w-3/4 ml-auto" /></td>
                  </tr>
                ))
              ) : rows.map(r => (
                <tr key={r.material_category} className="bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="p-3 font-medium">{r.material_category}</td>
                  <td className="p-3">{Number(r.qty_received || 0).toLocaleString()}</td>
                  <td className="p-3">{Number(r.qty_issued || 0).toLocaleString()}</td>
                  <td className="p-3">{Number(r.qty_in_stock || 0).toLocaleString()}</td>
                  <td className="p-3 text-right">{Number(r.stock_value || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardShell>
    </>
  );
}