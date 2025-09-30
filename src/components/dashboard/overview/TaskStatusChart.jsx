import React from 'react';
import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart3, AlertCircle } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';

const COLORS = {
    'In Progress': '#3b82f6', // blue-500
    'Not Started': '#6b7280', // gray-500
    'Completed': '#22c55e', // green-500
    'Delayed': '#ef4444',   // red-500
    'Other': '#f97316',     // orange-500
};

const fetchTaskBreakdown = async (scope, projectId, onlyMine) => {
    const { data, error } = await supabase.rpc('get_task_status_breakdown', {
        p_scope: scope,
        p_project_id: projectId,
        p_only_mine: onlyMine
    });

    if (error) throw new Error(error.message);
    return data;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Status
            </span>
            <span className="font-bold text-muted-foreground">
              {label}
            </span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Tasks
            </span>
            <span className="font-bold">
              {payload[0].value}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};


const TaskStatusChart = () => {
    const { scope, selectedProjectId, onlyMine } = useDashboard();
    
    const { data: breakdown, isLoading, isError, error } = useQuery(
        ['taskStatusBreakdown', scope, selectedProjectId, onlyMine],
        () => fetchTaskBreakdown(scope, selectedProjectId, onlyMine),
        {
          enabled: scope === 'global' || (scope === 'project' && !!selectedProjectId)
        }
    );

    const chartData = breakdown?.map(item => ({ label: item.label, value: Number(item.value), fill: COLORS[item.label] || '#A0AEC0' })) || [];

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Task Status
                </CardTitle>
                <CardDescription>A summary of tasks by their current status.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                {isLoading && <Skeleton className="h-full w-full" />}
                {isError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                )}
                {!isLoading && !isError && chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Count', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: '12px', fill: 'hsl(var(--muted-foreground))' } }} />
                            <Tooltip cursor={{fill: 'hsl(var(--muted))', opacity: 0.5}} content={<CustomTooltip />} />
                            <Bar dataKey="value" name="Tasks" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
                 {!isLoading && !isError && chartData.length === 0 && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No tasks to display for the current filter.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TaskStatusChart;