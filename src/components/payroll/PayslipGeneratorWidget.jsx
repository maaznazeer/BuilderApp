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
        const { t } = useTranslation();
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
                console.log('No project selected, clearing workers');
                setWorkers([]);
                setSelectedWorker(null);
                return;
            }
            
            console.log('Fetching workers for project:', selectedProject);
            setLoadingWorkers(true);
            
            try {
                // Debug: Check what payroll entries exist for this project
                console.log('Debug: Checking payroll entries for project:', selectedProject);
                const { data: debugPayroll, error: debugError } = await supabase
                    .from('payroll_entries')
                    .select('worker_code, project_code')
                    .eq('project_code', selectedProject);
                
                console.log('Debug payroll entries:', debugPayroll);
                
                // First try to get workers from payroll_entries table (workers who have payroll entries for this project)
                console.log('Trying payroll_entries table...');
                const { data: payrollWorkers, error: payrollError } = await supabase
                    .from('payroll_entries')
                    .select(`
                        workers(
                            worker_code,
                            first_name,
                            surname,
                            trade,
                            daily_rate,
                            active
                        )
                    `)
                    .eq('project_code', selectedProject)
                    .not('workers', 'is', null);

                if (payrollError) {
                    console.log('Payroll workers error:', payrollError);
                } else {
                    console.log('Payroll workers fetched:', payrollWorkers?.length || 0);
                    const uniqueWorkers = [];
                    const seenWorkers = new Set();
                    
                    payrollWorkers?.forEach(entry => {
                        if (entry.workers && !seenWorkers.has(entry.workers.worker_code)) {
                            seenWorkers.add(entry.workers.worker_code);
                            uniqueWorkers.push(entry.workers);
                        }
                    });
                    
                    console.log('Unique workers from payroll:', uniqueWorkers.length);
                    
                    if (uniqueWorkers.length > 0) {
                        setWorkers(uniqueWorkers);
                        setSelectedWorker(uniqueWorkers[0].worker_code);
                        setLoadingWorkers(false);
                        return;
                    }
                }

                // Try worker_projects table as fallback
                console.log('Trying worker_projects table...');
                const { data: projectWorkers, error: projectError } = await supabase
                .from('worker_projects')
                .select('workers(*)')
                .eq('project_code', selectedProject)
                .eq('active', true);

                if (projectError) {
                    console.log('Project workers error:', projectError);
                } else {
                    console.log('Project workers fetched:', projectWorkers?.length || 0);
                    const workerList = projectWorkers?.map(item => item.workers).filter(Boolean) || [];
                    console.log('Filtered worker list:', workerList.length);
                    
                    if (workerList.length > 0) {
                        setWorkers(workerList);
                        setSelectedWorker(workerList[0].worker_code);
                        setLoadingWorkers(false);
                        return;
                    }
                }

                // Debug: Check all workers in database
                console.log('Debug: Checking all workers in database...');
                const { data: debugAllWorkers, error: debugAllError } = await supabase
                    .from('workers')
                    .select('worker_code, first_name, surname, active')
                    .order('first_name');
                
                console.log('Debug all workers:', debugAllWorkers);

                // No workers found for this project - show empty list
                console.log('No workers found for this project');
                setWorkers([]);
                setSelectedWorker(null);
            } catch (error) {
                console.error('Error fetching workers:', error);
                toast({ 
                    title: 'Error fetching workers', 
                    description: error.message, 
                    variant: 'destructive' 
                });
                setWorkers([]);
                setSelectedWorker(null);
            }
            
            setLoadingWorkers(false);
        }, [selectedProject, toast]);

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
                // First, let's try to generate a simple payslip using the existing data
                console.log('Generating payslip for:', { selectedProject, selectedWorker, selectedMonth });
                
                // Fetch worker details
                const { data: workerData, error: workerError } = await supabase
                    .from('workers')
                    .select('*')
                    .eq('worker_code', selectedWorker)
                    .single();

                if (workerError) {
                    throw new Error(`Worker not found: ${workerError.message}`);
                }

                // Fetch payroll entries for the worker and month
                const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
                const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
                
                const { data: payrollData, error: payrollError } = await supabase
                    .from('payroll_entries')
                    .select('*')
                    .eq('worker_code', selectedWorker)
                    .eq('project_code', selectedProject)
                    .gte('payment_date', monthStart.toISOString().split('T')[0])
                    .lte('payment_date', monthEnd.toISOString().split('T')[0]);

                if (payrollError) {
                    throw new Error(`Error fetching payroll data: ${payrollError.message}`);
                }

                console.log('Payroll data:', payrollData);

                // Calculate totals
                const totalHours = payrollData.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0);
                const totalOvertime = payrollData.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0);
                const totalBonus = payrollData.reduce((sum, entry) => sum + (entry.bonus || 0), 0);
                const totalDeductions = payrollData.reduce((sum, entry) => sum + (entry.deductions || 0), 0);
                const totalAmount = payrollData.reduce((sum, entry) => sum + (entry.total_amount || 0), 0);

                // Helper function to format currency as numbers only
                const formatCurrency = (amount) => {
                    return new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(amount || 0);
                };

                // Create a clean, professional HTML payslip
                const payslipHTML = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Payslip - ${workerData.first_name} ${workerData.surname}</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { 
                                font-family: 'Arial', sans-serif; 
                                background: #f5f5f5;
                                padding: 20px;
                                line-height: 1.6;
                            }
                            .payslip-container {
                                max-width: 800px;
                                margin: 0 auto;
                                background: white;
                                border: 1px solid #ddd;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                            }
                            .header { 
                                background: #2c3e50;
                                color: white;
                                padding: 25px;
                                text-align: center;
                                border-bottom: 3px solid #34495e;
                            }
                            .company { 
                                font-size: 24px; 
                                font-weight: bold; 
                                margin-bottom: 5px;
                            }
                            .payslip-title { 
                                font-size: 16px; 
                                opacity: 0.9;
                            }
                            .content {
                                padding: 25px;
                            }
                            .details { 
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 25px;
                                margin-bottom: 25px;
                                background: #f8f9fa;
                                padding: 20px;
                                border: 1px solid #e9ecef;
                            }
                            .section h3 { 
                                color: #2c3e50;
                                font-size: 14px;
                                margin-bottom: 12px;
                                padding-bottom: 5px;
                                border-bottom: 1px solid #bdc3c7;
                                font-weight: bold;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                            }
                            .section p {
                                margin-bottom: 6px;
                                color: #555;
                                font-size: 13px;
                            }
                            .section strong {
                                color: #2c3e50;
                                font-weight: bold;
                            }
                            .summary-section {
                                margin-bottom: 25px;
                            }
                            .summary-section h3 {
                                color: #2c3e50;
                                font-size: 16px;
                                margin-bottom: 12px;
                                padding-bottom: 5px;
                                border-bottom: 1px solid #bdc3c7;
                                font-weight: bold;
                            }
                            table { 
                                width: 100%; 
                                border-collapse: collapse; 
                                margin-bottom: 20px;
                                background: white;
                                border: 1px solid #ddd;
                            }
                            th { 
                                background: #34495e;
                                color: white;
                                padding: 12px 8px;
                                text-align: left;
                                font-weight: bold;
                                font-size: 12px;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                            }
                            td { 
                                padding: 10px 8px;
                                border-bottom: 1px solid #ecf0f1;
                                font-size: 12px;
                                color: #555;
                            }
                            tr:nth-child(even) {
                                background-color: #f8f9fa;
                            }
                            .totals-table {
                                background: #f8f9fa;
                                border: 1px solid #ddd;
                            }
                            .totals-table td {
                                padding: 12px 15px;
                                font-size: 13px;
                            }
                            .total-row {
                                background: #2c3e50;
                                color: white;
                                font-weight: bold;
                                font-size: 14px;
                            }
                            .total-row td {
                                color: white;
                                border: none;
                            }
                            .footer { 
                                background: #34495e;
                                color: white;
                                padding: 15px;
                                text-align: center;
                                font-size: 11px;
                                opacity: 0.8;
                            }
                            .currency {
                                font-weight: bold;
                                color: #27ae60;
                            }
                            .negative {
                                color: #e74c3c;
                            }
                            .positive {
                                color: #27ae60;
                            }
                            @media print {
                                body { background: white; padding: 0; }
                                .payslip-container { box-shadow: none; border: 1px solid #000; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="payslip-container">
                            <div class="header">
                                <div class="company">DOMUS Builder</div>
                                <div class="payslip-title">PAYSLIP STATEMENT</div>
                            </div>
                            
                            <div class="content">
                                <div class="details">
                                    <div class="section">
                                        <h3>Employee Information</h3>
                                        <p><strong>Name:</strong> ${workerData.first_name} ${workerData.surname}</p>
                                        <p><strong>Worker Code:</strong> ${workerData.worker_code}</p>
                                        <p><strong>Trade:</strong> ${workerData.trade || 'N/A'}</p>
                                        <p><strong>Daily Rate:</strong> <span class="currency">${formatCurrency(workerData.daily_rate || 0)}</span></p>
                                    </div>
                                    <div class="section">
                                        <h3>Pay Period Details</h3>
                                        <p><strong>Month:</strong> ${format(selectedMonth, 'MMMM yyyy')}</p>
                                        <p><strong>Project:</strong> ${selectedProject}</p>
                                        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
                                        <p><strong>Status:</strong> <span class="positive">Generated</span></p>
                                    </div>
                                </div>

                                <div class="summary-section">
                                    <h3>Detailed Payroll Breakdown</h3>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Hours</th>
                                                <th>Overtime</th>
                                                <th>Rate</th>
                                                <th>O/T Rate</th>
                                                <th>Bonus</th>
                                                <th>Deductions</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${payrollData.length > 0 ? payrollData.map(entry => `
                                                <tr>
                                                    <td>${new Date(entry.payment_date).toLocaleDateString()}</td>
                                                    <td>${entry.hours_worked || 0}h</td>
                                                    <td>${entry.overtime_hours || 0}h</td>
                                                    <td class="currency">${formatCurrency(entry.hourly_rate || 0)}</td>
                                                    <td class="currency">${formatCurrency(entry.overtime_rate || 0)}</td>
                                                    <td class="currency positive">${formatCurrency(entry.bonus || 0)}</td>
                                                    <td class="currency negative">${formatCurrency(entry.deductions || 0)}</td>
                                                    <td class="currency">${formatCurrency(entry.total_amount || 0)}</td>
                                                </tr>
                                            `).join('') : `
                                                <tr>
                                                    <td colspan="8" style="text-align: center; color: #7f8c8d; font-style: italic;">
                                                        No payroll entries found for this period
                                                    </td>
                                                </tr>
                                            `}
                                        </tbody>
                                    </table>
                                </div>

                                <div class="summary-section">
                                    <h3>Monthly Summary</h3>
                                    <table class="totals-table">
                                        <tr>
                                            <td><strong>Total Hours Worked:</strong></td>
                                            <td><strong>${totalHours} hours</strong></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Total Overtime Hours:</strong></td>
                                            <td><strong>${totalOvertime} hours</strong></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Total Bonus:</strong></td>
                                            <td class="currency positive"><strong>${formatCurrency(totalBonus)}</strong></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Total Deductions:</strong></td>
                                            <td class="currency negative"><strong>${formatCurrency(totalDeductions)}</strong></td>
                                        </tr>
                                        <tr class="total-row">
                                            <td><strong>NET PAY:</strong></td>
                                            <td><strong>${formatCurrency(totalAmount)}</strong></td>
                                        </tr>
                                    </table>
                                </div>
                            </div>

                            <div class="footer">
                                <p>This payslip was generated automatically by DOMUS Builder Payroll System</p>
                                <p>Secure • Automated • Professional</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;

                // Create and download the HTML file
                const blob = new Blob([payslipHTML], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `payslip_${workerData.worker_code}_${format(selectedMonth, 'yyyy-MM')}.html`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast({ 
                    title: t('payroll.payslip.generate_success'), 
                    description: `Payslip for ${workerData.first_name} ${workerData.surname} has been downloaded.` 
                });

            } catch (error) {
                console.error('Payslip generation error:', error);
                toast({ 
                    title: t('payroll.payslip.generate_error'), 
                    description: error.message, 
                    variant: 'destructive' 
                });
            } finally {
                setLoadingPdf(false);
            }
        };

        return (
            <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('payroll.payslip.title')}</CardTitle>
                    <CardDescription>{t('payroll.payslip.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Project</label>
                        <Select value={selectedProject || ''} onValueChange={setSelectedProject} disabled={projectsLoading}>
                            <SelectTrigger>
                                <SelectValue placeholder={projectsLoading ? t('common.loading') : t('payroll.payslip.select_project')} />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(p => <SelectItem key={p.project_code} value={p.project_code}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Worker</label>
                        <Select value={selectedWorker || ''} onValueChange={setSelectedWorker} disabled={loadingWorkers || !selectedProject}>
                            <SelectTrigger>
                                        <SelectValue placeholder={
                                            loadingWorkers 
                                                ? t('common.loading') 
                                                : workers.length === 0 
                                                    ? 'No workers found' 
                                                    : t('payroll.payslip.select_worker')
                                        } />
                            </SelectTrigger>
                            <SelectContent>
                                        {workers.length > 0 ? (
                                            workers.map(w => (
                                                <SelectItem key={w.worker_code} value={w.worker_code}>
                                                    {`${w.first_name} ${w.surname}`}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="px-2 py-1.5 text-sm text-gray-500">No workers available</div>
                                        )}
                            </SelectContent>
                        </Select>
                                {!loadingWorkers && workers.length === 0 && selectedProject && (
                                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                                        <p className="text-sm text-amber-800">
                                            <strong>No workers found for this project.</strong>
                                        </p>
                                        <p className="text-xs text-amber-700 mt-1">
                                            This project doesn't have any workers with payroll entries. Try selecting a different project or add workers to this project first.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Month</label>
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
                        </div>
                        
                    <div className="flex justify-end">
                            <Button onClick={handleGeneratePayslip} disabled={loadingPdf || !selectedProject || !selectedWorker} size="lg">
                            {loadingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            {t('payroll.payslip.generate_button')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

                {/* Worker Info Card */}
                {selectedWorker && workers.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Worker Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                const worker = workers.find(w => w.worker_code === selectedWorker);
                                return worker ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Name</p>
                                            <p className="text-lg">{`${worker.first_name} ${worker.surname}`}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Worker Code</p>
                                            <p className="text-lg">{worker.worker_code}</p>
                                        </div>
                                        {worker.trade && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Trade</p>
                                                <p className="text-lg">{worker.trade}</p>
                                            </div>
                                        )}
                                        {worker.daily_rate && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Daily Rate</p>
                                                <p className="text-lg">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(worker.daily_rate)}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : null;
                            })()}
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    export default PayslipGeneratorWidget;