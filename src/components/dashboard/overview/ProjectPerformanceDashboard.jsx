import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useBudgetTracking } from '@/hooks/useBudgetTracking';
import { useVarianceTracking } from '@/hooks/useVarianceTracking';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Calendar, 
    AlertTriangle, 
    CheckCircle,
    Target,
    Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';

const ProjectPerformanceDashboard = () => {
    const { projects, loading: projectsLoading } = useProject();
    const { user } = useAuth();
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (projects && projects.length > 0) {
            fetchPerformanceData();
        }
    }, [projects]);

    const fetchPerformanceData = async () => {
        setLoading(true);
        try {
            const performancePromises = projects.map(async (project) => {
                // Skip if project doesn't have a code
                if (!project.code) {
                    console.log('Skipping project without code:', project.name);
                    return {
                        project,
                        budgetData: {
                            budgetTotal: project.budget_total || 0,
                            totalSpent: 0,
                            budgetPercentage: 0
                        },
                        varianceData: {
                            variances: { total: 0 },
                            variancePercentages: { total: 0 }
                        }
                    };
                }
                
                // Fetch real budget data for each project
                const [payrollResult, expensesResult, ledgerResult] = await Promise.all([
                    // Payroll data - remove user_id filter since column doesn't exist
                    supabase
                        .from('payroll_entries')
                        .select('total_amount')
                        .eq('project_code', project.code),
                    
                    // Direct expenses - use payer_id instead of user_id
                    supabase
                        .from('expenses')
                        .select('amount')
                        .eq('project_id', project.id)
                        .eq('payer_id', user.id),
                    
                    // Financial ledger entries
                    supabase
                        .from('financial_ledger')
                        .select('expense_amount, amount_to_be_received')
                        .eq('project_code', project.code)
                        .eq('user_id', user.id)
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

                // Financial ledger expenses
                if (ledgerResult.data) {
                    ledgerResult.data.forEach(entry => {
                        totalSpent += (entry.expense_amount || 0);
                    });
                }

                const budgetTotal = project.budget_total || 0;
                const budgetPercentage = budgetTotal > 0 ? (totalSpent / budgetTotal) * 100 : 0;

                const budgetData = {
                    budgetTotal,
                    totalSpent,
                    budgetPercentage
                };
                
                // Calculate variance (difference between budget and actual)
                const variance = totalSpent - budgetTotal;
                const variancePercentage = budgetTotal > 0 ? (variance / budgetTotal) * 100 : 0;
                
                const varianceData = {
                    variances: { total: variance },
                    variancePercentages: { total: variancePercentage }
                };
                
                // Get project tasks
                const { data: tasks, error: tasksError } = await supabase
                    .from('pm_tasks')
                    .select('*')
                    .eq('project_code', project.code);

                if (tasksError) console.error('Tasks error:', tasksError);

                // Get milestones
                const { data: milestones, error: milestonesError } = await supabase
                    .from('milestones')
                .select('*')
                .eq('project_id', project.id);

                if (milestonesError) console.error('Milestones error:', milestonesError);

                // Calculate performance metrics
                const totalTasks = tasks?.length || 0;
                const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0;
                const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                const totalMilestones = milestones?.length || 0;
                const completedMilestones = milestones?.filter(milestone => milestone.status === 'completed').length || 0;
                const milestoneCompletionRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

                // Calculate project health score
                const budgetScore = budgetData ? Math.max(0, 100 - budgetData.budgetPercentage) : 50;
                const taskScore = taskCompletionRate;
                const milestoneScore = milestoneCompletionRate;
                const varianceScore = varianceData ? Math.max(0, 100 - Math.abs(varianceData.variancePercentages.total)) : 50;
                
                const healthScore = (budgetScore + taskScore + milestoneScore + varianceScore) / 4;

                return {
                    project,
                    budgetData,
                    varianceData,
                    totalTasks,
                    completedTasks,
                    taskCompletionRate,
                    totalMilestones,
                    completedMilestones,
                    milestoneCompletionRate,
                    healthScore,
                    status: getProjectStatus(healthScore, budgetData?.budgetPercentage || 0)
                };
            });

            const results = await Promise.all(performancePromises);
            setPerformanceData(results);
        } catch (error) {
            console.error('Error fetching performance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getProjectStatus = (healthScore, budgetPercentage) => {
        if (budgetPercentage >= 100) return { status: 'exceeded', color: 'text-red-600', bgColor: 'bg-red-50' };
        if (healthScore >= 80) return { status: 'excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
        if (healthScore >= 60) return { status: 'good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
        if (healthScore >= 40) return { status: 'fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
        return { status: 'poor', color: 'text-red-600', bgColor: 'bg-red-50' };
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'exceeded': return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'excellent': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'good': return <TrendingUp className="h-4 w-4 text-blue-500" />;
            case 'fair': return <Clock className="h-4 w-4 text-yellow-500" />;
            default: return <TrendingDown className="h-4 w-4 text-red-500" />;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    if (loading || projectsLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Project Performance Dashboard
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
            className="space-y-6"
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Project Performance Dashboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {performanceData.map((projectData, index) => {
                            const { project, budgetData, varianceData, healthScore, status } = projectData;
                            
                            // Fallback for undefined values
                            const safeStatus = status || { status: 'unknown', color: 'text-gray-600', bgColor: 'bg-gray-50' };
                            const safeHealthScore = healthScore || 0;
                            const safeBudgetData = budgetData || { budgetPercentage: 0, totalSpent: 0, budgetTotal: 0 };
                            const safeVarianceData = varianceData || { 
                                variancePercentages: { total: 0 },
                                variances: { total: 0 }
                            };
                            const safeProjectData = {
                                taskCompletionRate: projectData.taskCompletionRate || 0,
                                milestoneCompletionRate: projectData.milestoneCompletionRate || 0,
                                completedTasks: projectData.completedTasks || 0,
                                totalTasks: projectData.totalTasks || 0,
                                completedMilestones: projectData.completedMilestones || 0,
                                totalMilestones: projectData.totalMilestones || 0
                            };
                            
                            return (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-6 border rounded-lg ${safeStatus.bgColor}`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold">{project.name}</h3>
                                            {getStatusIcon(safeStatus.status)}
                                            <Badge 
                                                variant={safeStatus.status === 'exceeded' ? 'destructive' : 
                                                       safeStatus.status === 'excellent' ? 'default' : 'secondary'}
                                            >
                                                {safeStatus.status}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Health Score</p>
                                            <p className={`text-2xl font-bold ${safeStatus.color}`}>
                                                {safeHealthScore.toFixed(0)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        {/* Budget Performance */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <DollarSign className="h-4 w-4" />
                                                <span className="text-sm font-medium">Budget</span>
                                            </div>
                                            {budgetData ? (
                                                <>
                                                    <div className="text-sm text-muted-foreground mb-1">
                                                        {safeBudgetData.budgetPercentage.toFixed(1)}% used
                                                    </div>
                                                    <Progress 
                                                        value={Math.min(safeBudgetData.budgetPercentage, 100)} 
                                                        className="h-2 mb-2"
                                                    />
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatCurrency(safeBudgetData.totalSpent)} / {formatCurrency(safeBudgetData.budgetTotal)}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">No budget data</div>
                                            )}
                                        </div>

                                        {/* Task Progress */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Target className="h-4 w-4" />
                                                <span className="text-sm font-medium">Tasks</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground mb-1">
                                                {safeProjectData.taskCompletionRate.toFixed(1)}% complete
                                            </div>
                                            <Progress value={safeProjectData.taskCompletionRate} className="h-2 mb-2" />
                                            <div className="text-xs text-muted-foreground">
                                                {safeProjectData.completedTasks} / {safeProjectData.totalTasks} tasks
                                            </div>
                                        </div>

                                        {/* Milestone Progress */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-sm font-medium">Milestones</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground mb-1">
                                                {safeProjectData.milestoneCompletionRate.toFixed(1)}% complete
                                            </div>
                                            <Progress value={safeProjectData.milestoneCompletionRate} className="h-2 mb-2" />
                                            <div className="text-xs text-muted-foreground">
                                                {safeProjectData.completedMilestones} / {safeProjectData.totalMilestones} milestones
                                            </div>
                                        </div>

                                        {/* Variance */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="h-4 w-4" />
                                                <span className="text-sm font-medium">Variance</span>
                                            </div>
                                            {varianceData ? (
                                                <>
                                                    <div className={`text-sm font-medium ${
                                                        safeVarianceData.variances.total > 0 ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                        {safeVarianceData.variancePercentages.total > 0 ? '+' : ''}
                                                        {safeVarianceData.variancePercentages.total.toFixed(1)}%
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatCurrency(safeVarianceData.variances.total)}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">No variance data</div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ProjectPerformanceDashboard;
