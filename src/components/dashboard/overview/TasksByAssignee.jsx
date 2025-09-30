import React from 'react';
import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDashboard } from '@/contexts/DashboardContext';

const fetchTasksByAssignee = async (projectIds) => {
    if (!projectIds || projectIds.length === 0) return [];
    const { data, error } = await supabase.rpc('get_tasks_by_assignee', { p_project_ids: projectIds });
    if (error) throw error;
    return data;
};

const TasksByAssignee = () => {
    const { projectIds } = useDashboard();
    const { data: assignees, isLoading, isError, error } = useQuery(['tasksByAssignee', projectIds], () => fetchTasksByAssignee(projectIds), {
      enabled: projectIds.length > 0,
    });
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Tasks by Assignee
                </CardTitle>
                <CardDescription>Overview of task distribution.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[250px]">
                    <div className="space-y-4">
                        {isLoading && Array(4).fill(0).map((_, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                        {isError && (
                          <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Error</AlertTitle>
                              <AlertDescription>{error.message}</AlertDescription>
                          </Alert>
                        )}
                        {!isLoading && !isError && assignees?.map(assignee => (
                            <div key={assignee.assignee_id} className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={assignee.avatar_url} />
                                    <AvatarFallback>{assignee.full_name ? assignee.full_name.charAt(0) : 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{assignee.full_name || 'Unassigned'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {assignee.open_tasks} open, {assignee.completed_this_week} done this week
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold">{assignee.total_tasks}</p>
                                    <p className="text-xs text-muted-foreground">Total</p>
                                </div>
                            </div>
                        ))}
                        {!isLoading && !isError && (!assignees || assignees.length === 0) && (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No assigned tasks found.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default TasksByAssignee;