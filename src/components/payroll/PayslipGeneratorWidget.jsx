import React, { useState, useEffect, useCallback } from 'react';
    import { useTranslation } from 'react-i18next';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { useProject } from '@/contexts/ProjectContext';
    import { Button } from '@/components/ui/button';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Calendar } from '@/components/ui/calendar';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
    import { Loader2, CalendarPlus as CalendarIcon, Download } from 'lucide-react';
    import { format, startOfMonth } from 'date-fns';

    const PayslipGeneratorWidget = () => {
        const { t } = useTranslation(['custom']);
        const { toast } = useToast();
        const { projects, loading: projectsLoading } = useProject();
        
        const [selectedProject, setSelectedProject] = useState(null);
        const [selectedWorker, setSelectedWorker] = useState(null);
        const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
        
        const [workers, setWorkers] = useState([]);
        const [loadingWorkers, setLoadingWorkers] = useState(false);
        const [loadingPdf, setLoadingPdf] = useState(false);

        useEffect(() => {
            if (projects.length > 0 && !selectedProject) {
                setSelectedProject(projects[0].project_code);
            }
        }, [projects, selectedProject]);

        const fetchWorkersForProject = useCallback(async () => {
            if (!selectedProject) {
                setWorkers([]);
                setSelectedWorker(null);
                return;
            }
            setLoadingWorkers(true);
            const { data, error } = await supabase
                .from('worker_projects')
                .select('workers(*)')
                .eq('project_code', selectedProject)
                .eq('active', true);

            if (error) {
                toast({ title: t('payroll.payslip.fetch_workers_error'), description: error.message, variant: 'destructive' });
                setWorkers([]);
            } else {
                const workerList = data.map(item => item.workers).filter(Boolean);
                setWorkers(workerList);
                if (workerList.length > 0) {
                    setSelectedWorker(workerList[0].worker_code);
                } else {
                    setSelectedWorker(null);
                }
            }
            setLoadingWorkers(false);
        }, [selectedProject, toast, t]);

        useEffect(() => {
            fetchWorkersForProject();
        }, [fetchWorkersForProject]);

        const handleGeneratePayslip = async () => {
            if (!selectedProject || !selectedWorker || !selectedMonth) {
                toast({ title: t('payroll.payslip.missing_params_error'), variant: 'destructive' });
                return;
            }
            setLoadingPdf(true);
            try {
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;

                const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payslip?project_code=${selectedProject}&worker_code=${selectedWorker}&month=${format(selectedMonth, 'yyyy-MM-dd')}`;
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${sessionData.session.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to generate PDF');
                }

                const { base64, filename } = await response.json();
                
                const byteCharacters = atob(base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast({ title: t('payroll.payslip.generate_success'), description: `${filename} has been downloaded.` });

            } catch (error) {
                toast({ title: t('payroll.payslip.generate_error'), description: error.message, variant: 'destructive' });
            } finally {
                setLoadingPdf(false);
            }
        };

        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('payroll.payslip.title')}</CardTitle>
                    <CardDescription>{t('payroll.payslip.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select value={selectedProject || ''} onValueChange={setSelectedProject} disabled={projectsLoading}>
                            <SelectTrigger>
                                <SelectValue placeholder={projectsLoading ? t('common.loading') : t('payroll.payslip.select_project')} />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(p => <SelectItem key={p.project_code} value={p.project_code}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedWorker || ''} onValueChange={setSelectedWorker} disabled={loadingWorkers || !selectedProject}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingWorkers ? t('common.loading') : t('payroll.payslip.select_worker')} />
                            </SelectTrigger>
                            <SelectContent>
                                {workers.map(w => <SelectItem key={w.worker_code} value={w.worker_code}>{`${w.first_name} ${w.surname}`}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(selectedMonth, 'MMMM yyyy')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={selectedMonth} onSelect={setSelectedMonth} initialFocus views={['months', 'years']} />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleGeneratePayslip} disabled={loadingPdf || !selectedProject || !selectedWorker}>
                            {loadingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            {t('payroll.payslip.generate_button')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    export default PayslipGeneratorWidget;