import React from 'react';
import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Bot } from 'lucide-react';
import { format } from 'date-fns';

const fetchAiLog = async () => {
    const { data, error } = await supabase
        .from('ai_tasks')
        .select(`
            id,
            kind,
            status,
            created_at,
            result_summary,
            projects ( name )
        `)
        .order('created_at', { ascending: false })
        .limit(100);
    if (error) throw new Error(error.message);
    return data;
};

const AiLogTable = () => {
    const { data: tasks, isLoading, error } = useQuery('ai_log', fetchAiLog);

    const getStatusVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'success';
            case 'processing': return 'default';
            case 'failed': return 'destructive';
            case 'queued': return 'secondary';
            default: return 'outline';
        }
    };

    const renderSummary = (summary) => {
        if (!summary) return 'N/A';
        return Object.entries(summary)
            .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
            .join('; ');
    };

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead className="text-right">Timestamp</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-40 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                    {error && (
                         <TableRow>
                            <TableCell colSpan="5" className="text-center text-red-500 py-12">
                                <div className="flex flex-col items-center gap-2">
                                    <AlertCircle className="h-8 w-8" />
                                    <span>Error loading AI log.</span>
                                    <span className="text-sm">{error.message}</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && tasks?.map(task => (
                        <TableRow key={task.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <Bot className="h-4 w-4 text-primary" />
                                {task.kind}
                            </TableCell>
                            <TableCell>{task.projects?.name || 'N/A'}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(task.status)}>
                                    {task.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground truncate max-w-sm">
                                {renderSummary(task.result_summary)}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground text-sm">
                                {format(new Date(task.created_at), 'yyyy-MM-dd HH:mm:ss')}
                            </TableCell>
                        </TableRow>
                    ))}
                     {!isLoading && tasks?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan="5" className="text-center text-muted-foreground py-12">
                                <div className="flex flex-col items-center gap-2">
                                    <Bot className="h-8 w-8" />
                                    <p>No AI jobs have been run yet.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default AiLogTable;