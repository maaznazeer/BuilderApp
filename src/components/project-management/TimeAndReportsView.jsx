import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Skeleton } from '@/components/ui/skeleton';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
    import { format } from 'date-fns';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { useProjectManagementPermissions } from '@/hooks/useProjectManagementPermissions';
    import { usePlannerWorkflow } from '@/hooks/usePlannerWorkflow';
    import { EyeOff, Timer, BarChart, DollarSign, Package, Users } from 'lucide-react';
    import ReportsView from './ReportsView';
    import TaskCostReport from './reports/TaskCostReport';
    import MaterialUsageReport from './reports/MaterialUsageReport';
    import LaborEfficiencyReport from './reports/LaborEfficiencyReport';
    
    const TimeLogHistory = ({ timeLogs, loading }) => {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Time Log History</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Resource</TableHead>
                                    <TableHead>Task</TableHead>
                                    <TableHead className="text-right">Hours</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : timeLogs.length > 0 ? (
                                    timeLogs.map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell>{format(new Date(log.date), 'MMM d, yyyy')}</TableCell>
                                            <TableCell>{log.resources?.resource_name || 'N/A'}</TableCell>
                                            <TableCell>{log.pm_tasks?.task_name || 'N/A'}</TableCell>
                                            <TableCell className="text-right font-semibold">{log.hours}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">No time logs recorded for this project.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        );
    };
    
    const TimeAndReportsView = ({ projects, selectedProject, setSelectedProject }) => {
        const { toast } = useToast();
        const [timeLogs, setTimeLogs] = useState([]);
        const [loading, setLoading] = useState(false);
        const permissions = useProjectManagementPermissions();
        
        // Use the planner workflow hook for comprehensive data
        const {
            tasks,
            taskMaterials,
            timeLogs: workflowTimeLogs,
            payrollEntries,
            taskAssignments,
            loading: workflowLoading
        } = usePlannerWorkflow(selectedProject);
    
        const fetchTimeLogs = useCallback(async () => {
            if (!selectedProject || !permissions.canLogTime) {
                setTimeLogs([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            const { data, error } = await supabase
                .from('time_logs')
                .select('*, resources(resource_name), pm_tasks!inner(task_name, project_code)')
                .eq('pm_tasks.project_code', selectedProject)
                .order('date', { ascending: false });
    
            if (error) {
                toast({ title: 'Error fetching time logs', variant: 'destructive', description: error.message });
            } else {
                setTimeLogs(data || []);
            }
            setLoading(false);
        }, [selectedProject, toast, permissions.canLogTime]);
    
        useEffect(() => {
            fetchTimeLogs();
        }, [selectedProject, fetchTimeLogs]);
    
        if (!permissions.canRunReports && !permissions.canLogTime) {
            return (
                <Card className="flex flex-col items-center justify-center text-center p-8 h-96">
                    <EyeOff className="h-12 w-12 text-muted-foreground mb-4" />
                    <CardHeader><CardTitle>Permission Denied</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">You do not have permission to view this section.</p></CardContent>
                </Card>
            );
        }
    
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Time & Reports</h2>
                        <p className="text-muted-foreground">Log time and analyze project performance.</p>
                    </div>
                    <Select value={selectedProject || ''} onValueChange={setSelectedProject} disabled={projects.length === 0}>
                        <SelectTrigger className="w-full md:w-[220px]">
                            <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map(p => {
                                const projectId = p.id || p.project_id;
                                return <SelectItem key={projectId} value={projectId}>{p.name}</SelectItem>;
                            })}
                        </SelectContent>
                    </Select>
                </div>
    
                <Tabs defaultValue={permissions.canRunReports ? "reports" : "time-history"} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="reports" disabled={!permissions.canRunReports}>
                            <BarChart className="mr-2 h-4 w-4" /> Reports
                        </TabsTrigger>
                        <TabsTrigger value="task-costs" disabled={!permissions.canRunReports}>
                            <DollarSign className="mr-2 h-4 w-4" /> Task Costs
                        </TabsTrigger>
                        <TabsTrigger value="materials" disabled={!permissions.canRunReports}>
                            <Package className="mr-2 h-4 w-4" /> Materials
                        </TabsTrigger>
                        <TabsTrigger value="time-history" disabled={!permissions.canLogTime}>
                            <Timer className="mr-2 h-4 w-4" /> Time History
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="reports" className="mt-4">
                       {permissions.canRunReports ? (
                            <ReportsView projects={projects} selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
                        ) : <p>You do not have permissions to view reports.</p>}
                    </TabsContent>
                    <TabsContent value="task-costs" className="mt-4">
                       {permissions.canRunReports ? (
                            <div className="space-y-6">
                                <TaskCostReport 
                                    tasks={tasks}
                                    timeLogs={workflowTimeLogs}
                                    taskMaterials={taskMaterials}
                                    payrollEntries={payrollEntries}
                                />
                                <LaborEfficiencyReport 
                                    timeLogs={workflowTimeLogs}
                                    taskAssignments={taskAssignments}
                                    tasks={tasks}
                                    payrollEntries={payrollEntries}
                                />
                            </div>
                        ) : <p>You do not have permissions to view task cost reports.</p>}
                    </TabsContent>
                    <TabsContent value="materials" className="mt-4">
                       {permissions.canRunReports ? (
                            <MaterialUsageReport 
                                taskMaterials={taskMaterials}
                                tasks={tasks}
                            />
                        ) : <p>You do not have permissions to view material reports.</p>}
                    </TabsContent>
                    <TabsContent value="time-history" className="mt-4">
                       {permissions.canLogTime ? (
                            <TimeLogHistory timeLogs={timeLogs} loading={loading} />
                       ) : <p>You do not have permissions to view time history.</p>}
                    </TabsContent>
                </Tabs>
            </motion.div>
        );
    };
    
    export default TimeAndReportsView;