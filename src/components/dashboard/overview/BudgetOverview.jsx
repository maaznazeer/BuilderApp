import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
    DollarSign, 
    AlertTriangle, 
    TrendingUp, 
    Eye,
    RefreshCw,
    BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import BudgetAlert from '@/components/ui/BudgetAlert';

const BudgetOverview = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
    const navigate = useNavigate();

    const fetchProjectsBudget = async () => {
        setLoading(true);
        try {
            // Get all projects with budget information
            const { data: projectsData, error: projectsError } = await supabase
                .from('projects')
                .select('id, name, code, budget_total, budget_currency, status')
                .not('budget_total', 'is', null)
                .gt('budget_total', 0);

            if (projectsError) throw projectsError;

            // For each project, calculate spending
            const projectsWithBudget = await Promise.all(
                projectsData.map(async (project) => {
                    const [
                        payrollResult,
                        expensesResult,
                        materialsResult
                    ] = await Promise.all([
                        // Payroll spending
                        supabase
                            .from('payroll_entries')
                            .select('total_amount')
                            .eq('project_code', project.code)
                            .eq('status', 'Paid'),
                        
                        // Direct expenses
                        supabase
                            .from('expenses')
                            .select('amount')
                            .eq('project_id', project.id),
                        
                        // Material costs from task materials
                        supabase
                            .from('task_materials')
                            .select(`
                                quantity_planned,
                                materials!inner(unit_cost),
                                pm_tasks!inner(project_code)
                            `)
                            .eq('pm_tasks.project_code', project.code)
                    ]);

                    // Calculate total spending
                    let totalSpent = 0;

                    // Payroll spending
                    if (payrollResult.data) {
                        payrollResult.data.forEach(entry => {
                            totalSpent += entry.total_amount || 0;
                        });
                    }

                    // Direct expenses
                    if (expensesResult.data) {
                        expensesResult.data.forEach(expense => {
                            totalSpent += expense.amount || 0;
                        });
                    }

                    // Material costs
                    if (materialsResult.data) {
                        materialsResult.data.forEach(material => {
                            const materialCost = (material.quantity_planned || 0) * (material.materials?.unit_cost || 0);
                            totalSpent += materialCost;
                        });
                    }

                    const budgetTotal = project.budget_total || 0;
                    const remainingBudget = budgetTotal - totalSpent;
                    const budgetPercentage = budgetTotal > 0 ? (totalSpent / budgetTotal) * 100 : 0;

                    return {
                        ...project,
                        totalSpent,
                        remainingBudget,
                        budgetPercentage
                    };
                })
            );

            setProjects(projectsWithBudget);
        } catch (error) {
            console.error('Error fetching projects budget:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectsBudget();
    }, []);

    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount || 0);
    };

    const getBudgetStatus = (percentage) => {
        if (percentage >= 100) return { status: 'exceeded', color: 'text-red-600', bgColor: 'bg-red-50' };
        if (percentage >= 90) return { status: 'critical', color: 'text-orange-600', bgColor: 'bg-orange-50' };
        if (percentage >= 75) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
        return { status: 'healthy', color: 'text-green-600', bgColor: 'bg-green-50' };
    };

    const handleViewProject = (projectId) => {
        navigate(`/dashboard/projects/${projectId}?tab=budget`);
    };

    const handleDismissAlert = (projectId) => {
        setDismissedAlerts(prev => new Set([...prev, projectId]));
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading budget data...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (projects.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Budget Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Budget Data</h3>
                        <p className="text-muted-foreground">No projects with budget information found.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Calculate overall budget statistics
    const totalBudget = projects.reduce((sum, project) => sum + (project.budget_total || 0), 0);
    const totalSpent = projects.reduce((sum, project) => sum + project.totalSpent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Get projects with alerts
    const projectsWithAlerts = projects.filter(project => 
        project.budgetPercentage >= 75 && !dismissedAlerts.has(project.id)
    );

    return (
        <div className="space-y-6">
            {/* Overall Budget Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Overall Budget Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold">{formatCurrency(totalBudget)}</div>
                            <div className="text-sm text-muted-foreground">Total Budget</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">{formatCurrency(totalSpent)}</div>
                            <div className="text-sm text-muted-foreground">Total Spent</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">{formatCurrency(totalRemaining)}</div>
                            <div className="text-sm text-muted-foreground">Remaining</div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Overall Budget Utilization</span>
                            <span>{overallPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(overallPercentage, 100)} className="h-3" />
                    </div>
                </CardContent>
            </Card>

            {/* Budget Alerts */}
            {projectsWithAlerts.map(project => {
                const alertType = project.budgetPercentage >= 100 ? 'critical' : 
                                project.budgetPercentage >= 90 ? 'warning' : 'info';
                const alertMessage = project.budgetPercentage >= 100 ? 
                    'Budget exceeded!' : 
                    project.budgetPercentage >= 90 ? 
                    'Budget nearly exhausted!' : 
                    'Budget alert: High usage detected.';

                return (
                    <BudgetAlert
                        key={project.id}
                        type={alertType}
                        title={`${project.name} Budget Alert`}
                        message={alertMessage}
                        amount={project.totalSpent}
                        percentage={project.budgetPercentage}
                        onDismiss={() => handleDismissAlert(project.id)}
                        onViewDetails={() => handleViewProject(project.id)}
                    />
                );
            })}

            {/* Projects Budget Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Projects Budget Status
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchProjectsBudget}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {projects.map(project => {
                            const budgetStatus = getBudgetStatus(project.budgetPercentage);
                            
                            return (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`p-4 rounded-lg border ${budgetStatus.bgColor}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold">{project.name}</h4>
                                            <p className="text-sm text-muted-foreground">Code: {project.code}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={budgetStatus.status === 'exceeded' ? 'destructive' : 
                                                       budgetStatus.status === 'critical' ? 'secondary' : 'outline'}>
                                                {budgetStatus.status}
                                            </Badge>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleViewProject(project.id)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4 mb-3">
                                        <div className="text-center">
                                            <div className="text-lg font-semibold">{formatCurrency(project.budget_total, project.budget_currency)}</div>
                                            <div className="text-xs text-muted-foreground">Budget</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-semibold">{formatCurrency(project.totalSpent, project.budget_currency)}</div>
                                            <div className="text-xs text-muted-foreground">Spent</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-lg font-semibold ${budgetStatus.color}`}>
                                                {formatCurrency(project.remainingBudget, project.budget_currency)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Remaining</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Budget Utilization</span>
                                            <span>{project.budgetPercentage.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={Math.min(project.budgetPercentage, 100)} className="h-2" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BudgetOverview;
