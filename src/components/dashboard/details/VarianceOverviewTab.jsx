import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
    TrendingUp, 
    TrendingDown,
    AlertTriangle, 
    CheckCircle, 
    Info,
    RefreshCw,
    BarChart3,
    DollarSign,
    Users,
    Package,
    Receipt
} from 'lucide-react';
import { useVarianceTracking } from '@/hooks/useVarianceTracking';
import { motion } from 'framer-motion';

const VarianceOverviewTab = ({ project }) => {
    const { varianceData, loading, alerts, refreshVariance } = useVarianceTracking(project?.id);
    const [activeView, setActiveView] = useState('overview');

    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount || 0);
    };

    const getVarianceStatus = (percentage) => {
        if (percentage > 20) return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-50' };
        if (percentage > 10) return { status: 'warning', color: 'text-orange-600', bgColor: 'bg-orange-50' };
        if (percentage < -10) return { status: 'positive', color: 'text-green-600', bgColor: 'bg-green-50' };
        return { status: 'healthy', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    };

    const getVarianceIcon = (variance) => {
        if (variance > 0) return <TrendingUp className="h-4 w-4 text-red-600" />;
        if (variance < 0) return <TrendingDown className="h-4 w-4 text-green-600" />;
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'critical': return <AlertTriangle className="h-4 w-4" />;
            case 'warning': return <AlertTriangle className="h-4 w-4" />;
            case 'success': return <CheckCircle className="h-4 w-4" />;
            default: return <Info className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading variance data...</span>
                </div>
            </div>
        );
    }

    if (!varianceData) {
        return (
            <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Variance Data</h3>
                <p className="text-muted-foreground">Unable to load variance information for this project.</p>
            </div>
        );
    }

    const { plannedCosts, actualCosts, variances, variancePercentages } = varianceData;

    return (
        <div className="space-y-6">
            {/* Variance Alerts */}
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

            {/* Variance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Variance */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Variance</CardTitle>
                        {getVarianceIcon(variances.total)}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${variances.total > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(variances.total, varianceData.project.budget_currency)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {variancePercentages.total > 0 ? '+' : ''}{variancePercentages.total.toFixed(1)}% vs planned
                        </p>
                    </CardContent>
                </Card>

                {/* Labor Variance */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Labor Variance</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${variances.labor > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(variances.labor, varianceData.project.budget_currency)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {variancePercentages.labor > 0 ? '+' : ''}{variancePercentages.labor.toFixed(1)}% vs planned
                        </p>
                    </CardContent>
                </Card>

                {/* Materials Variance */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Materials Variance</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${variances.materials > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(variances.materials, varianceData.project.budget_currency)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {variancePercentages.materials > 0 ? '+' : ''}{variancePercentages.materials.toFixed(1)}% vs planned
                        </p>
                    </CardContent>
                </Card>

                {/* Expenses Variance */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expenses Variance</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${variances.expenses > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(variances.expenses, varianceData.project.budget_currency)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {variancePercentages.expenses > 0 ? '+' : ''}{variancePercentages.expenses.toFixed(1)}% vs planned
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Planned vs Actual Comparison */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Planned vs Actual Costs
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Labor Comparison */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">Labor Costs</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Planned</div>
                                <div className="text-lg font-semibold">{formatCurrency(plannedCosts.labor, varianceData.project.budget_currency)}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Actual</div>
                                <div className="text-lg font-semibold">{formatCurrency(actualCosts.labor, varianceData.project.budget_currency)}</div>
                            </div>
                        </div>
                        <Progress 
                            value={plannedCosts.labor > 0 ? (actualCosts.labor / plannedCosts.labor) * 100 : 0} 
                            className="h-3"
                        />
                    </div>

                    {/* Materials Comparison */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span className="font-medium">Materials Costs</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Planned</div>
                                <div className="text-lg font-semibold">{formatCurrency(plannedCosts.materials, varianceData.project.budget_currency)}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Actual</div>
                                <div className="text-lg font-semibold">{formatCurrency(actualCosts.materials, varianceData.project.budget_currency)}</div>
                            </div>
                        </div>
                        <Progress 
                            value={plannedCosts.materials > 0 ? (actualCosts.materials / plannedCosts.materials) * 100 : 0} 
                            className="h-3"
                        />
                    </div>

                    {/* Expenses Comparison */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4" />
                            <span className="font-medium">Other Expenses</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Planned</div>
                                <div className="text-lg font-semibold">{formatCurrency(plannedCosts.expenses, varianceData.project.budget_currency)}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Actual</div>
                                <div className="text-lg font-semibold">{formatCurrency(actualCosts.expenses, varianceData.project.budget_currency)}</div>
                            </div>
                        </div>
                        <Progress 
                            value={plannedCosts.expenses > 0 ? (actualCosts.expenses / plannedCosts.expenses) * 100 : 0} 
                            className="h-3"
                        />
                    </div>

                    {/* Total Comparison */}
                    <div className="space-y-3 border-t pt-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium">Total Project Costs</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Planned Total</div>
                                <div className="text-xl font-bold">{formatCurrency(plannedCosts.total, varianceData.project.budget_currency)}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">Actual Total</div>
                                <div className="text-xl font-bold">{formatCurrency(actualCosts.total, varianceData.project.budget_currency)}</div>
                            </div>
                        </div>
                        <Progress 
                            value={plannedCosts.total > 0 ? (actualCosts.total / plannedCosts.total) * 100 : 0} 
                            className="h-4"
                        />
                        <div className="flex justify-between text-sm">
                            <span>Variance: {formatCurrency(variances.total, varianceData.project.budget_currency)}</span>
                            <span className={variancePercentages.total > 0 ? 'text-red-600' : 'text-green-600'}>
                                {variancePercentages.total > 0 ? '+' : ''}{variancePercentages.total.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button onClick={refreshVariance} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Variance
                </Button>
                <Button variant="outline" size="sm">
                    Export Variance Report
                </Button>
            </div>
        </div>
    );
};

export default VarianceOverviewTab;
