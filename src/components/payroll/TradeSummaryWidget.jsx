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
    const { t } = useTranslation(['custom']);
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

        const { data, error } = await supabase.rpc('rpc_payroll_trade_summary_month', {
            p_project_code: selectedProject,
            p_month: format(selectedMonth, 'yyyy-MM-dd'),
            p_only_approved: onlyApproved
        });

        if (error) {
            toast({ title: t('payroll.trade_summary.fetch_error'), description: error.message, variant: 'destructive' });
        } else {
            setSummaryData(data || []);
        }
        setLoadingData(false);
    }, [selectedProject, selectedMonth, onlyApproved, toast, t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('payroll.trade_summary.title')}</CardTitle>
                <CardDescription>{t('payroll.trade_summary.description')}</CardDescription>
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
                        <Label htmlFor="only-approved">{t('payroll.trade_summary.only_approved')}</Label>
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
                                <TableHead>{t('payroll.trade_summary.trade')}</TableHead>
                                <TableHead className="text-right">{t('payroll.trade_summary.total_due')}</TableHead>
                                <TableHead className="text-right">{t('payroll.trade_summary.total_paid')}</TableHead>
                                <TableHead className="text-right">{t('payroll.trade_summary.variance')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingData ? (
                                <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : summaryData.length > 0 ? (
                                summaryData.map((row) => (
                                    <TableRow key={row.trade}>
                                        <TableCell className="font-medium">{row.trade || 'Uncategorized'}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(row.total_due)}</TableCell>
                                        <TableCell className="text-right text-green-600">{formatCurrency(row.total_paid)}</TableCell>
                                        <TableCell className={`text-right font-bold ${row.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(row.variance)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={4} className="text-center h-24">{t('common.no_data')}</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default TradeSummaryWidget;