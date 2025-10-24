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
    Settings,
    RefreshCw
} from 'lucide-react';
import { useBudgetTracking } from '@/hooks/useBudgetTracking';
import BudgetAlert from '@/components/ui/BudgetAlert';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BudgetMonitor = ({ project, compact = false }) => {
    const { budgetData, loading, alerts, refreshBudget } = useBudgetTracking(project?.id);
    const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
    const navigate = useNavigate();

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

    const handleDismissAlert = (alertIndex) => {
        setDismissedAlerts(prev => new Set([...prev, alertIndex]));
    };

    const handleViewBudgetDetails = () => {
        navigate(`/dashboard/projects/${project.id}?tab=budget`);
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

    if (!budgetData) {
        return null;
    }

    const { budgetTotal, totalSpent, remainingBudget, budgetPercentage } = budgetData;
    const budgetStatus = getBudgetStatus(budgetPercentage);
    const activeAlerts = alerts.filter((_, index) => !dismissedAlerts.has(index));

    if (compact) {
        return (
            <div className="space-y-3">
                {/* Compact Budget Status */}
                <Card className={`${budgetStatus.bgColor} border-l-4`}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4" />
                                <span className="font-medium">Budget Status</span>
                                <Badge variant={budgetStatus.status === 'exceeded' ? 'destructive' : 
                                           budgetStatus.status === 'critical' ? 'secondary' : 'outline'}>
                                    {budgetStatus.status}
                                </Badge>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium">
                                    {formatCurrency(totalSpent, budgetData.project.budget_currency)} / {formatCurrency(budgetTotal, budgetData.project.budget_currency)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {budgetPercentage.toFixed(1)}% used
                                </div>
                            </div>
                        </div>
                        <Progress value={Math.min(budgetPercentage, 100)} className="mt-2 h-2" />
                    </CardContent>
                </Card>

                {/* Active Alerts */}
                <AnimatePresence>
                    {activeAlerts.map((alert, index) => (
                        <BudgetAlert
                            key={index}
                            type={alert.type}
                            title={`${project.name} Budget Alert`}
                            message={alert.message}
                            amount={alert.amount}
                            percentage={budgetPercentage}
                            onDismiss={() => handleDismissAlert(index)}
                            onViewDetails={handleViewBudgetDetails}
                        />
                    ))}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Budget Monitor
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={refreshBudget}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleViewBudgetDetails}>
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Budget Overview */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{formatCurrency(budgetTotal, budgetData.project.budget_currency)}</div>
                        <div className="text-xs text-muted-foreground">Total Budget</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{formatCurrency(totalSpent, budgetData.project.budget_currency)}</div>
                        <div className="text-xs text-muted-foreground">Spent</div>
                    </div>
                    <div className="text-center">
                        <div className={`text-2xl font-bold ${budgetStatus.color}`}>
                            {formatCurrency(remainingBudget, budgetData.project.budget_currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">Remaining</div>
                    </div>
                </div>

                {/* Budget Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Budget Utilization</span>
                        <span>{budgetPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(budgetPercentage, 100)} className="h-3" />
                </div>

                {/* Active Alerts */}
                <AnimatePresence>
                    {activeAlerts.map((alert, index) => (
                        <BudgetAlert
                            key={index}
                            type={alert.type}
                            title={`${project.name} Budget Alert`}
                            message={alert.message}
                            amount={alert.amount}
                            percentage={budgetPercentage}
                            onDismiss={() => handleDismissAlert(index)}
                            onViewDetails={handleViewBudgetDetails}
                        />
                    ))}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={handleViewBudgetDetails} className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default BudgetMonitor;
