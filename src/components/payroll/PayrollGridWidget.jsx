import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Loader2, CalendarPlus as CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';

const PayrollGridWidget = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { projects, loading: projectsLoading } = useProject();
    
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
    const [loadingData, setLoadingData] = useState(false);
    const [payrollData, setPayrollData] = useState([]);
    const [expandedWorkers, setExpandedWorkers] = useState({});

    useEffect(() => {
        if (projects.length > 0 && !selectedProject) {
            setSelectedProject(projects[0].project_code);
        }
    }, [projects, selectedProject]);

    const fetchData = useCallback(async () => {
        if (!selectedProject || !selectedMonth) return;

        setLoadingData(true);
        setPayrollData([]);

        const { data, error } = await supabase.rpc('rpc_payroll_month_grid_due_vs_paid', {
            p_project_code: selectedProject,
            p_month: format(selectedMonth, 'yyyy-MM-dd')
        });

        if (error) {
            toast({ title: t('payroll.grid.fetch_error'), description: error.message, variant: 'destructive' });
        } else {
            setPayrollData(data || []);
        }
        setLoadingData(false);
    }, [selectedProject, selectedMonth, toast, t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const groupedData = useMemo(() => {
        return payrollData.reduce((acc, row) => {
            if (!acc[row.worker_code]) {
                acc[row.worker_code] = {
                    fullName: row.full_name,
                    monthDue: row.amount_due_per_month,
                    monthPaid: row.amount_paid_per_month,
                    monthVariance: row.variance_month,
                    weeks: {}
                };
            }
            if (!acc[row.worker_code].weeks[row.week_label]) {
                acc[row.worker_code].weeks[row.week_label] = {
                    weekDue: row.amount_due_per_week,
                    weekPaid: row.amount_paid_per_week,
                    weekVariance: row.variance_week,
                    days: []
                };
            }
            acc[row.worker_code].weeks[row.week_label].days.push(row);
            return acc;
        }, {});
    }, [payrollData]);

    const toggleWorker = (workerCode) => {
        setExpandedWorkers(prev => ({ ...prev, [workerCode]: !prev[workerCode] }));
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('payroll.grid.title')}</CardTitle>
                <CardDescription>{t('payroll.grid.description')}</CardDescription>
                <div className="flex flex-wrap gap-4 items-center pt-4">
                    <Select value={selectedProject || ''} onValueChange={setSelectedProject} disabled={projectsLoading}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder={projectsLoading ? t('common.loading') : t('payroll.grid.select_project')} />
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
                                <TableHead className="w-[40px]"></TableHead>
                                <TableHead>{t('payroll.grid.worker')}</TableHead>
                                <TableHead className="text-right">{t('payroll.grid.month_due')}</TableHead>
                                <TableHead className="text-right">{t('payroll.grid.month_paid')}</TableHead>
                                <TableHead className="text-right">{t('payroll.grid.month_balance')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingData ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : Object.keys(groupedData).length > 0 ? (
                                Object.entries(groupedData).map(([workerCode, workerData]) => (
                                    <React.Fragment key={workerCode}>
                                        <TableRow className="bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => toggleWorker(workerCode)}>
                                            <TableCell>
                                                <Button variant="ghost" size="icon">
                                                    {expandedWorkers[workerCode] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                            </TableCell>
                                            <TableCell className="font-medium">{workerData.fullName}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(workerData.monthDue)}</TableCell>
                                            <TableCell className="text-right text-green-600">{formatCurrency(workerData.monthPaid)}</TableCell>
                                            <TableCell className={`text-right font-bold ${workerData.monthVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(workerData.monthVariance)}</TableCell>
                                        </TableRow>
                                        {expandedWorkers[workerCode] && (
                                            <>
                                                {Object.entries(workerData.weeks).map(([weekLabel, weekData]) => (
                                                    <React.Fragment key={weekLabel}>
                                                        <TableRow className="bg-blue-50">
                                                            <TableCell colSpan={2} className="pl-12 font-semibold">{weekLabel}</TableCell>
                                                            <TableCell className="text-right font-semibold">{formatCurrency(weekData.weekDue)}</TableCell>
                                                            <TableCell className="text-right font-semibold text-green-600">{formatCurrency(weekData.weekPaid)}</TableCell>
                                                            <TableCell className={`text-right font-bold ${weekData.weekVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(weekData.weekVariance)}</TableCell>
                                                        </TableRow>
                                                        {weekData.days.map((day, index) => (
                                                            <TableRow key={`${weekLabel}-${index}`} className="bg-white hover:bg-gray-50">
                                                                <TableCell colSpan={2} className="pl-16">{format(new Date(day.day), 'E, MMM dd')}</TableCell>
                                                                <TableCell className="text-right">{formatCurrency(day.amount_due_per_day)}</TableCell>
                                                                <TableCell className="text-right text-green-600">{formatCurrency(day.amount_paid_per_day)}</TableCell>
                                                                <TableCell></TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </React.Fragment>
                                                ))}
                                            </>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">{t('common.no_data')}</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default PayrollGridWidget;