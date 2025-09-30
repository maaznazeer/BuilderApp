import React from 'react';
import { useQuery } from 'react-query';
import { useDashboard } from '@/contexts/DashboardContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/dashboard/overview/DataTable';
import { toast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';

const fetchUrgentTasks = async ({ queryKey }) => {
  const [, scope, selectedProjectId, windowDays, statusFilter, onlyMine] = queryKey;
  const { data, error } = await supabase.rpc('list_tasks_due', {
    p_scope: scope,
    p_project_id: selectedProjectId,
    p_window_days: windowDays,
    p_status_filter: statusFilter,
    p_only_mine: onlyMine, // Pass the new parameter
  });

  if (error) {
    toast({
      title: 'Error fetching tasks',
      description: error.message,
      variant: 'destructive',
    });
    throw new Error(error.message);
  }
  return data;
};

const UrgentTasks = () => {
  const { scope, selectedProjectId, windowDays, statusFilter, onlyMine, taskTableColumns } = useDashboard();

  const { data: tasks, isLoading, error } = useQuery(
    ['urgentTasks', scope, selectedProjectId, windowDays, statusFilter, onlyMine],
    fetchUrgentTasks,
    {
      enabled: scope === 'global' || (scope === 'project' && !!selectedProjectId),
      onError: (err) => {
        console.error("Failed to fetch urgent tasks:", err);
      },
    }
  );

  const handleRowAction = (action, row) => {
    if (action === 'view') {
      toast({
        title: '🚧 Feature not implemented',
        description: `Viewing task ${row.name} is not implemented yet—but don't worry! You can request it in your next prompt! 🚀`,
      });
    }
  };

  const availableColumns = [
    { label: "Project", value: "project_name" },
    { label: "Status", value: "status" }
  ];

  return (
    <>
      <Helmet>
        <title>Urgent Tasks | Hostinger Horizons</title>
        <meta name="description" content="View and manage your urgent tasks and project deadlines." />
      </Helmet>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Due Tasks (This Week & Overdue)</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <DataTable
            data={tasks || []}
            columns={taskTableColumns}
            isLoading={isLoading}
            error={error}
            toolbar={{
              showColumnToggle: true,
              availableColumns: availableColumns,
              tableId: 'urgentTasksTable'
            }}
            onRowAction={handleRowAction}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default UrgentTasks;