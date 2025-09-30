import React from 'react';
import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useDashboard } from '@/contexts/DashboardContext';
import DataTable from '@/components/dashboard/overview/DataTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const fetchMyTasksDue = async (scope, projectId, windowDays, onlyMine) => {
  const { data, error } = await supabase.rpc('list_tasks_due', {
    p_scope: scope,
    p_project_id: projectId,
    p_window_days: windowDays,
    p_only_mine: onlyMine,
  });
  if (error) throw new Error(error.message);
  return data;
};

const MyUrgentTasks = () => {
    const { scope, selectedProjectId, urgentTasksWindowDays, onlyMine } = useDashboard();

    const { data: myTasksDue, isLoading, error } = useQuery(
        ['myTasksDue', scope, selectedProjectId, urgentTasksWindowDays, onlyMine],
        () => fetchMyTasksDue(scope, selectedProjectId, urgentTasksWindowDays, onlyMine),
        {
            refetchOnWindowFocus: false,
        }
    );

    const columnsConfig = [
      { header: "Name", accessor: "name" },
      { header: "Project", accessor: "project_name" },
      { header: "Due date", accessor: "due_date", format: "date:YYYY-MM-DD" },
      { header: "Priority", accessor: "priority" }
    ];

    const rowActions = [
      { "type": "navigate", "label": "Open", "to": "/dashboard/tasks/:id", "params": { "id": "{{row.id}}" } }
    ];

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <AlertTriangle className="mr-2 text-red-500" />
                        My Tasks Due (This Week & Overdue)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <AlertTriangle className="mr-2 text-red-500" />
                         My Tasks Due (This Week & Overdue)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-red-500">Error loading tasks: {error.message}</div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <DataTable 
            data={myTasksDue} 
            columns={columnsConfig} 
            rowActions={rowActions}
            title="My Tasks Due (This Week & Overdue)"
        />
    );
};

export default MyUrgentTasks;