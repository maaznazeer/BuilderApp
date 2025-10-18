import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const TaskList = ({ tasks }) => (
    <ScrollArea className="h-96">
        <div className="space-y-2 pr-4">
            {tasks.length > 0 ? (
                tasks.map(task => (
                    <div key={task.task_id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
                        <p className="font-semibold">{task.task_name}</p>
                        <p className="text-sm text-muted-foreground">
                            {format(new Date(task.start_date), 'MMM d')} - {format(new Date(task.end_date), 'MMM d, yyyy')}
                        </p>
                        <Badge variant={task.status === 'Completed' ? 'success' : 'secondary'} className="mt-1">{task.status}</Badge>
                    </div>
                ))
            ) : (
                <p className="text-muted-foreground text-sm text-center pt-8">No tasks assigned.</p>
            )}
        </div>
    </ScrollArea>
);

const TimeLogList = ({ logs }) => (
    <ScrollArea className="h-96">
        <div className="space-y-2 pr-4">
            {logs.length > 0 ? (
                logs.map(log => (
                    <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
                        <div className="flex justify-between items-center">
                           <p className="font-semibold">{log.pm_tasks?.task_name || 'Unlinked Task'}</p>
                           <span className="font-bold">{log.hours} hrs</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{format(new Date(log.date), 'MMM d, yyyy')}</p>
                        {log.notes && <p className="text-sm mt-1 italic">"{log.notes}"</p>}
                    </div>
                ))
            ) : (
                <p className="text-muted-foreground text-sm text-center pt-8">No time logs recorded.</p>
            )}
        </div>
    </ScrollArea>
);


const ResourceDetailPanel = ({ resource }) => {
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [timeLogs, setTimeLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        if (!resource) return;
        setLoading(true);

        const { data: assignmentsData, error: assignmentsError } = await supabase
            .from('task_assignments')
            .select('pm_tasks(*)')
            .eq('resource_id', resource.resource_id);

        if (assignmentsError) {
            toast({ variant: 'destructive', title: 'Error fetching assigned tasks', description: assignmentsError.message });
        } else {
            setAssignedTasks(assignmentsData.map(a => a.pm_tasks).filter(Boolean));
        }

        const { data: logsData, error: logsError } = await supabase
            .from('time_logs')
            .select('*, pm_tasks(task_name)')
            .eq('resource_id', resource.resource_id)
            .order('date', { ascending: false });

        if (logsError) {
            toast({ variant: 'destructive', title: 'Error fetching time logs', description: logsError.message });
        } else {
            setTimeLogs(logsData);
        }

        setLoading(false);
    }, [resource, toast]);

    useEffect(() => {
        if(resource) fetchData();
    }, [resource, fetchData]);


    if (!resource) {
        return (
            <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center p-6">
                    <p className="text-muted-foreground">Select a resource to see details</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>{resource.resource_name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : (
                    <Tabs defaultValue="tasks" className="w-full h-full flex flex-col">
                        <TabsList>
                            <TabsTrigger value="tasks">Assigned Tasks ({assignedTasks.length})</TabsTrigger>
                            {/* <TabsTrigger value="timelogs">Time Logs ({timeLogs.length})</TabsTrigger> */}
                        </TabsList>
                        <TabsContent value="tasks" className="mt-4 flex-grow">
                            <TaskList tasks={assignedTasks} />
                        </TabsContent>
                        <TabsContent value="timelogs" className="mt-4 flex-grow">
                            <TimeLogList logs={timeLogs} />
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    );
};

export default ResourceDetailPanel;