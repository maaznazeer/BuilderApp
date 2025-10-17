import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, CalendarPlus as CalendarIcon, Check, X } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const TradeSummaryWidget = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { projects, loading: projectsLoading } = useProject();
    
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
    const [onlyApproved, setOnlyApproved] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [summaryData, setSummaryData] = useState([]);

    useEffect(() => {
        if (projects.length > 0 && !selectedProject) {
            setSelectedProject(projects[0].project_code);
        }
    }, [projects, selectedProject]);

    const fetchData = useCallback(async () => {
        if (!selectedProject || !selectedMonth) return;

        setLoadingData(true);
        setSummaryData([]);

        try {
            // Calculate month start and end dates
            const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
            const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
            
            // Fetch payroll entries for the project and month
            let query = supabase
                .from('payroll_entries')
                .select(`
                    *,
                    workers(
                        worker_code,
                        first_name,
                        surname,
                        trade
                    )
                `)
                .eq('project_code', selectedProject)
                .gte('payment_date', monthStart.toISOString().split('T')[0])
                .lte('payment_date', monthEnd.toISOString().split('T')[0]);

            // Add status filter if only approved is selected
            if (onlyApproved) {
                query = query.eq('status', 'Approved');
            }

            const { data: payrollEntries, error } = await query;

            if (error) {
                throw error;
            }

            // Group by trade and calculate totals
            const tradeSummary = {};
            
            payrollEntries?.forEach(entry => {
                const trade = entry.workers?.trade || 'Uncategorized';
                
                if (!tradeSummary[trade]) {
                    tradeSummary[trade] = {
                        trade: trade,
                        total_due: 0,
                        total_paid: 0,
                        variance: 0,
                        worker_count: 0,
                        total_hours: 0,
                        total_overtime: 0
                    };
                }
                
                // Calculate amounts based on status
                const amount = entry.total_amount || 0;
                
                if (entry.status === 'Paid') {
                    tradeSummary[trade].total_paid += amount;
                } else {
                    tradeSummary[trade].total_due += amount;
                }
                
                tradeSummary[trade].total_hours += entry.hours_worked || 0;
                tradeSummary[trade].total_overtime += entry.overtime_hours || 0;
                tradeSummary[trade].worker_count += 1;
            });

            // Calculate variance and convert to array
            const summaryArray = Object.values(tradeSummary).map(trade => ({
                ...trade,
                variance: trade.total_due - trade.total_paid
            }));

            setSummaryData(summaryArray);
        } catch (error) {
            console.error('Error fetching trade summary:', error);
            toast({ 
                title: t('payroll.trade_summary.fetch_error'), 
                description: error.message, 
                variant: 'destructive' 
            });
            setSummaryData([]);
        }
        
        setLoadingData(false);
    }, [selectedProject, selectedMonth, onlyApproved, toast, t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '0';
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const totalDue = summaryData.reduce((sum, row) => sum + (row.total_due || 0), 0);
    const totalPaid = summaryData.reduce((sum, row) => sum + (row.total_paid || 0), 0);
    const totalVariance = totalDue - totalPaid;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('Trade Summary')}</CardTitle>
                    <CardDescription>{t('Summary of payroll by trade for the selected month.')}</CardDescription>
                <div className="flex flex-wrap gap-4 items-center pt-4">
                    <Select value={selectedProject || ''} onValueChange={setSelectedProject} disabled={projectsLoading}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder={projectsLoading ? t('common.loading') : t('payroll.trade_summary.select_project')} />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map(p => <SelectItem key={p.project_code} value={p.project_code}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(selectedMonth, 'MMMM yyyy')}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={selectedMonth} onSelect={setSelectedMonth} initialFocus views={['months', 'years']} />
                        </PopoverContent>
                    </Popover>
                    <div className="flex items-center space-x-2">
                        <Switch id="only-approved" checked={onlyApproved} onCheckedChange={setOnlyApproved} />
                        <Label htmlFor="only-approved">{t('Only Approved')}</Label>
                    </div>
                    <Button onClick={fetchData} disabled={loadingData || !selectedProject}>
                        {loadingData && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('common.refresh')}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Trade</TableHead>
                                <TableHead className="text-center">Workers</TableHead>
                                <TableHead className="text-center">Hours</TableHead>
                                <TableHead className="text-center">Overtime</TableHead>
                                <TableHead className="text-right">Total Due</TableHead>
                                <TableHead className="text-right">Total Paid</TableHead>
                                <TableHead className="text-right">Variance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingData ? (
                                <TableRow><TableCell colSpan={7} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : summaryData.length > 0 ? (
                                summaryData.map((row) => (
                                    <TableRow key={row.trade}>
                                        <TableCell className="font-medium">{row.trade || 'Uncategorized'}</TableCell>
                                        <TableCell className="text-center">{row.worker_count}</TableCell>
                                        <TableCell className="text-center">{row.total_hours}h</TableCell>
                                        <TableCell className="text-center">{row.total_overtime}h</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(row.total_due)}</TableCell>
                                        <TableCell className="text-right text-green-600 font-medium">{formatCurrency(row.total_paid)}</TableCell>
                                        <TableCell className={`text-right font-bold ${row.variance > 0 ? 'text-red-600' : row.variance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                            {formatCurrency(row.variance)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={7} className="text-center h-24">No payroll data found for this project and month</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
        
        {/* Summary Cards */}
        {summaryData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Total Due</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDue)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Variance</p>
                                <p className={`text-2xl font-bold ${totalVariance > 0 ? 'text-red-600' : totalVariance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                    {formatCurrency(totalVariance)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Total Workers</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {summaryData.reduce((sum, trade) => sum + trade.worker_count, 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
        </div>
    );
};

export default TradeSummaryWidget;