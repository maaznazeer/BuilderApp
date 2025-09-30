import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ExportButtons from './ExportButtons';
import { EyeOff } from 'lucide-react';
import { usePlan } from '@/hooks/usePlan';

const BudgetReport = ({ budgetLines, timeLogs }) => {
    const { hasFeature } = usePlan();
    const canViewBudget = hasFeature('advanced_reports'); // Assuming advanced_reports unlocks this

    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

    const summary = useMemo(() => {
        if (!canViewBudget) return null;
        
        const laborCost = timeLogs.filter(log => log.resources?.type === 'Person').reduce((sum, log) => sum + (log.hours * (log.resources.hourly_rate || 0)), 0);
        const equipmentCost = timeLogs.filter(log => log.resources?.type === 'Equipment').reduce((sum, log) => sum + (log.hours * (log.resources.hourly_rate || 0)), 0);
        const materialCost = budgetLines.filter(line => line.category === 'Material').reduce((sum, line) => sum + (line.total_cost || 0), 0);
        const fixedCost = budgetLines.filter(line => line.category === 'Fixed').reduce((sum, line) => sum + (line.total_cost || 0), 0);
        const totalBudget = budgetLines.reduce((sum, line) => sum + (line.total_cost || 0), 0);
        const totalActual = laborCost + equipmentCost + materialCost + fixedCost;

        return { totalBudget, totalActual, laborCost, equipmentCost, materialCost, fixedCost, variance: totalActual - totalBudget };
    }, [budgetLines, timeLogs, canViewBudget]);
    
    if (!canViewBudget) {
        return (
            <Card id="budget-report" className="flex flex-col items-center justify-center text-center p-8">
                <EyeOff className="h-12 w-12 text-muted-foreground mb-4" />
                <CardHeader><CardTitle>Budget Report Unavailable</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">You do not have permission to view budget information.</p></CardContent>
            </Card>
        );
    }

    return (
        <Card id="budget-report">
            <CardHeader>
                <CardTitle>Budget vs. Actual Report</CardTitle>
                <CardDescription>A summary of planned budget against actual costs.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Budgeted</TableHead><TableHead className="text-right">Actual</TableHead><TableHead className="text-right">Variance</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell>Labor</TableCell><TableCell className="text-right">{formatCurrency(budgetLines.filter(l => l.category === 'Labor').reduce((s, i) => s + i.total_cost, 0))}</TableCell><TableCell className="text-right">{formatCurrency(summary.laborCost)}</TableCell><TableCell className={`text-right ${summary.laborCost > budgetLines.filter(l => l.category === 'Labor').reduce((s, i) => s + i.total_cost, 0) ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(summary.laborCost - budgetLines.filter(l => l.category === 'Labor').reduce((s, i) => s + i.total_cost, 0))}</TableCell></TableRow>
                        <TableRow><TableCell>Equipment</TableCell><TableCell className="text-right">{formatCurrency(budgetLines.filter(l => l.category === 'Equipment').reduce((s, i) => s + i.total_cost, 0))}</TableCell><TableCell className="text-right">{formatCurrency(summary.equipmentCost)}</TableCell><TableCell className={`text-right ${summary.equipmentCost > budgetLines.filter(l => l.category === 'Equipment').reduce((s, i) => s + i.total_cost, 0) ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(summary.equipmentCost - budgetLines.filter(l => l.category === 'Equipment').reduce((s, i) => s + i.total_cost, 0))}</TableCell></TableRow>
                        <TableRow><TableCell>Materials</TableCell><TableCell className="text-right">{formatCurrency(summary.materialCost)}</TableCell><TableCell className="text-right">{formatCurrency(summary.materialCost)}</TableCell><TableCell className="text-right">{formatCurrency(0)}</TableCell></TableRow>
                        <TableRow><TableCell>Fixed Costs</TableCell><TableCell className="text-right">{formatCurrency(summary.fixedCost)}</TableCell><TableCell className="text-right">{formatCurrency(summary.fixedCost)}</TableCell><TableCell className="text-right">{formatCurrency(0)}</TableCell></TableRow>
                        <TableRow className="font-bold bg-gray-50"><TableCell>Total</TableCell><TableCell className="text-right">{formatCurrency(summary.totalBudget)}</TableCell><TableCell className="text-right">{formatCurrency(summary.totalActual)}</TableCell><TableCell className={`text-right ${summary.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(summary.variance)}</TableCell></TableRow>
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <ExportButtons reportId="budget-report" reportName="Budget_Report" />
            </CardFooter>
        </Card>
    );
};

export default BudgetReport;