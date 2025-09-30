import React from 'react';
import { useAiTasks } from '@/hooks/useAiHub';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const RecentAIJobs = () => {
    const { data: tasks, isLoading, error } = useAiTasks();

    const getStatusVariant = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'success';
            case 'processing': return 'default';
            case 'failed': return 'destructive';
            case 'queued': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6" />
                    Recent AI Jobs
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task Type</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Initiated</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-4 w-28 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                        {error && (
                             <TableRow>
                                <TableCell colSpan="4" className="text-center text-red-500 py-8">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle className="h-8 w-8" />
                                        <span>Error loading AI jobs.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && tasks?.map(task => (
                            <TableRow key={task.id}>
                                <TableCell className="font-medium">{task.kind}</TableCell>
                                <TableCell>{task.projects?.name || 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(task.status)}>
                                        {task.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground text-sm">
                                    {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                                </TableCell>
                            </TableRow>
                        ))}
                         {!isLoading && tasks?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan="4" className="text-center text-muted-foreground py-8">
                                    No AI jobs have been run yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default RecentAIJobs;