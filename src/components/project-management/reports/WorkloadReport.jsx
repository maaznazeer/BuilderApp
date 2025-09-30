import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import ExportButtons from './ExportButtons';

const WorkloadReport = ({ timeLogs, resources }) => {
    const workload = useMemo(() => {
        const resourceHours = timeLogs.reduce((acc, log) => {
            if (log.resource_id) {
                acc[log.resource_id] = (acc[log.resource_id] || 0) + log.hours;
            }
            return acc;
        }, {});

        return Object.entries(resourceHours)
            .map(([resourceId, hours]) => {
                const resource = resources.find(r => r.resource_id === resourceId);
                return {
                    name: resource ? resource.resource_name : 'Unknown Resource',
                    hours: hours.toFixed(1),
                };
            })
            .sort((a, b) => b.hours - a.hours);
    }, [timeLogs, resources]);

    return (
        <Card id="workload-report">
            <CardHeader>
                <CardTitle>Workload Report</CardTitle>
                <CardDescription>Total hours logged per resource.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-48">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Resource</TableHead>
                                <TableHead className="text-right">Total Hours</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {workload.length > 0 ? workload.map(item => (
                                <TableRow key={item.name}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-right">{item.hours}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center">No time logged yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
            <CardFooter>
                <ExportButtons reportId="workload-report" reportName="Workload_Report" />
            </CardFooter>
        </Card>
    );
};

export default WorkloadReport;