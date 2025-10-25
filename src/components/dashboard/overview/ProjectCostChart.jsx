import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useBudgetTracking } from '@/hooks/useBudgetTracking';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';

const ProjectCostChart = () => {
    const { projects, loading: projectsLoading } = useProject();
    const { user } = useAuth();
    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [totalBudget, setTotalBudget] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    useEffect(() => {
        if (projects && projects.length > 0 && user) {
            fetchRealProjectData();
        }
    }, [projects, user]);

    const fetchRealProjectData = async () => {
        try {
            console.log('ProjectCostChart - Projects data:', projects);
            console.log('ProjectCostChart - Number of projects:', projects.length);
            
            // Fetch project data directly from database to get budget information
            const { data: projectsWithBudget, error: projectsError } = await supabase
                .from('projects')
                .select('id, name, budget_total, budget_currency')
                .in('id', projects.map(p => p.id));
            
            if (projectsError) {
                console.error('Error fetching projects with budget:', projectsError);
                return;
            }
            
            console.log('ProjectCostChart - Projects with budget data:', projectsWithBudget);
            console.log('ProjectCostChart - Number of projects with budget:', projectsWithBudget.length);
            console.log('ProjectCostChart - Budget fields for each project:', projectsWithBudget.map(p => ({
                name: p.name,
                budget_total: p.budget_total,
                budget_currency: p.budget_currency
            })));
            
            // Filter out projects with no budget data - only use budget_total
            const projectsWithValidBudget = projectsWithBudget.filter(project => {
                const budget = project.budget_total;
                return budget && budget > 0;
            });
            
            console.log('ProjectCostChart - Projects with valid budget (>0):', projectsWithValidBudget);
            
            if (projectsWithValidBudget.length === 0) {
                console.log('No projects with valid budget data found');
                setChartData([]);
                setTotalBudget(0);
                setTotalSpent(0);
                setPieData([]);
                return;
            }
            
            const projectData = await Promise.all(projectsWithValidBudget.map(async (project) => {
                // Fetch real budget data for each project
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
                ]);

                // Check for database errors
                if (payrollResult.error) console.error('Payroll query error:', payrollResult.error);
                if (expensesResult.error) console.error('Expenses query error:', expensesResult.error);
                if (materialsResult.error) console.error('Materials query error:', materialsResult.error);
                if (tasksResult.error) console.error('Tasks query error:', tasksResult.error);
                if (ledgerResult.error) console.error('Ledger query error:', ledgerResult.error);

                // Calculate total spending using same logic as useBudgetTracking
                let totalSpent = 0;
                
                console.log('=== SPENDING CALCULATION FOR', project.name, '===');
                
                // Payroll spending
                if (payrollResult.data && payrollResult.data.length > 0) {
                    console.log('Payroll data found:', payrollResult.data);
                    payrollResult.data.forEach(entry => {
                        const amount = entry.total_amount || 0;
                        totalSpent += amount;
                        console.log('Added payroll amount:', amount);
                    });
                } else {
                    console.log('No payroll data found');
                }

                // Direct expenses
                if (expensesResult.data && expensesResult.data.length > 0) {
                    console.log('Expenses data found:', expensesResult.data);
                    expensesResult.data.forEach(expense => {
                        const amount = expense.amount || 0;
                        totalSpent += amount;
                        console.log('Added expense amount:', amount);
                    });
                } else {
                    console.log('No expenses data found');
                }

                // Material costs
                if (materialsResult.data && materialsResult.data.length > 0) {
                    console.log('Materials data found:', materialsResult.data);
                    materialsResult.data.forEach(material => {
                        const materialCost = (material.quantity_planned || 0) * (material.materials?.unit_cost || 0);
                        totalSpent += materialCost;
                        console.log('Added material cost:', materialCost);
                    });
                } else {
                    console.log('No materials data found');
                }

                // Task costs (use actual if available, otherwise estimated)
                if (tasksResult.data && tasksResult.data.length > 0) {
                    console.log('Tasks data found:', tasksResult.data);
                    tasksResult.data.forEach(task => {
                        const laborCost = task.actual_labor_cost || task.estimated_labor_cost || 0;
                        const materialCost = task.actual_material_cost || task.estimated_material_cost || 0;
                        const taskTotal = laborCost + materialCost;
                        totalSpent += taskTotal;
                        console.log('Added task cost:', taskTotal);
                    });
                } else {
                    console.log('No tasks data found');
                }

                // Financial ledger expenses
                if (ledgerResult.data && ledgerResult.data.length > 0) {
                    console.log('Ledger data found:', ledgerResult.data);
                    ledgerResult.data.forEach(entry => {
                        const amount = entry.expense_amount || 0;
                        totalSpent += amount;
                        console.log('Added ledger expense amount:', amount);
                    });
                } else {
                    console.log('No ledger data found');
                }
                
                console.log('Total spent for', project.name, ':', totalSpent);

                const budgetTotal = project.budget_total || 0;
                const remainingBudget = Math.max(0, budgetTotal - totalSpent);
                const budgetPercentage = budgetTotal > 0 ? (totalSpent / budgetTotal) * 100 : 0;

                return {
                    project,
                    budgetData: {
                        budgetTotal,
                        totalSpent,
                        remainingBudget,
                        budgetPercentage
                    }
                };
            }));

            const chartData = projectData.map(({ project, budgetData }) => ({
                name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
                fullName: project.name,
                budget: budgetData.budgetTotal,
                spent: budgetData.totalSpent,
                remaining: budgetData.remainingBudget,
                percentage: budgetData.budgetPercentage
            }));

            // Calculate totals
            const totalBudget = projectData.reduce((sum, { budgetData }) => sum + budgetData.budgetTotal, 0);
            const totalSpentAmount = projectData.reduce((sum, { budgetData }) => sum + budgetData.totalSpent, 0);
            
            console.log('ProjectCostChart - Total budget calculated:', totalBudget);
            console.log('ProjectCostChart - Total spent calculated:', totalSpentAmount);
            console.log('ProjectCostChart - Project data summary:', projectData.map(({ project, budgetData }) => ({
                name: project.name,
                budgetTotal: budgetData.budgetTotal,
                totalSpent: budgetData.totalSpent,
                remaining: budgetData.remainingBudget
            })));
            console.log('ProjectCostChart - Final chart data:', chartData);

            // Always use real data - no sample data fallback
            if (totalBudget === 0) {
                console.log('No budget data found in projects - showing empty chart');
                console.log('To fix this, add budget information to your projects. Available fields:', projects.map(p => Object.keys(p)));
                setChartData([]);
                setTotalBudget(0);
                setTotalSpent(0);
                setPieData([]);
            } else {
                setChartData(chartData);
                setTotalBudget(totalBudget);
                setTotalSpent(totalSpentAmount);

                // Create pie chart data
                const pieData = [
                    { name: 'Budget', value: totalBudget, color: '#8884d8' },
                    { name: 'Spent', value: totalSpentAmount, color: '#82ca9d' }
                ];
                setPieData(pieData);
            }

        } catch (error) {
            console.error('Error fetching project data:', error);
            // Show empty chart on error - no sample data
            setChartData([]);
            setTotalBudget(0);
            setTotalSpent(0);
            setPieData([]);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'exceeded': return 'text-red-600';
            case 'critical': return 'text-orange-600';
            case 'warning': return 'text-yellow-600';
            default: return 'text-green-600';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'exceeded': return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'critical': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            default: return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    if (projectsLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Project Costs Analysis
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

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Project Costs Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-gray-500 mb-2">No budget data found</p>
                            <p className="text-sm text-gray-400 mb-4">
                                To see budget vs spent charts, you need to add budget information to your projects.
                            </p>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">How to Add Budget Data:</h4>
                            <div className="text-sm text-blue-800 space-y-2">
                                <p><strong>Option 1:</strong> Edit your projects and add a budget field (e.g., "budget_total", "budget", "total_budget")</p>
                                <p><strong>Option 2:</strong> Add financial data through:</p>
                                <ul className="list-disc list-inside ml-4 space-y-1">
                                    <li>Financial Ledger (expenses and deposits)</li>
                                    <li>Payroll Entries (worker payments)</li>
                                    <li>Direct Expenses (project expenses)</li>
                                </ul>
                                <p className="text-xs text-blue-600 mt-2">
                                    Check browser console for detailed project structure and available fields.
                                </p>
                            </div>
                        </div>
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
            className="space-y-6"
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Spent</p>
                                <p className={`text-2xl font-bold ${totalSpent > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                                    {formatCurrency(totalSpent)}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Budget vs Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="name" 
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        fontSize={12}
                                    />
                                    <YAxis 
                                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip 
                                        formatter={(value, name) => [
                                            formatCurrency(value), 
                                            name === 'Total Budget' ? 'Total Budget' : name === 'Actual Spent' ? 'Actual Spent' : 'Remaining'
                                        ]}
                                        labelFormatter={(label) => `Project: ${label}`}
                                    />
                                    <Bar dataKey="budget" fill="#8884d8" name="Total Budget" />
                                    <Bar dataKey="spent" fill="#82ca9d" name="Actual Spent" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Spending Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Project Details Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {chartData.map((project, index) => (
                            <motion.div
                                key={project.fullName}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 border rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">{project.fullName}</h3>
                                        {getStatusIcon(project.status)}
                                    </div>
                                    <Badge 
                                        variant={project.status === 'exceeded' ? 'destructive' : 
                                               project.status === 'critical' ? 'secondary' : 'outline'}
                                    >
                                        {project.status}
                                    </Badge>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Budget</p>
                                        <p className="font-semibold">{formatCurrency(project.budget)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Spent</p>
                                        <p className="font-semibold">{formatCurrency(project.spent)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Budget</p>
                                        <p className="font-semibold text-blue-600">
                                            {formatCurrency(project.budget)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-3">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Budget Usage</span>
                                        <span className={getStatusColor(project.status)}>
                                            {project.percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <Progress 
                                        value={Math.min(project.percentage, 100)} 
                                        className="h-2"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ProjectCostChart;
