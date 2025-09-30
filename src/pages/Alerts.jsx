import React, { useEffect, useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { supabase } from '@/lib/customSupabaseClient';
import { Helmet } from 'react-helmet-async';

export default function Alerts(){
  const [sev, setSev] = useState([]);
  const [list, setList] = useState([]);

  useEffect(()=>{
    const fetchAlerts = async () => {
      const { data: sevData, error: sevError } = await supabase.rpc('alerts_open');
      if (sevError) {
        console.error('Error fetching open alerts by severity:', sevError);
        // Optionally show a toast notification for error
      } else {
        setSev(sevData || []);
      }

      const { data: listData, error: listError } = await supabase.from('alerts').select('id, category, severity, status, message, created_at').order('created_at', { ascending:false });
      if (listError) {
        console.error('Error fetching alerts list:', listError);
        // Optionally show a toast notification for error
      } else {
        setList(listData || []);
      }
    };
    fetchAlerts();
  },[]);

  return (
    <>
      <Helmet>
        <title>Alerts Dashboard | DomusBuilder</title>
        <meta name="description" content="View and manage all open alerts and notifications across your projects." />
      </Helmet>
      <DashboardShell active="/dashboard/alerts">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border p-4">
            <div className="mb-2 text-sm font-medium text-muted-foreground">Open by severity</div>
            <ul className="space-y-2">
              {sev.map(s => (
                <li key={s.severity} className="flex items-center justify-between rounded-xl border p-3">
                  <span className="capitalize">{s.severity}</span>
                  <span className="text-2xl font-semibold">{s.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2 rounded-2xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="p-2">Severity</th><th className="p-2">Category</th><th className="p-2">Message</th><th className="p-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {list.map(a => (
                  <tr key={a.id} className="border-t">
                    <td className="p-2 capitalize">{a.severity}</td>
                    <td className="p-2">{a.category}</td>
                    <td className="p-2">{a.message || '—'}</td>
                    <td className="p-2">{new Date(a.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardShell>
    </>
  );
}