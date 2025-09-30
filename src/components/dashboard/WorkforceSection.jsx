import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import { Users, UserPlus, DollarSign, PlayCircle } from 'lucide-react';
import { useWorkforceWorkers, usePayrollRuns } from '@/hooks/useWorkforce.js';

const WorkersTable = () => {
    const navigate = useNavigate();
    const { data: workers, isLoading } = useWorkforceWorkers();

    const getStatusVariant = (status) => {
        return status ? 'success' : 'destructive';
    };

    return (
        <Card className="flex flex-col h-full border-l-4 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-500" />
                    <span>Workers</span>
                </CardTitle>
                <CardDescription>A quick look at your current workforce.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : workers?.length > 0 ? (
                            workers.map((worker) => (
                                <TableRow key={worker.id}>
                                    <TableCell className="font-medium">{worker.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{worker.role}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(worker.status)}>{worker.status ? 'Active' : 'Inactive'}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="3" className="text-center h-24">No workers found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <Button className="w-full" variant="secondary" onClick={() => navigate('/dashboard/workers')}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Worker
                </Button>
            </CardFooter>
        </Card>
    );
};

const PayrollTable = () => {
    const navigate = useNavigate();
    const { data: payrolls, isLoading } = usePayrollRuns();

    const getStatusVariant = (status) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'Processing': return 'warning';
            case 'Failed': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <Card className="flex flex-col h-full border-l-4 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    <span>Payroll</span>
                </CardTitle>
                <CardDescription>Summary of recent payroll runs.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Period</TableHead>
                            <TableHead>Total Net</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : payrolls?.length > 0 ? (
                            payrolls.map((run) => (
                                <TableRow key={run.id}>
                                    <TableCell className="font-medium">
                                        {format(new Date(run.period_start), 'MMM d')} - {format(new Date(run.period_end), 'MMM d, yyyy')}
                                        <p className="text-xs text-muted-foreground">Run {formatDistanceToNow(new Date(run.run_date), { addSuffix: true })}</p>
                                    </TableCell>
                                    <TableCell className="font-mono">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(run.total_net)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(run.status)}>{run.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                         ) : (
                            <TableRow>
                                <TableCell colSpan="3" className="text-center h-24">No payroll runs found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" variant="secondary" onClick={() => navigate('/dashboard/payroll')}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Start Payroll Run
                </Button>
            </CardFooter>
        </Card>
    );
};


const WorkforceSection = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Workforce</h2>
            <motion.div
                className="grid gap-6 md:grid-cols-2"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <WorkersTable />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <PayrollTable />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default WorkforceSection;