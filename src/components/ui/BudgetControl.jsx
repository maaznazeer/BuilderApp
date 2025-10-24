import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
    DollarSign, 
    AlertTriangle, 
    CheckCircle, 
    Info,
    Lock,
    Unlock
} from 'lucide-react';
import { useBudgetTracking } from '@/hooks/useBudgetTracking';

const BudgetControl = ({ 
    projectId, 
    amount, 
    category = 'expense',
    onBudgetCheck,
    showDetails = true,
    compact = false 
}) => {
    const { budgetData, loading } = useBudgetTracking(projectId);
    const [budgetStatus, setBudgetStatus] = useState(null);
    const [isOverBudget, setIsOverBudget] = useState(false);

    useEffect(() => {
        if (budgetData && amount) {
            const { budgetTotal, totalSpent, remainingBudget } = budgetData;
            const newTotalSpent = totalSpent + amount;
            const newRemainingBudget = budgetTotal - newTotalSpent;
            const newPercentage = budgetTotal > 0 ? (newTotalSpent / budgetTotal) * 100 : 0;

            const overBudget = newRemainingBudget < 0;
            setIsOverBudget(overBudget);

            setBudgetStatus({
                currentSpent: totalSpent,
                newSpent: newTotalSpent,
                remaining: remainingBudget,
                newRemaining: newRemainingBudget,
                percentage: newPercentage,
                overBudget: overBudget
            });

            // Notify parent component about budget status
            if (onBudgetCheck) {
                onBudgetCheck({
                    overBudget,
                    remainingBudget: newRemainingBudget,
                    percentage: newPercentage
                });
            }
        }
    }, [budgetData, amount, onBudgetCheck]);

    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount || 0);
    };

    const getStatusColor = (percentage) => {
        if (percentage >= 100) return 'text-red-600';
        if (percentage >= 90) return 'text-orange-600';
        if (percentage >= 75) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getStatusVariant = (percentage) => {
        if (percentage >= 100) return 'destructive';
        if (percentage >= 90) return 'destructive';
        if (percentage >= 75) return 'default';
        return 'default';
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Checking budget...</span>
            </div>
        );
    }

    if (!budgetData || !budgetStatus) {
        return null;
    }

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                {isOverBudget ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Over Budget
                    </Badge>
                ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                        <Unlock className="h-3 w-3" />
                        Within Budget
                    </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                    {formatCurrency(budgetStatus.newRemaining, budgetData.project.budget_currency)} remaining
                </span>
            </div>
        );
    }

    return (
        <Card className={`${isOverBudget ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                    {isOverBudget ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    Budget Impact Analysis
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Budget Status Alert */}
                {isOverBudget ? (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            This {category} would exceed the project budget by {formatCurrency(Math.abs(budgetStatus.newRemaining), budgetData.project.budget_currency)}.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            This {category} is within budget. {formatCurrency(budgetStatus.newRemaining, budgetData.project.budget_currency)} will remain.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Budget Breakdown */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="text-muted-foreground">Current Spending</div>
                        <div className="font-semibold">{formatCurrency(budgetStatus.currentSpent, budgetData.project.budget_currency)}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">After This {category.charAt(0).toUpperCase() + category.slice(1)}</div>
                        <div className="font-semibold">{formatCurrency(budgetStatus.newSpent, budgetData.project.budget_currency)}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">Current Remaining</div>
                        <div className="font-semibold">{formatCurrency(budgetStatus.remaining, budgetData.project.budget_currency)}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">After This {category.charAt(0).toUpperCase() + category.slice(1)}</div>
                        <div className={`font-semibold ${getStatusColor(budgetStatus.percentage)}`}>
                            {formatCurrency(budgetStatus.newRemaining, budgetData.project.budget_currency)}
                        </div>
                    </div>
                </div>

                {/* Budget Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Budget Utilization</span>
                        <span>{budgetStatus.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress 
                        value={Math.min(budgetStatus.percentage, 100)} 
                        className="h-3"
                    />
                </div>

                {/* Budget Limits */}
                <div className="text-xs text-muted-foreground">
                    <div>Total Budget: {formatCurrency(budgetData.budgetTotal, budgetData.project.budget_currency)}</div>
                    <div>Amount: {formatCurrency(amount, budgetData.project.budget_currency)}</div>
                </div>
            </CardContent>
        </Card>
    );
};

export default BudgetControl;
