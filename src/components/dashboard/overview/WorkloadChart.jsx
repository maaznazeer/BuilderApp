import React from 'react';
import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Layers, AlertCircle } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8442ff'];

const fetchWorkloadByStatus = async (projectIds) => {
    if (!projectIds || projectIds.length === 0) return [];
    const { data, error } = await supabase.rpc('get_task_workload_by_status', { p_project_ids: projectIds });
    if (error) throw error;
    return data;
};

const WorkloadChart = () => {
    const { projectIds } = useDashboard();
    const { data: workload, isLoading, isError, error } = useQuery(['workloadByStatus', projectIds], () => fetchWorkloadByStatus(projectIds), {
        enabled: projectIds.length > 0,
    });

    const chartData = workload?.map(item => ({ name: item.status, value: Number(item.task_count) })) || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Workload by Status
                </CardTitle>
                <CardDescription>A visual breakdown of all tasks.</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
                {isLoading && <Skeleton className="h-full w-full" />}
                {isError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                )}
                {!isLoading && !isError && chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                        No tasks to display.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default WorkloadChart;