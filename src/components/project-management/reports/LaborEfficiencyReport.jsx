import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Clock, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const LaborEfficiencyReport = ({ timeLogs, taskAssignments, tasks, payrollEntries }) => {
    const laborData = useMemo(() => {
        // Group time logs by resource
        const resourceGroups = {};
        
        timeLogs.forEach(log => {
            const resourceId = log.resource_id;
            if (!resourceGroups[resourceId]) {
                resourceGroups[resourceId] = {
                    resource: log.resources,
                    totalHours: 0,
                    totalCost: 0,
                    tasks: [],
                    efficiency: 0
                };
            }
            
            resourceGroups[resourceId].totalHours += log.hours || 0;
            resourceGroups[resourceId].totalCost += (log.hours || 0) * (log.resources?.hourly_rate || 0);
            
            // Find the task for this time log
            const task = tasks.find(t => t.task_id === log.task_id);
            if (task) {
                const existingTask = resourceGroups[resourceId].tasks.find(t => t.task_id === log.task_id);
                if (existingTask) {
                    existingTask.hours += log.hours || 0;
                    existingTask.cost += (log.hours || 0) * (log.resources?.hourly_rate || 0);
                } else {
                    resourceGroups[resourceId].tasks.push({
                        task_id: log.task_id,
                        task_name: task.task_name,
                        hours: log.hours || 0,
                        cost: (log.hours || 0) * (log.resources?.hourly_rate || 0),
                        status: task.status,
                        percent_complete: task.percent_complete || 0
                    });
                }
            }
        });

        // Calculate efficiency for each resource
        Object.values(resourceGroups).forEach(resource => {
            const completedTasks = resource.tasks.filter(t => t.status === 'Completed').length;
            const totalTasks = resource.tasks.length;
            resource.efficiency = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        });

        return Object.values(resourceGroups);
    }, [timeLogs, tasks]);

    const summary = useMemo(() => {
        const totalResources = laborData.length;
        const totalHours = laborData.reduce((sum, r) => sum + r.totalHours, 0);
        const totalCost = laborData.reduce((sum, r) => sum + r.totalCost, 0);
        const avgEfficiency = laborData.length > 0 
            ? laborData.reduce((sum, r) => sum + r.efficiency, 0) / laborData.length 
            : 0;

        const highPerformers = laborData.filter(r => r.efficiency >= 80).length;
        const mediumPerformers = laborData.filter(r => r.efficiency >= 50 && r.efficiency < 80).length;
        const lowPerformers = laborData.filter(r => r.efficiency < 50).length;

        return {
            totalResources,
            totalHours,
            totalCost,
            avgEfficiency,
            highPerformers,
            mediumPerformers,
            lowPerformers
        };
    }, [laborData]);

    const getEfficiencyBadge = (efficiency) => {
        if (efficiency >= 80) {
            return <Badge variant="outline" className="text-green-600 border-green-300">High</Badge>;
        } else if (efficiency >= 50) {
            return <Badge variant="outline" className="text-amber-600 border-amber-300">Medium</Badge>;
        } else {
            return <Badge variant="outline" className="text-red-600 border-red-300">Low</Badge>;
        }
    };

    const getEfficiencyIcon = (efficiency) => {
        if (efficiency >= 80) {
            return <TrendingUp className="h-4 w-4 text-green-600" />;
        } else if (efficiency < 50) {
            return <TrendingDown className="h-4 w-4 text-red-600" />;
        }
        return null;
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
    }).format(amount || 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Labor Efficiency Report
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-medium text-muted-foreground">Total Resources</div>
                            <div className="text-2xl font-bold">{summary.totalResources}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-medium text-muted-foreground">Total Hours</div>
                            <div className="text-2xl font-bold">{summary.totalHours.toFixed(1)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-medium text-muted-foreground">Total Cost</div>
                            <div className="text-2xl font-bold">{formatCurrency(summary.totalCost)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-medium text-muted-foreground">Avg Efficiency</div>
                            <div className="text-2xl font-bold">{summary.avgEfficiency.toFixed(1)}%</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Performance Overview */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{summary.highPerformers}</div>
                        <div className="text-sm text-muted-foreground">High Performers</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">{summary.mediumPerformers}</div>
                        <div className="text-sm text-muted-foreground">Medium Performers</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{summary.lowPerformers}</div>
                        <div className="text-sm text-muted-foreground">Low Performers</div>
                    </div>
                </div>

                {/* Resource Performance Table */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Resource Performance</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Resource</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Hours</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                                <TableHead className="text-right">Tasks</TableHead>
                                <TableHead className="text-right">Efficiency</TableHead>
                                <TableHead>Performance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {laborData.map((resource, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">
                                        {resource.resource?.resource_name || 'Unknown Resource'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{resource.resource?.type || 'N/A'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {resource.totalHours.toFixed(1)}h
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(resource.totalCost)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {resource.tasks.length}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {getEfficiencyIcon(resource.efficiency)}
                                            <span>{resource.efficiency.toFixed(1)}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getEfficiencyBadge(resource.efficiency)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Task-wise Performance */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Task Performance by Resource</h3>
                    <div className="space-y-4">
                        {laborData.map((resource, index) => (
                            <Card key={index}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        {resource.resource?.resource_name || 'Unknown Resource'}
                                        {getEfficiencyBadge(resource.efficiency)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                        <div>
                                            <span className="text-muted-foreground">Total Hours:</span>
                                            <span className="ml-2 font-medium">{resource.totalHours.toFixed(1)}h</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Total Cost:</span>
                                            <span className="ml-2 font-medium">{formatCurrency(resource.totalCost)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">Tasks:</div>
                                        <div className="space-y-1">
                                            {resource.tasks.map((task, taskIndex) => (
                                                <div key={taskIndex} className="flex justify-between items-center text-sm">
                                                    <span>{task.task_name}</span>
                                                    <div className="flex items-center gap-4">
                                                        <span>{task.hours.toFixed(1)}h</span>
                                                        <span>{formatCurrency(task.cost)}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Progress value={task.percent_complete} className="w-20" />
                                                            <span className="text-xs text-muted-foreground">
                                                                {task.percent_complete}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Cost Analysis */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Cost Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Hourly Rates</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {laborData.map((resource, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm">
                                            <span>{resource.resource?.resource_name || 'Unknown'}</span>
                                            <span className="font-medium">
                                                {formatCurrency(resource.resource?.hourly_rate || 0)}/hr
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Cost per Resource</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {laborData.map((resource, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm">
                                            <span>{resource.resource?.resource_name || 'Unknown'}</span>
                                            <span className="font-medium">{formatCurrency(resource.totalCost)}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default LaborEfficiencyReport;
