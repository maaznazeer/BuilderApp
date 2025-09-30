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
    import { PlusCircle, FileDown, TrendingUp, TrendingDown, AlertTriangle, Wallet, EyeOff } from 'lucide-react';
    import { Skeleton } from '@/components/ui/skeleton';
    import { useProjectManagementPermissions } from '@/hooks/useProjectManagementPermissions';
    
    const BudgetView = ({ projects, selectedProject, setSelectedProject }) => {
        const { toast } = useToast();
        const [budgetData, setBudgetData] = useState({ budgetLines: [], timeLogs: [], resources: [] });
        const [loading, setLoading] = useState(false);
        const permissions = useProjectManagementPermissions();
    
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
            const costs = { totalBudget: 0, totalSpent: 0, actualsByTask: {}, actualsByCategory: { Labor: 0, Equipment: 0, Material: 0, Fixed: 0 } };
            costs.totalBudget = budgetData.budgetLines.reduce((sum, item) => sum + (item.total_cost || 0), 0);
            budgetData.timeLogs.forEach(log => {
                const rate = log.resources?.hourly_rate || 0;
                const cost = log.hours * rate;
                const category = log.resources?.type === 'Person' ? 'Labor' : 'Equipment';
                if (category === 'Labor' || category === 'Equipment') {
                    costs.actualsByCategory[category] += cost;
                    if (log.task_id) {
                        if (!costs.actualsByTask[log.task_id]) { costs.actualsByTask[log.task_id] = 0; }
                        costs.actualsByTask[log.task_id] += cost;
                    }
                }
            });
            budgetData.budgetLines.forEach(line => {
                if (line.category === 'Material' || line.category === 'Fixed') { costs.actualsByCategory[line.category] += line.total_cost || 0; }
            });
            costs.totalSpent = Object.values(costs.actualsByCategory).reduce((sum, val) => sum + val, 0);
            return costs;
        }, [budgetData, permissions.canViewBudget]);
    
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
                        <SelectContent>{projects.map((project) => (<SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>))}</SelectContent>
                    </Select></CardContent></Card>
    
                {loading ? (<div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-96" /></div>
                ) : selectedProject ? ( <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Budget</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(summary.totalBudget)}</div></CardContent></Card>
                        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Spent</CardTitle><TrendingDown className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(summary.totalSpent)}</div></CardContent></Card>
                        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Variance</CardTitle><AlertTriangle className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className={`text-2xl font-bold ${summary.variance > 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(summary.variance)}</div></CardContent></Card>
                        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Remaining Budget</CardTitle><Wallet className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(summary.remaining)}</div></CardContent></Card>
                    </div>
                    <Card><CardHeader><CardTitle>Budget Breakdown</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Item / Task</TableHead><TableHead className="text-right">Budgeted</TableHead><TableHead className="text-right">Actual</TableHead><TableHead>Progress</TableHead></TableRow></TableHeader><TableBody>
                        {budgetData.budgetLines.map(line => {
                            let actual = 0;
                            if (line.category === 'Labor' || line.category === 'Equipment') { actual = calculatedCosts.actualsByTask[line.task_id] || 0; } else { actual = line.total_cost || 0; }
                            const progress = line.total_cost > 0 ? (actual / line.total_cost) * 100 : 0;
                            return (<TableRow key={line.id}>
                                <TableCell><Badge variant="outline">{line.category}</Badge></TableCell>
                                <TableCell>{line.item_name || line.pm_tasks?.task_name || 'Project-level'}</TableCell>
                                <TableCell className="text-right">{formatCurrency(line.total_cost)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(actual)}</TableCell>
                                <TableCell><div className="flex items-center gap-2"><Progress value={progress} className="w-[100px]" /><span className="text-xs text-muted-foreground">{Math.round(progress)}%</span></div></TableCell>
                            </TableRow>)
                        })}
                        {budgetData.budgetLines.length === 0 && (<TableRow><TableCell colSpan={5} className="text-center h-24">No budget lines for this project yet.</TableCell></TableRow>)}
                    </TableBody></Table></CardContent></Card>
                </>) : (<div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed">
                    <h3 className="text-lg font-semibold text-gray-800">No Project Selected</h3><p className="text-gray-500 mt-2">Please select a project from the dropdown to view its budget.</p></div>
                )}
            </motion.div>
        );
    };
    
    export default BudgetView;