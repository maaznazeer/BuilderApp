import React from 'react';
import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Layers, AlertCircle } from 'lucide-react';
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

const TasksStatus = () => {
    const { scope, selectedProjectId, onlyMine } = useDashboard();
    
    const { data: breakdown, isLoading, isError, error } = useQuery(
        ['taskStatusBreakdown', scope, selectedProjectId, onlyMine],
        () => fetchTaskBreakdown(scope, selectedProjectId, onlyMine),
        {
          enabled: scope === 'global' || (scope === 'project' && !!selectedProjectId)
        }
    );

    const chartData = breakdown?.map(item => ({ name: item.label, value: Number(item.value) })) || [];

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Task Status (Pie)
                </CardTitle>
                <CardDescription>A visual summary of task statuses.</CardDescription>
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
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#A0AEC0'} />
                                ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                background: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                              }}
                            />
                            <Legend />
                        </PieChart>
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

export default TasksStatus;