import React, { useState, useEffect, useMemo, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
    import { Progress } from '@/components/ui/progress';
    import { Badge } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { PlusCircle, FileDown, TrendingUp, TrendingDown, AlertTriangle, Wallet, EyeOff, DollarSign, Package, Users } from 'lucide-react';
    import { Skeleton } from '@/components/ui/skeleton';
    import { useProjectManagementPermissions } from '@/hooks/useProjectManagementPermissions';
    import { usePlannerWorkflow } from '@/hooks/usePlannerWorkflow';
    
    const BudgetView = ({ projects, selectedProject, setSelectedProject }) => {
        const { toast } = useToast();
        const [budgetData, setBudgetData] = useState({ budgetLines: [], timeLogs: [], resources: [] });
        const [loading, setLoading] = useState(false);
        const permissions = useProjectManagementPermissions();
        
        // Use the planner workflow hook for comprehensive data
        const {
            tasks,
            taskMaterials,
            timeLogs: workflowTimeLogs,
            payrollEntries,
            taskAssignments,
            calculateTaskCost,
            getProjectSummary,
            loading: workflowLoading
        } = usePlannerWorkflow(selectedProject);
    
        const fetchBudgetData = useCallback(async () => {
            if (!selectedProject || !permissions.canViewBudget) {
                setBudgetData({ budgetLines: [], timeLogs: [], resources: [] });
                setLoading(false);
                return;
            }
            setLoading(true);
            
            const { data: budgetLines, error: budgetError } = await supabase
                .from('budget_lines')
                .select(`*, pm_tasks(task_name)`)
                .eq('project_id', selectedProject);
            
            const { data: timeLogs, error: timeLogError } = await supabase
                .from('time_logs')
                .select(`*, resources(resource_id, hourly_rate, type), pm_tasks!inner(project_code)`)
                .eq('pm_tasks.project_code', selectedProject);
            
            const { data: resources, error: resourcesError } = await supabase.from('resources').select('*');
    
            if (budgetError || timeLogError || resourcesError) {
                toast({ title: 'Error fetching budget data', description: budgetError?.message || timeLogError?.message || resourcesError?.message, variant: 'destructive' });
                setBudgetData({ budgetLines: [], timeLogs: [], resources: [] });
            } else {
                setBudgetData({ budgetLines: budgetLines || [], timeLogs: timeLogs || [], resources: resources || [] });
            }
            setLoading(false);
        }, [selectedProject, toast, permissions.canViewBudget]);
    
        useEffect(() => { fetchBudgetData(); }, [selectedProject, fetchBudgetData]);
    
        const handleFeatureClick = (feature) => {
            toast({ title: '🚧 Feature Not Implemented', description: `The "${feature}" feature is not yet available.` });
        };
        
        const calculatedCosts = useMemo(() => {
            if (!permissions.canViewBudget) return { totalBudget: 0, totalSpent: 0, actualsByTask: {}, actualsByCategory: { Labor: 0, Equipment: 0, Material: 0, Fixed: 0 } };
            
            // Calculate from workflow data
            const costs = { totalBudget: 0, totalSpent: 0, actualsByTask: {}, actualsByCategory: { Labor: 0, Equipment: 0, Material: 0, Fixed: 0 } };
            
            // Calculate estimated costs from tasks
            costs.totalBudget = tasks.reduce((sum, task) => 
                sum + (task.estimated_labor_cost || 0) + (task.estimated_material_cost || 0), 0
            );
            
            // Calculate actual costs from tasks
            tasks.forEach(task => {
                const taskCost = calculateTaskCost(task.task_id);
                costs.actualsByTask[task.task_id] = taskCost.actual;
                costs.actualsByCategory.Labor += taskCost.actualLabor;
                costs.actualsByCategory.Material += taskCost.actualMaterial;
            });
            
            costs.totalSpent = Object.values(costs.actualsByCategory).reduce((sum, val) => sum + val, 0);
            return costs;
        }, [tasks, calculateTaskCost, permissions.canViewBudget]);
    
        const summary = {
            totalBudget: calculatedCosts.totalBudget, totalSpent: calculatedCosts.totalSpent,
            variance: calculatedCosts.totalSpent - calculatedCosts.totalBudget,
            remaining: calculatedCosts.totalBudget - calculatedCosts.totalSpent,
        };
        const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    
        if (!permissions.canViewBudget) {
            return (
                <Card className="flex flex-col items-center justify-center text-center p-8 h-96">
                    <EyeOff className="h-12 w-12 text-muted-foreground mb-4" />
                    <CardHeader><CardTitle>Permission Denied</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">You do not have permission to view budget information.</p></CardContent>
                </Card>
            );
        }
    
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div><h2 className="text-2xl font-bold text-gray-800">Project Budget</h2><p className="text-gray-500">Monitor and manage your project's financial health.</p></div>
                     <div className="flex items-center gap-2">
                        <Button onClick={() => handleFeatureClick("Add Budget Item")} disabled={!permissions.canEditTasks}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
                        <Button variant="outline" onClick={() => handleFeatureClick("Export Budget")} disabled={!permissions.canExport}><FileDown className="mr-2 h-4 w-4" /> Export</Button>
                    </div>
                </div>
                <Card><CardContent className="pt-6"><label htmlFor="project-select" className="font-semibold text-sm mb-2 block">Select Project:</label>
                    <Select value={selectedProject || ''} onValueChange={setSelectedProject} disabled={projects.length === 0}>
                        <SelectTrigger className="w-full md:w-[300px]"><SelectValue placeholder="Select a project" /></SelectTrigger>
                        <SelectContent>{projects.map((project) => {
                            const projectId = project.id || project.project_id;
                            return <SelectItem key={projectId} value={projectId}>{project.name}</SelectItem>;
                        })}</SelectContent>
                    </Select></CardContent></Card>
    
                {loading || workflowLoading ? (
                    <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
                        </div>
                        <Skeleton className="h-96" />
                    </div>
                ) : selectedProject ? (
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">
                                <Wallet className="mr-2 h-4 w-4" /> Overview
                            </TabsTrigger>
                            <TabsTrigger value="tasks">
                                <DollarSign className="mr-2 h-4 w-4" /> Task Costs
                            </TabsTrigger>
                            <TabsTrigger value="categories">
                                <Package className="mr-2 h-4 w-4" /> Categories
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground"/>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatCurrency(summary.totalBudget)}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                                        <TrendingDown className="h-4 w-4 text-muted-foreground"/>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatCurrency(summary.totalSpent)}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Variance</CardTitle>
                                        <AlertTriangle className="h-4 w-4 text-muted-foreground"/>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${summary.variance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                            {formatCurrency(summary.variance)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
                                        <Wallet className="h-4 w-4 text-muted-foreground"/>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatCurrency(summary.remaining)}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Project Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold">{getProjectSummary.totalTasks}</div>
                                            <div className="text-sm text-muted-foreground">Total Tasks</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{getProjectSummary.completedTasks}</div>
                                            <div className="text-sm text-muted-foreground">Completed</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{getProjectSummary.completionRate.toFixed(1)}%</div>
                                            <div className="text-sm text-muted-foreground">Completion Rate</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{getProjectSummary.variance > 0 ? '+' : ''}{formatCurrency(getProjectSummary.variance)}</div>
                                            <div className="text-sm text-muted-foreground">Variance</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="tasks" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Task-Level Cost Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Task Name</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Estimated</TableHead>
                                                <TableHead className="text-right">Actual</TableHead>
                                                <TableHead className="text-right">Variance</TableHead>
                                                <TableHead>Progress</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {tasks.map(task => {
                                                const taskCost = calculateTaskCost(task.task_id);
                                                return (
                                                    <TableRow key={task.task_id}>
                                                        <TableCell className="font-medium">
                                                            {task.task_name}
                                                            {task.is_milestone && (
                                                                <Badge variant="outline" className="ml-2">Milestone</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'}>
                                                                {task.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(taskCost.estimated)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(taskCost.actual)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className={taskCost.variance > 0 ? 'text-red-600' : 'text-green-600'}>
                                                                {formatCurrency(taskCost.variance)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Progress value={task.percent_complete || 0} className="w-[100px]" />
                                                                <span className="text-xs text-muted-foreground">
                                                                    {task.percent_complete || 0}%
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="categories" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cost Breakdown by Category</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Category</TableHead>
                                                <TableHead className="text-right">Budgeted</TableHead>
                                                <TableHead className="text-right">Actual</TableHead>
                                                <TableHead className="text-right">Variance</TableHead>
                                                <TableHead>Progress</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.entries(calculatedCosts.actualsByCategory).map(([category, actual]) => {
                                                const budgeted = category === 'Labor' || category === 'Material' 
                                                    ? tasks.reduce((sum, task) => {
                                                        const taskCost = calculateTaskCost(task.task_id);
                                                        return sum + (category === 'Labor' ? taskCost.estimatedLabor : taskCost.estimatedMaterial);
                                                    }, 0)
                                                    : 0;
                                                const variance = actual - budgeted;
                                                const progress = budgeted > 0 ? (actual / budgeted) * 100 : 0;
                                                
                                                return (
                                                    <TableRow key={category}>
                                                        <TableCell>
                                                            <Badge variant="outline">{category}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(budgeted)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(actual)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className={variance > 0 ? 'text-red-600' : 'text-green-600'}>
                                                                {formatCurrency(variance)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Progress value={progress} className="w-[100px]" />
                                                                <span className="text-xs text-muted-foreground">
                                                                    {Math.round(progress)}%
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed">
                        <h3 className="text-lg font-semibold text-gray-800">No Project Selected</h3>
                        <p className="text-gray-500 mt-2">Please select a project from the dropdown to view its budget.</p>
                    </div>
                )}
            </motion.div>
        );
    };
    
    export default BudgetView;