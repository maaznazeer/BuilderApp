import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';

const FinancialSummaryCard = () => {
    const { projects, loading: projectsLoading } = useProject();
    const { user } = useAuth();
    const [summaryData, setSummaryData] = useState({
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        averageUsage: 0,
        projectsOverBudget: 0
    });

    useEffect(() => {
        if (projects && projects.length > 0 && user) {
            fetchRealFinancialData();
        }
    }, [projects, user]);

    const fetchRealFinancialData = async () => {
        try {
            console.log('Projects data:', projects);
            console.log('First project structure:', projects[0]);
            
            // Fetch project data directly from database to get budget information
            const { data: projectsWithBudget, error: projectsError } = await supabase
                .from('projects')
                .select('id, name, budget_total, budget_currency')
                .in('id', projects.map(p => p.id));
            
            if (projectsError) {
                console.error('Error fetching projects with budget:', projectsError);
                return;
            }
            
            console.log('FinancialSummaryCard - Projects with budget data:', projectsWithBudget);
            
            const totalBudget = projectsWithBudget.reduce((sum, project) => {
                const budget = project.budget_total || 0;
                console.log(`Project ${project.name} budget:`, budget);
                return sum + budget;
            }, 0);
            let totalSpent = 0;
            let projectsOverBudget = 0;

            // Calculate real spending for each project
            for (const project of projectsWithBudget) {
                console.log('Processing project:', project.name, project);
                console.log('Project code:', project.code, 'Project ID:', project.id);
                
                // Use project ID instead of code for financial data queries
                console.log('Processing project:', project.name, 'Budget:', project.budget);
                
                const [payrollResult, expensesResult, materialsResult, tasksResult, ledgerResult] = await Promise.all([
                    // Payroll data - use project_code instead of project_id
                    supabase
                        .from('payroll_entries')
                        .select('total_amount, payment_date, status')
                        .eq('project_code', project.id)
                        .eq('status', 'Paid'),
                    
                    // Direct expenses - use payer_id instead of user_id
                    supabase
                        .from('expenses')
                        .select('amount, category, created_at')
                        .eq('project_id', project.id)
                        .eq('payer_id', user.id),
                    
                    // Material costs from task materials
                    supabase
                        .from('task_materials')
                        .select(`
                            quantity_planned,
                            materials!inner(unit_cost),
                            pm_tasks!inner(project_code)
                        `)
                        .eq('pm_tasks.project_code', project.id),
                    
                    // Task costs (estimated and actual)
                    supabase
                        .from('pm_tasks')
                        .select('estimated_labor_cost, estimated_material_cost, actual_labor_cost, actual_material_cost')
                        .eq('project_code', project.id),
                    
                    // Financial ledger entries - use project_code instead of project_id
                    supabase
                        .from('financial_ledger')
                        .select('expense_amount, amount_to_be_received, date')
                        .eq('project_code', project.id)
                        .eq('user_id', user.id)
                ]);

                let projectSpent = 0;
                
                console.log('=== SPENDING CALCULATION FOR', project.name, '===');
                console.log('Payroll data for project', project.name, ':', payrollResult.data);
                console.log('Expenses data for project', project.name, ':', expensesResult.data);
                console.log('Ledger data for project', project.name, ':', ledgerResult.data);
                console.log('Payroll errors:', payrollResult.error);
                console.log('Expenses errors:', expensesResult.error);
                console.log('Ledger errors:', ledgerResult.error);
                
                // Payroll spending
                if (payrollResult.data && payrollResult.data.length > 0) {
                    console.log('Payroll data found for', project.name, ':', payrollResult.data);
                    payrollResult.data.forEach(entry => {
                        const amount = entry.total_amount || 0;
                        projectSpent += amount;
                        console.log('Added payroll amount:', amount);
                    });
                } else {
                    console.log('No payroll data found for', project.name);
                }

                // Direct expenses
                if (expensesResult.data && expensesResult.data.length > 0) {
                    console.log('Expenses data found for', project.name, ':', expensesResult.data);
                    expensesResult.data.forEach(expense => {
                        const amount = expense.amount || 0;
                        projectSpent += amount;
                        console.log('Added expense amount:', amount);
                    });
                } else {
                    console.log('No expenses data found for', project.name);
                }

                // Material costs
                if (materialsResult.data && materialsResult.data.length > 0) {
                    console.log('Materials data found for', project.name, ':', materialsResult.data);
                    materialsResult.data.forEach(material => {
                        const materialCost = (material.quantity_planned || 0) * (material.materials?.unit_cost || 0);
                        projectSpent += materialCost;
                        console.log('Added material cost:', materialCost);
                    });
                } else {
                    console.log('No materials data found for', project.name);
                }

                // Task costs (use actual if available, otherwise estimated)
                if (tasksResult.data && tasksResult.data.length > 0) {
                    console.log('Tasks data found for', project.name, ':', tasksResult.data);
                    tasksResult.data.forEach(task => {
                        const laborCost = task.actual_labor_cost || task.estimated_labor_cost || 0;
                        const materialCost = task.actual_material_cost || task.estimated_material_cost || 0;
                        const taskTotal = laborCost + materialCost;
                        projectSpent += taskTotal;
                        console.log('Added task cost:', taskTotal);
                    });
                } else {
                    console.log('No tasks data found for', project.name);
                }

                // Financial ledger expenses
                if (ledgerResult.data && ledgerResult.data.length > 0) {
                    console.log('Ledger data found for', project.name, ':', ledgerResult.data);
                    ledgerResult.data.forEach(entry => {
                        const amount = entry.expense_amount || 0;
                        projectSpent += amount;
                        console.log('Added ledger expense amount:', amount);
                    });
                } else {
                    console.log('No ledger data found for', project.name);
                }
                
                console.log('Total spent for project', project.name, ':', projectSpent);

                totalSpent += projectSpent;

                // Check if project is over budget
                if (projectSpent > (project.budget_total || 0)) {
                    projectsOverBudget++;
                }
            }

            const totalRemaining = totalBudget - totalSpent;
            const averageUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

            // Always use real data - no sample data fallback
            if (totalBudget === 0) {
                console.log('No budget data found in projects - showing zeros');
                setSummaryData({
                    totalBudget: 0,
                    totalSpent: 0,
                    totalRemaining: 0,
                    averageUsage: 0,
                    projectsOverBudget: 0
                });
            } else {
                setSummaryData({
                    totalBudget,
                    totalSpent,
                    totalRemaining,
                    averageUsage,
                    projectsOverBudget
                });
            }
        } catch (error) {
            console.error('Error fetching financial data:', error);
            // Show zeros on error - no sample data
            setSummaryData({
                totalBudget: 0,
                totalSpent: 0,
                totalRemaining: 0,
                averageUsage: 0,
                projectsOverBudget: 0
            });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const getUsageStatus = () => {
        if (summaryData.averageUsage >= 100) return { status: 'exceeded', color: 'text-red-600', bgColor: 'bg-red-50' };
        if (summaryData.averageUsage >= 90) return { status: 'critical', color: 'text-orange-600', bgColor: 'bg-orange-50' };
        if (summaryData.averageUsage >= 75) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
        return { status: 'healthy', color: 'text-green-600', bgColor: 'bg-green-50' };
    };

    const usageStatus = getUsageStatus();

    if (projectsLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Financial Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Financial Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Budget</p>
                            <p className="text-2xl font-bold">{formatCurrency(summaryData.totalBudget)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Spent</p>
                            <p className="text-2xl font-bold">{formatCurrency(summaryData.totalSpent)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Remaining</p>
                            <p className={`text-2xl font-bold ${summaryData.totalRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(summaryData.totalRemaining)}
                            </p>
                        </div>
                    </div>

                    {/* Usage Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Budget Usage</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${usageStatus.color}`}>
                                    {summaryData.averageUsage.toFixed(1)}%
                                </span>
                                <Badge 
                                    variant={usageStatus.status === 'exceeded' ? 'destructive' : 
                                           usageStatus.status === 'critical' ? 'secondary' : 'outline'}
                                >
                                    {usageStatus.status}
                                </Badge>
                            </div>
                        </div>
                        <Progress 
                            value={Math.min(summaryData.averageUsage, 100)} 
                            className="h-3"
                        />
                    </div>

                    {/* Project Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 border rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Projects</p>
                            <p className="text-xl font-bold">{projects.length}</p>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                            <p className="text-sm text-muted-foreground">Over Budget</p>
                            <p className={`text-xl font-bold ${summaryData.projectsOverBudget > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {summaryData.projectsOverBudget}
                            </p>
                        </div>
                    </div>

                    {/* Status Icons */}
                    <div className="flex items-center justify-center gap-4">
                        {summaryData.averageUsage >= 100 ? (
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                <span className="text-sm font-medium">Budget Exceeded</span>
                            </div>
                        ) : summaryData.averageUsage >= 90 ? (
                            <div className="flex items-center gap-2 text-orange-600">
                                <AlertTriangle className="h-5 w-5" />
                                <span className="text-sm font-medium">Critical Usage</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-5 w-5" />
                                <span className="text-sm font-medium">Healthy Budget</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FinancialSummaryCard;
