import React from 'react';
    import { Helmet } from 'react-helmet-async';
    import { useSearchParams, Link } from 'react-router-dom';
    import { useQuery } from 'react-query';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useDashboard } from '@/contexts/DashboardContext';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Skeleton } from '@/components/ui/skeleton';
    import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
    import { Badge } from '@/components/ui/badge';
    import { AlertCircle, ChevronRight, ListTodo, Loader, CheckCircle } from 'lucide-react';
    import { format } from 'date-fns';
    import { motion } from 'framer-motion';

    const fetchTasksByStatus = async (projectIds, status) => {
        if (!projectIds || projectIds.length === 0) return [];

        let query = supabase
            .from('tasks')
            .select('id, title, due_date, priority, status, project_id, projects(name)')
            .in('project_id', projectIds);

        if (status === 'Unassigned') {
            query = query.is('assigned_to', null).neq('status', 'Done');
        } else if (status === 'Done') {
            query = query.eq('status', 'Done');
        } else if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query.order('due_date', { ascending: true });

        if (error) throw error;
        return data;
    };

    const TasksPage = () => {
        const [searchParams] = useSearchParams();
        const status = searchParams.get('status') || 'All';
        const { projectIds } = useDashboard();

        const { data: tasks, isLoading, isError, error } = useQuery(
            ['tasks', status, projectIds],
            () => fetchTasksByStatus(projectIds, status),
            { enabled: projectIds.length > 0 }
        );

        const getPriorityVariant = (priority) => {
            switch (priority?.toLowerCase()) {
                case 'high': return 'destructive';
                case 'medium': return 'secondary';
                case 'low': return 'outline';
                default: return 'outline';
            }
        };

        const getStatusIcon = (statusParam) => {
            switch (statusParam) {
                case 'Unassigned': return <ListTodo className="w-6 h-6 text-gray-500" />;
                case 'In Progress': return <Loader className="w-6 h-6 text-blue-500 animate-spin" />;
                case 'Done': return <CheckCircle className="w-6 h-6 text-green-500" />;
                default: return <ListTodo className="w-6 h-6 text-gray-500" />;
            }
        };
        
        const getPageTitle = (statusParam) => {
             switch (statusParam) {
                case 'Unassigned': return 'Unassigned Tasks';
                case 'In Progress': return 'In Progress Tasks';
                case 'Done': return 'Completed Tasks';
                default: return 'All Tasks';
            }
        }

        const pageTitle = getPageTitle(status);

        return (
            <>
                <Helmet>
                    <title>{pageTitle} | DomusBuilder</title>
                    <meta name="description" content={`View all tasks with status: ${status}`} />
                </Helmet>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-4 sm:p-6 lg:p-8"
                >
                    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                        <Link to="/dashboard/overview" className="hover:text-foreground">Dashboard</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="font-semibold text-foreground">Tasks</span>
                    </nav>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                {getStatusIcon(status)}
                                <CardTitle className="text-2xl">{pageTitle}</CardTitle>
                            </div>
                            <CardDescription>A list of all tasks with the status "{status}".</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Task</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading && Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                        </TableRow>
                                    ))}
                                    {isError && (
                                        <TableRow>
                                            <TableCell colSpan="5">
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertTitle>Error</AlertTitle>
                                                    <AlertDescription>{error.message}</AlertDescription>
                                                </Alert>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {!isLoading && !isError && tasks?.map(task => (
                                        <TableRow key={task.id}>
                                            <TableCell className="font-medium">
                                                <Link to={`/dashboard/projects/${task.project_id}?tab=milestones`} className="hover:underline">
                                                    {task.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{task.projects?.name || 'N/A'}</TableCell>
                                            <TableCell>{task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                                            <TableCell><Badge variant={getPriorityVariant(task.priority)}>{task.priority || 'Medium'}</Badge></TableCell>
                                            <TableCell><Badge variant="secondary">{task.status}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                    {!isLoading && !isError && (!tasks || tasks.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan="5" className="text-center h-24 text-muted-foreground">
                                                No tasks found with this status.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>
            </>
        );
    };

    export default TasksPage;