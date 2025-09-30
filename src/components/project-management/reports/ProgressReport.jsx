import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ExportButtons from './ExportButtons';

const ProgressReport = ({ tasks }) => {
    const overallProgress = useMemo(() => {
        if (tasks.length === 0) return 0;
        const totalProgress = tasks.reduce((acc, task) => acc + (task.percent_complete || 0), 0);
        return Math.round(totalProgress / tasks.length);
    }, [tasks]);

    const statusCounts = useMemo(() => {
        return tasks.reduce((acc, task) => {
            const status = task.status || 'Not Started';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, { 'Not Started': 0, 'In Progress': 0, 'Completed': 0, 'Delayed': 0 });
    }, [tasks]);

    return (
        <Card id="progress-report">
            <CardHeader>
                <CardTitle>Progress Report</CardTitle>
                <CardDescription>Overall project completion and task status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm font-bold">{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-semibold">Total Tasks:</span> {tasks.length}</div>
                    <div><span className="font-semibold">Completed:</span> {statusCounts['Completed']}</div>
                    <div><span className="font-semibold">In Progress:</span> {statusCounts['In Progress']}</div>
                    <div><span className="font-semibold">Delayed:</span> {statusCounts['Delayed']}</div>
                </div>
            </CardContent>
            <CardFooter>
                <ExportButtons reportId="progress-report" reportName="Progress_Report" />
            </CardFooter>
        </Card>
    );
};

export default ProgressReport;