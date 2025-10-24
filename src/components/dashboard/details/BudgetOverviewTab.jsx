import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
    DollarSign, 
    TrendingUp, 
    AlertTriangle, 
    CheckCircle, 
    Info,
    RefreshCw,
    PieChart,
    BarChart3
} from 'lucide-react';
import { useBudgetTracking } from '@/hooks/useBudgetTracking';
import { motion } from 'framer-motion';

const BudgetOverviewTab = ({ project }) => {
    const { budgetData, loading, alerts, refreshBudget } = useBudgetTracking(project?.id);
    const [activeView, setActiveView] = useState('overview');

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

    const getAlertIcon = (type) => {
        switch (type) {
            case 'critical': return <AlertTriangle className="h-4 w-4" />;
            case 'warning': return <AlertTriangle className="h-4 w-4" />;
            case 'info': return <Info className="h-4 w-4" />;
            default: return <CheckCircle className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading budget data...</span>
                </div>
            </div>
        );
    }

    if (!budgetData) {
        return (
            <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Budget Data</h3>
                <p className="text-muted-foreground">Unable to load budget information for this project.</p>
            </div>
        );
    }

    const { budgetTotal, totalSpent, remainingBudget, budgetPercentage, spendingBreakdown } = budgetData;
    const budgetStatus = getBudgetStatus(budgetPercentage);

    return (
        <div className="space-y-6">
            {/* Budget Alerts */}
            {alerts.length > 0 && (
                <div className="space-y-3">
                    {alerts.map((alert, index) => (
                        <Alert key={index} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                            {getAlertIcon(alert.type)}
                            <AlertDescription>{alert.message}</AlertDescription>
                        </Alert>
                    ))}
                </div>
            )}

            {/* Budget Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Budget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(budgetTotal, budgetData.project.budget_currency)}</div>
                        <p className="text-xs text-muted-foreground">Project budget allocation</p>
                    </CardContent>
                </Card>

                {/* Total Spent */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalSpent, budgetData.project.budget_currency)}</div>
                        <p className="text-xs text-muted-foreground">
                            {budgetPercentage.toFixed(1)}% of budget used
                        </p>
                    </CardContent>
                </Card>

                {/* Remaining Budget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
                        <div className={`h-4 w-4 rounded-full ${budgetStatus.bgColor}`}></div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${budgetStatus.color}`}>
                            {formatCurrency(remainingBudget, budgetData.project.budget_currency)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {budgetStatus.status === 'exceeded' ? 'Budget exceeded' : 
                             budgetStatus.status === 'critical' ? 'Critical level' :
                             budgetStatus.status === 'warning' ? 'Warning level' : 'Healthy'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Budget Progress */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Budget Progress
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Budget Utilization</span>
                            <span>{budgetPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress 
                            value={Math.min(budgetPercentage, 100)} 
                            className="h-3"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Budget:</span>
                            <span className="ml-2 font-medium">{formatCurrency(budgetTotal, budgetData.project.budget_currency)}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Spent:</span>
                            <span className="ml-2 font-medium">{formatCurrency(totalSpent, budgetData.project.budget_currency)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Spending Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Spending Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(spendingBreakdown).map(([category, amount]) => {
                            const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
                            
                            return (
                                <div key={category} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{categoryName}</span>
                                        <span>{formatCurrency(amount, budgetData.project.budget_currency)} ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <Progress value={percentage} className="h-2" />
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button onClick={refreshBudget} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Budget
                </Button>
                <Button variant="outline" size="sm">
                    Export Budget Report
                </Button>
            </div>
        </div>
    );
};

export default BudgetOverviewTab;
