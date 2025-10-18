import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ProgressReport from './reports/ProgressReport';
import WorkloadReport from './reports/WorkloadReport';
import BudgetReport from './reports/BudgetReport';
import { useProjectManagementPermissions } from '@/hooks/useProjectManagementPermissions';
import { EyeOff } from 'lucide-react';

const ReportsView = ({ projects, selectedProject, setSelectedProject }) => {
    const { toast } = useToast();
    const [reportData, setReportData] = useState({ tasks: [], timeLogs: [], budgetLines: [], resources: [] });
    const [loading, setLoading] = useState(false);
    const permissions = useProjectManagementPermissions();

    const fetchReportData = useCallback(async () => {
        if (!selectedProject || !permissions.canRunReports) {
            setReportData({ tasks: [], timeLogs: [], budgetLines: [], resources: [] });
            return;
        }
        setLoading(true);

        const { data: tasksData, error: tasksError } = await supabase.from('pm_tasks').select('*').eq('project_code', selectedProject);
        if (tasksError) { setLoading(false); toast({ title: 'Error fetching tasks', variant: 'destructive', description: tasksError.message }); return; }

        const taskIds = tasksData.map(t => t.task_id);
        const [timeLogsRes, budgetLinesRes, resourcesRes] = await Promise.all([
            taskIds.length > 0 ? supabase.from('time_logs').select('*, resources(resource_id, hourly_rate, type, resource_name)').in('task_id', taskIds) : Promise.resolve({ data: [], error: null }),
            supabase.from('budget_lines').select('*').eq('project_id', selectedProject),
            supabase.from('resources').select('*')
        ]);

        if (timeLogsRes.error || budgetLinesRes.error || resourcesRes.error) {
            toast({ title: 'Error fetching report data', variant: 'destructive' });
        } else {
            setReportData({
                tasks: tasksData || [], timeLogs: timeLogsRes.data || [],
                budgetLines: budgetLinesRes.data || [], resources: resourcesRes.data || [],
            });
        }
        setLoading(false);
    }, [selectedProject, toast, permissions.canRunReports]);

    useEffect(() => { fetchReportData(); }, [selectedProject, fetchReportData]);

    if (!permissions.canRunReports) {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-8 h-96">
                <EyeOff className="h-12 w-12 text-muted-foreground mb-4" />
                <CardHeader><CardTitle>Permission Denied</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">You do not have permission to view reports.</p></CardContent>
            </Card>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div><h2 className="text-2xl font-bold">Project Reports</h2><p className="text-muted-foreground">Analyze project performance and resource allocation.</p></div>
                <Select value={selectedProject || ''} onValueChange={setSelectedProject} disabled={projects.length === 0}>
                    <SelectTrigger className="w-full md:w-[220px]"><SelectValue placeholder="Select a project" /></SelectTrigger>
                    <SelectContent>{projects.map(p => {
                        const projectId = p.id || p.project_id;
                        return <SelectItem key={projectId} value={projectId}>{p.name}</SelectItem>;
                    })}</SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Skeleton className="h-64" /><Skeleton className="h-64" /><Skeleton className="h-64 col-span-1 lg:col-span-2" /></div>
            ) : !selectedProject ? (
                <Card className="text-center py-16"><CardHeader><CardTitle>No Project Selected</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Please select a project to view reports.</p></CardContent></Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="reports-container">
                    <ProgressReport tasks={reportData.tasks} canExport={permissions.canExport} />
                    <WorkloadReport timeLogs={reportData.timeLogs} resources={reportData.resources} canExport={permissions.canExport} />
                    <div className="lg:col-span-2">
                        <BudgetReport budgetLines={reportData.budgetLines} timeLogs={reportData.timeLogs} canExport={permissions.canExport} canViewBudget={permissions.canViewBudget} />
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ReportsView;