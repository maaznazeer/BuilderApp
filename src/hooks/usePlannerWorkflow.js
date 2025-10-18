import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useTaskMaterials } from './useTaskMaterials';

export const usePlannerWorkflow = (projectCode) => {
    const [tasks, setTasks] = useState([]);
    const [resources, setResources] = useState([]);
    const [timeLogs, setTimeLogs] = useState([]);
    const [payrollEntries, setPayrollEntries] = useState([]);
    const [taskAssignments, setTaskAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Get task materials using the custom hook
    const taskIds = useMemo(() => tasks.map(t => t.task_id), [tasks]);
    const { 
        taskMaterials, 
        addTaskMaterial, 
        updateTaskMaterial, 
        removeTaskMaterial, 
        markMaterialUsed,
        calculateTaskMaterialCost 
    } = useTaskMaterials(taskIds);

    const fetchAllData = useCallback(async () => {
        if (!projectCode) {
            setTasks([]);
            setResources([]);
            setTimeLogs([]);
            setPayrollEntries([]);
            setTaskAssignments([]);
            return;
        }

        setLoading(true);
        try {
            // Fetch tasks
            const { data: tasksData, error: tasksError } = await supabase
                .from('pm_tasks')
                .select('*')
                .eq('project_code', projectCode)
                .order('start_date', { ascending: true });

            if (tasksError) throw tasksError;
            setTasks(tasksData || []);

            // Fetch resources
            const { data: resourcesData, error: resourcesError } = await supabase
                .from('resources')
                .select('*')
                .eq('active', true);

            if (resourcesError) throw resourcesError;
            setResources(resourcesData || []);

            // Fetch time logs for project tasks
            const taskIds = (tasksData || []).map(t => t.task_id);
            if (taskIds.length > 0) {
                const { data: timeLogsData, error: timeLogsError } = await supabase
                    .from('time_logs')
                    .select(`
                        *,
                        resources (resource_name, hourly_rate, type),
                        pm_tasks (task_name, project_code)
                    `)
                    .in('task_id', taskIds);

                if (timeLogsError) throw timeLogsError;
                setTimeLogs(timeLogsData || []);
            }

            // Fetch payroll entries for project
            // Note: payroll_entries.project_code is TEXT, so we need the project code
            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .select('code')
                .eq('id', projectCode)
                .single();

            if (projectError || !projectData) {
                setPayrollEntries([]);
            } else {
                const { data: payrollData, error: payrollError } = await supabase
                    .from('payroll_entries')
                    .select(`
                        *,
                        workers (first_name, surname, trade)
                    `)
                    .eq('project_code', projectData.code);

                if (payrollError) {
                    setPayrollEntries([]);
                } else {
                    setPayrollEntries(payrollData || []);
                }
            }

            // Fetch task assignments
            if (taskIds.length > 0) {
                const { data: assignmentsData, error: assignmentsError } = await supabase
                    .from('task_assignments')
                    .select(`
                        *,
                        resources (resource_name, hourly_rate, type),
                        pm_tasks (task_name, project_code)
                    `)
                    .in('task_id', taskIds);

                if (assignmentsError) throw assignmentsError;
                setTaskAssignments(assignmentsData || []);
            }

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error fetching workflow data',
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    }, [projectCode, toast]);

    // Calculate task costs
    const calculateTaskCost = useCallback((taskId) => {
        const task = tasks.find(t => t.task_id === taskId);
        if (!task) return { estimated: 0, actual: 0, variance: 0 };

        const estimatedLabor = task.estimated_labor_cost || 0;
        const estimatedMaterial = task.estimated_material_cost || 0;
        const estimatedTotal = estimatedLabor + estimatedMaterial;

        const actualLabor = task.actual_labor_cost || 0;
        const actualMaterial = calculateTaskMaterialCost(taskId);
        const actualTotal = actualLabor + actualMaterial;

        return {
            estimated: estimatedTotal,
            actual: actualTotal,
            variance: actualTotal - estimatedTotal,
            estimatedLabor,
            estimatedMaterial,
            actualLabor,
            actualMaterial
        };
    }, [tasks, calculateTaskMaterialCost]);

    // Update actual costs for a task
    const updateActualCosts = useCallback(async (taskId) => {
        try {
            const task = tasks.find(t => t.task_id === taskId);
            if (!task) return;

            // Calculate actual labor cost from time logs
            const taskTimeLogs = timeLogs.filter(tl => tl.task_id === taskId);
            const actualLaborCost = taskTimeLogs.reduce((total, log) => {
                const rate = log.resources?.hourly_rate || 0;
                return total + (log.hours * rate);
            }, 0);

            // Calculate actual material cost
            const actualMaterialCost = calculateTaskMaterialCost(taskId);

            // Update the task
            const { error } = await supabase
                .from('pm_tasks')
                .update({
                    actual_labor_cost: actualLaborCost,
                    actual_material_cost: actualMaterialCost
                })
                .eq('task_id', taskId);

            if (error) throw error;

            // Refresh data
            await fetchAllData();

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error updating task costs',
                description: error.message
            });
        }
    }, [tasks, timeLogs, calculateTaskMaterialCost, fetchAllData, toast]);

    // Get task materials
    const getTaskMaterials = useCallback((taskId) => {
        return taskMaterials.filter(tm => tm.task_id === taskId);
    }, [taskMaterials]);

    // Get task resources
    const getTaskResources = useCallback((taskId) => {
        return taskAssignments
            .filter(ta => ta.task_id === taskId)
            .map(ta => ta.resources)
            .filter(Boolean);
    }, [taskAssignments]);

    // Get resource tasks
    const getResourceTasks = useCallback((resourceId) => {
        return taskAssignments
            .filter(ta => ta.resource_id === resourceId)
            .map(ta => ta.pm_tasks)
            .filter(Boolean);
    }, [taskAssignments]);

    // Calculate resource utilization
    const calculateResourceUtilization = useCallback((resourceId, startDate, endDate) => {
        const resource = resources.find(r => r.resource_id === resourceId);
        if (!resource) return { utilization: 0, totalHours: 0, capacity: 0 };

        const resourceTimeLogs = timeLogs.filter(tl => 
            tl.resource_id === resourceId && 
            new Date(tl.date) >= startDate && 
            new Date(tl.date) <= endDate
        );

        const totalHours = resourceTimeLogs.reduce((sum, log) => sum + (log.hours || 0), 0);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const capacity = days * 8; // Assuming 8 hours per day
        const utilization = capacity > 0 ? (totalHours / capacity) * 100 : 0;

        return { utilization, totalHours, capacity };
    }, [resources, timeLogs]);

    // Generate payroll from time logs
    const generatePayrollFromTimeLogs = useCallback(async (workerCode, startDate, endDate) => {
        try {
            const workerTimeLogs = timeLogs.filter(tl => 
                tl.worker_code === workerCode &&
                new Date(tl.date) >= startDate &&
                new Date(tl.date) <= endDate
            );

            // Group by date and calculate daily totals
            const dailyTotals = {};
            workerTimeLogs.forEach(log => {
                const date = log.date;
                if (!dailyTotals[date]) {
                    dailyTotals[date] = { hours: 0, tasks: [] };
                }
                dailyTotals[date].hours += log.hours || 0;
                if (!dailyTotals[date].tasks.includes(log.task_id)) {
                    dailyTotals[date].tasks.push(log.task_id);
                }
            });

            return Object.entries(dailyTotals).map(([date, data]) => ({
                date,
                hours: data.hours,
                tasks: data.tasks
            }));

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error generating payroll data',
                description: error.message
            });
            return [];
        }
    }, [timeLogs, toast]);

    // Get project summary
    const getProjectSummary = useMemo(() => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const totalEstimatedCost = tasks.reduce((sum, t) => 
            sum + (t.estimated_labor_cost || 0) + (t.estimated_material_cost || 0), 0
        );
        const totalActualCost = tasks.reduce((sum, t) => 
            sum + (t.actual_labor_cost || 0) + (t.actual_material_cost || 0), 0
        );

        return {
            totalTasks,
            completedTasks,
            completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
            totalEstimatedCost,
            totalActualCost,
            variance: totalActualCost - totalEstimatedCost
        };
    }, [tasks]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    return {
        // Data
        tasks,
        resources,
        timeLogs,
        payrollEntries,
        taskAssignments,
        taskMaterials,
        loading,

        // Actions
        addTaskMaterial,
        updateTaskMaterial,
        removeTaskMaterial,
        markMaterialUsed,
        updateActualCosts,
        generatePayrollFromTimeLogs,
        refresh: fetchAllData,

        // Getters
        getTaskMaterials,
        getTaskResources,
        getResourceTasks,
        calculateTaskCost,
        calculateResourceUtilization,
        calculateTaskMaterialCost,

        // Summary
        getProjectSummary
    };
};
