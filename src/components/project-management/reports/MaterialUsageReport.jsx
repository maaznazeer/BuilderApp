import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const MaterialUsageReport = ({ taskMaterials, tasks }) => {
    const materialUsageData = useMemo(() => {
        // Group materials by material_id to get usage across all tasks
        const materialGroups = {};
        
        taskMaterials.forEach(tm => {
            const materialId = tm.material_id;
            if (!materialGroups[materialId]) {
                materialGroups[materialId] = {
                    material: tm.materials,
                    totalPlanned: 0,
                    totalUsed: 0,
                    tasks: [],
                    stockStatus: 'sufficient'
                };
            }
            
            materialGroups[materialId].totalPlanned += tm.quantity_planned || 0;
            materialGroups[materialId].totalUsed += tm.quantity_used || 0;
            materialGroups[materialId].tasks.push({
                task: tm.pm_tasks,
                planned: tm.quantity_planned || 0,
                used: tm.quantity_used || 0,
                unit: tm.unit
            });
        });

        // Calculate stock status for each material
        Object.values(materialGroups).forEach(group => {
            const stock = group.material?.current_stock || 0;
            const needed = group.totalPlanned;
            
            if (stock < needed) {
                group.stockStatus = 'insufficient';
            } else if (stock < needed * 1.2) {
                group.stockStatus = 'low';
            } else {
                group.stockStatus = 'sufficient';
            }
        });

        return Object.values(materialGroups);
    }, [taskMaterials]);

    const summary = useMemo(() => {
        const totalMaterials = materialUsageData.length;
        const insufficientStock = materialUsageData.filter(m => m.stockStatus === 'insufficient').length;
        const lowStock = materialUsageData.filter(m => m.stockStatus === 'low').length;
        const sufficientStock = materialUsageData.filter(m => m.stockStatus === 'sufficient').length;
        
        const totalPlanned = materialUsageData.reduce((sum, m) => sum + m.totalPlanned, 0);
        const totalUsed = materialUsageData.reduce((sum, m) => sum + m.totalUsed, 0);
        const usageRate = totalPlanned > 0 ? (totalUsed / totalPlanned) * 100 : 0;

        return {
            totalMaterials,
            insufficientStock,
            lowStock,
            sufficientStock,
            totalPlanned,
            totalUsed,
            usageRate
        };
    }, [materialUsageData]);

    const getStockStatusBadge = (status) => {
        switch (status) {
            case 'insufficient':
                return <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Insufficient
                </Badge>;
            case 'low':
                return <Badge variant="outline" className="flex items-center gap-1 text-amber-600 border-amber-300">
                    <Clock className="h-3 w-3" />
                    Low Stock
                </Badge>;
            case 'sufficient':
                return <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-300">
                    <CheckCircle className="h-3 w-3" />
                    Sufficient
                </Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getUsageProgress = (planned, used) => {
        if (planned === 0) return 0;
        return Math.min((used / planned) * 100, 100);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Material Usage Report
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-medium text-muted-foreground">Total Materials</div>
                            <div className="text-2xl font-bold">{summary.totalMaterials}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-medium text-muted-foreground">Insufficient Stock</div>
                            <div className="text-2xl font-bold text-red-600">{summary.insufficientStock}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-medium text-muted-foreground">Low Stock</div>
                            <div className="text-2xl font-bold text-amber-600">{summary.lowStock}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-medium text-muted-foreground">Usage Rate</div>
                            <div className="text-2xl font-bold">{summary.usageRate.toFixed(1)}%</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stock Status Overview */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{summary.insufficientStock}</div>
                        <div className="text-sm text-muted-foreground">Insufficient Stock</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">{summary.lowStock}</div>
                        <div className="text-sm text-muted-foreground">Low Stock</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{summary.sufficientStock}</div>
                        <div className="text-sm text-muted-foreground">Sufficient Stock</div>
                    </div>
                </div>

                {/* Material Usage Table */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Material Usage by Task</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Material</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Stock Status</TableHead>
                                <TableHead className="text-right">Planned</TableHead>
                                <TableHead className="text-right">Used</TableHead>
                                <TableHead className="text-right">Usage %</TableHead>
                                <TableHead>Progress</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {materialUsageData.map((materialData, index) => {
                                const material = materialData.material;
                                const usagePercent = getUsageProgress(materialData.totalPlanned, materialData.totalUsed);
                                
                                return (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">
                                            {material?.material_name || 'Unknown Material'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{material?.category || 'N/A'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {getStockStatusBadge(materialData.stockStatus)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {materialData.totalPlanned.toFixed(2)} {material?.unit || 'units'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {materialData.totalUsed.toFixed(2)} {material?.unit || 'units'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {usagePercent.toFixed(1)}%
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={usagePercent} className="flex-1" />
                                                <span className="text-sm text-muted-foreground">
                                                    {usagePercent.toFixed(0)}%
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Task-wise Material Breakdown */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Material Requirements by Task</h3>
                    <div className="space-y-4">
                        {materialUsageData.map((materialData, index) => {
                            const material = materialData.material;
                            return (
                                <Card key={index}>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            {material?.material_name || 'Unknown Material'}
                                            {getStockStatusBadge(materialData.stockStatus)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Category:</span>
                                                    <span className="ml-2">{material?.category || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Current Stock:</span>
                                                    <span className="ml-2">{material?.current_stock || 0} {material?.unit || 'units'}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4">
                                                <div className="text-sm font-medium mb-2">Used in Tasks:</div>
                                                <div className="space-y-1">
                                                    {materialData.tasks.map((taskData, taskIndex) => (
                                                        <div key={taskIndex} className="flex justify-between items-center text-sm">
                                                            <span>{taskData.task?.task_name || 'Unknown Task'}</span>
                                                            <div className="flex items-center gap-4">
                                                                <span>Planned: {taskData.planned} {taskData.unit}</span>
                                                                <span>Used: {taskData.used} {taskData.unit}</span>
                                                                <Progress 
                                                                    value={getUsageProgress(taskData.planned, taskData.used)} 
                                                                    className="w-20"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default MaterialUsageReport;
