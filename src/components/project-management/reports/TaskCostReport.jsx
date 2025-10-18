import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';

const TaskCostReport = ({ tasks, timeLogs, taskMaterials, payrollEntries }) => {
    const taskCostData = useMemo(() => {
        return tasks.map(task => {
            // Calculate actual labor cost from time logs
            const taskTimeLogs = timeLogs.filter(tl => tl.task_id === task.task_id);
            const actualLaborCost = taskTimeLogs.reduce((total, log) => {
                const rate = log.resources?.hourly_rate || 0;
                return total + (log.hours * rate);
            }, 0);

            // Calculate actual material cost from task materials
            const taskMaterialsData = taskMaterials.filter(tm => tm.task_id === task.task_id);
            const actualMaterialCost = taskMaterialsData.reduce((total, tm) => {
                const material = tm.materials;
                const usedCost = (tm.quantity_used || 0) * (material?.unit_cost || 0);
                return total + usedCost;
            }, 0);

            const estimatedLabor = task.estimated_labor_cost || 0;
            const estimatedMaterial = task.estimated_material_cost || 0;
            const estimatedTotal = estimatedLabor + estimatedMaterial;
            const actualTotal = actualLaborCost + actualMaterialCost;
            const variance = actualTotal - estimatedTotal;
            const variancePercent = estimatedTotal > 0 ? (variance / estimatedTotal) * 100 : 0;

            return {
                ...task,
                estimatedLabor,
                estimatedMaterial,
                estimatedTotal,
                actualLabor: actualLaborCost,
                actualMaterial: actualMaterialCost,
                actualTotal,
                variance,
                variancePercent,
                status: variancePercent > 10 ? 'over' : variancePercent < -10 ? 'under' : 'on-track'
            };
        });
    }, [tasks, timeLogs, taskMaterials]);

    const summary = useMemo(() => {
        const totalEstimated = taskCostData.reduce((sum, task) => sum + task.estimatedTotal, 0);
        const totalActual = taskCostData.reduce((sum, task) => sum + task.actualTotal, 0);
        const totalVariance = totalActual - totalEstimated;
        const totalVariancePercent = totalEstimated > 0 ? (totalVariance / totalEstimated) * 100 : 0;

        return {
            totalEstimated,
            totalActual,
            totalVariance,
            totalVariancePercent,
            overBudgetTasks: taskCostData.filter(task => task.status === 'over').length,
            underBudgetTasks: taskCostData.filter(task => task.status === 'under').length,
            onTrackTasks: taskCostData.filter(task => task.status === 'on-track').length
        };
    }, [taskCostData]);

    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
    }).format(amount || 0);

    const getVarianceColor = (variance) => {
        if (variance > 0) return 'text-red-600';
        if (variance < 0) return 'text-green-600';
        return 'text-gray-600';
    };

    const getVarianceIcon = (variance) => {
        if (variance > 0) return <TrendingUp className="h-4 w-4 text-red-600" />;
        if (variance < 0) return <TrendingDown className="h-4 w-4 text-green-600" />;
        return null;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'over':
                return <Badge variant="destructive">Over Budget</Badge>;
            case 'under':
                return <Badge variant="default" className="bg-green-100 text-green-800">Under Budget</Badge>;
            case 'on-track':
                return <Badge variant="secondary">On Track</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Task Cost Analysis Report
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-medium text-muted-foreground">Total Estimated</div>
                            <div className="text-2xl font-bold">{formatCurrency(summary.totalEstimated)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-medium text-muted-foreground">Total Actual</div>
                            <div className="text-2xl font-bold">{formatCurrency(summary.totalActual)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-medium text-muted-foreground">Variance</div>
                            <div className={`text-2xl font-bold ${getVarianceColor(summary.totalVariance)}`}>
                                {formatCurrency(summary.totalVariance)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-medium text-muted-foreground">Variance %</div>
                            <div className={`text-2xl font-bold ${getVarianceColor(summary.totalVariance)}`}>
                                {summary.totalVariancePercent.toFixed(1)}%
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Overview */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{summary.overBudgetTasks}</div>
                        <div className="text-sm text-muted-foreground">Over Budget</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{summary.underBudgetTasks}</div>
                        <div className="text-sm text-muted-foreground">Under Budget</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{summary.onTrackTasks}</div>
                        <div className="text-sm text-muted-foreground">On Track</div>
                    </div>
                </div>

                {/* Detailed Task Table */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Task Cost Breakdown</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Task Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Estimated</TableHead>
                                <TableHead className="text-right">Actual</TableHead>
                                <TableHead className="text-right">Variance</TableHead>
                                <TableHead className="text-right">Variance %</TableHead>
                                <TableHead>Progress</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {taskCostData.map((task) => (
                                <TableRow key={task.task_id}>
                                    <TableCell className="font-medium">
                                        {task.task_name}
                                        {task.is_milestone && (
                                            <Badge variant="outline" className="ml-2">Milestone</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(task.estimatedTotal)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(task.actualTotal)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {getVarianceIcon(task.variance)}
                                            <span className={getVarianceColor(task.variance)}>
                                                {formatCurrency(task.variance)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={getVarianceColor(task.variance)}>
                                            {task.variancePercent.toFixed(1)}%
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress 
                                                value={task.percent_complete || 0} 
                                                className="flex-1"
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                {task.percent_complete || 0}%
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Labor vs Material Breakdown */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Cost Breakdown by Category</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Labor Costs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Estimated:</span>
                                        <span className="font-medium">{formatCurrency(
                                            taskCostData.reduce((sum, task) => sum + task.estimatedLabor, 0)
                                        )}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Actual:</span>
                                        <span className="font-medium">{formatCurrency(
                                            taskCostData.reduce((sum, task) => sum + task.actualLabor, 0)
                                        )}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Material Costs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Estimated:</span>
                                        <span className="font-medium">{formatCurrency(
                                            taskCostData.reduce((sum, task) => sum + task.estimatedMaterial, 0)
                                        )}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Actual:</span>
                                        <span className="font-medium">{formatCurrency(
                                            taskCostData.reduce((sum, task) => sum + task.actualMaterial, 0)
                                        )}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TaskCostReport;
