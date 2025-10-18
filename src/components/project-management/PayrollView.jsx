import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CalendarPlus as CalendarIcon, ChevronDown, ChevronUp, Clock, Users, DollarSign } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import { usePlannerWorkflow } from '@/hooks/usePlannerWorkflow';

const PayrollView = ({ selectedProject, projects, setSelectedProject }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return startOfMonth(now);
    });
    const [loadingData, setLoadingData] = useState(false);
    const [payrollData, setPayrollData] = useState([]);
    const [expandedWorkers, setExpandedWorkers] = useState({});
    const [showTimeLogIntegration, setShowTimeLogIntegration] = useState(false);
    
    // Use the planner workflow hook for comprehensive data
    const {
        timeLogs,
        tasks,
        generatePayrollFromTimeLogs,
        loading: workflowLoading
    } = usePlannerWorkflow(selectedProject);

    const fetchData = useCallback(async () => {
        if (!selectedProject || !selectedMonth || isNaN(selectedMonth.getTime())) {
            return;
        }
        setLoadingData(true);
        setPayrollData([]);

        try {
            // Calculate month start and end dates (same as TradeSummaryWidget)
            const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
            const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
            
            // First, get the project code from the project ID
            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .select('code')
                .eq('id', selectedProject)
                .single();

            if (projectError || !projectData) {
                toast({ title: 'Project not found', description: 'Could not find project details', variant: 'destructive' });
                setPayrollData([]);
                return;
            }
            
            // Query payroll_entries table with the project code
            const { data: payrollEntries, error } = await supabase
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
                .eq('project_code', projectData.code)
                .gte('payment_date', monthStart.toISOString().split('T')[0])
                .lte('payment_date', monthEnd.toISOString().split('T')[0]);

            if (error) {
                toast({ title: 'Error fetching payroll data', description: error.message, variant: 'destructive' });
            } else {
                setPayrollData(payrollEntries || []);
                
                // If no data found, show helpful message
                if (!payrollEntries || payrollEntries.length === 0) {
                    toast({ 
                        title: 'No Data Found', 
                        description: 'No payroll entries found for this project and month. Try adding some payroll data first.', 
                        variant: 'default' 
                    });
                }
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch payroll data', variant: 'destructive' });
        }
        
        setLoadingData(false);
    }, [selectedProject, selectedMonth, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const groupedData = payrollData.reduce((acc, entry) => {
        const workerCode = entry.worker_code;
        const workerName = entry.workers ? `${entry.workers.first_name} ${entry.workers.surname}` : 'Unknown Worker';
        
        if (!acc[workerCode]) {
            acc[workerCode] = {
                fullName: workerName,
                monthDue: 0,
                monthPaid: 0,
                monthVariance: 0,
                weeks: {}
            };
        }
        
        // Calculate totals
        const totalAmount = entry.total_amount || 0;
        const isPaid = entry.status === 'Paid';
        
        acc[workerCode].monthDue += totalAmount;
        if (isPaid) {
            acc[workerCode].monthPaid += totalAmount;
        }
        
        // Group by week (simplified - just use payment date)
        const paymentDate = new Date(entry.payment_date);
        const weekStart = new Date(paymentDate);
        weekStart.setDate(paymentDate.getDate() - paymentDate.getDay());
        const weekLabel = `Week of ${weekStart.toLocaleDateString()}`;
        
        if (!acc[workerCode].weeks[weekLabel]) {
            acc[workerCode].weeks[weekLabel] = {
                weekDue: 0,
                weekPaid: 0,
                weekVariance: 0,
                days: []
            };
        }
        
        acc[workerCode].weeks[weekLabel].weekDue += totalAmount;
        if (isPaid) {
            acc[workerCode].weeks[weekLabel].weekPaid += totalAmount;
        }
        
        // Add day entry
        acc[workerCode].weeks[weekLabel].days.push({
            day: entry.payment_date,
            amount_due_per_day: totalAmount,
            amount_paid_per_day: isPaid ? totalAmount : 0,
            status: entry.status,
            hours_worked: entry.hours_worked,
            overtime_hours: entry.overtime_hours,
            bonus: entry.bonus,
            deductions: entry.deductions
        });
        
        return acc;
    }, {});
    
    // Calculate variances after processing all entries
    Object.keys(groupedData).forEach(workerCode => {
        const worker = groupedData[workerCode];
        worker.monthVariance = worker.monthDue - worker.monthPaid;
        
        Object.keys(worker.weeks).forEach(weekLabel => {
            const week = worker.weeks[weekLabel];
            week.weekVariance = week.weekDue - week.weekPaid;
        });
    });

    const toggleWorker = (workerCode) => {
        setExpandedWorkers(prev => ({ ...prev, [workerCode]: !prev[workerCode] }));
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '0';
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Project Payroll</CardTitle>
                    <CardDescription>Payroll overview for {selectedProject}</CardDescription>
                    <div className="flex flex-wrap gap-4 items-center pt-4">
                        <Select value={selectedProject || ''} onValueChange={setSelectedProject}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Select Project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(p => {
                                    const projectId = p.id || p.project_id;
                                    return (
                                        <SelectItem key={projectId} value={projectId}>
                                            {p.name}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedMonth && !isNaN(selectedMonth.getTime()) ? format(selectedMonth, 'MMMM yyyy') : 'Select Month'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={selectedMonth} onSelect={setSelectedMonth} initialFocus views={['months', 'years']} />
                            </PopoverContent>
                        </Popover>
                        <Button onClick={fetchData} disabled={loadingData || !selectedProject}>
                            {loadingData && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Time Log Integration Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Time Log Integration
                    </CardTitle>
                    <CardDescription>
                        Generate payroll entries from time logs for this project
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Available Time Logs</h4>
                                <p className="text-sm text-muted-foreground">
                                    {timeLogs.length} time log entries found for this project
                                </p>
                            </div>
                            <Button 
                                onClick={() => setShowTimeLogIntegration(!showTimeLogIntegration)}
                                variant="outline"
                            >
                                {showTimeLogIntegration ? 'Hide' : 'Show'} Integration
                            </Button>
                        </div>
                        
                        {showTimeLogIntegration && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-medium">Workers</span>
                                            </div>
                                            <div className="text-2xl font-bold">
                                                {new Set(timeLogs.map(tl => tl.worker_code).filter(Boolean)).size}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-green-600" />
                                                <span className="text-sm font-medium">Total Hours</span>
                                            </div>
                                            <div className="text-2xl font-bold">
                                                {timeLogs.reduce((sum, tl) => sum + (tl.hours || 0), 0).toFixed(1)}h
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-purple-600" />
                                                <span className="text-sm font-medium">Estimated Cost</span>
                                            </div>
                                            <div className="text-2xl font-bold">
                                                ${timeLogs.reduce((sum, tl) => {
                                                    const rate = tl.resources?.hourly_rate || 0;
                                                    return sum + ((tl.hours || 0) * rate);
                                                }, 0).toFixed(2)}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                
                                <div className="space-y-2">
                                    <h4 className="font-medium">Time Logs by Worker</h4>
                                    <div className="space-y-2">
                                        {Object.entries(
                                            timeLogs.reduce((acc, log) => {
                                                const workerCode = log.worker_code || 'unassigned';
                                                if (!acc[workerCode]) {
                                                    acc[workerCode] = [];
                                                }
                                                acc[workerCode].push(log);
                                                return acc;
                                            }, {})
                                        ).map(([workerCode, logs]) => {
                                            const totalHours = logs.reduce((sum, log) => sum + (log.hours || 0), 0);
                                            const totalCost = logs.reduce((sum, log) => {
                                                const rate = log.resources?.hourly_rate || 0;
                                                return sum + ((log.hours || 0) * rate);
                                            }, 0);
                                            
                                            return (
                                                <div key={workerCode} className="p-3 border rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <span className="font-medium">
                                                                {workerCode === 'unassigned' ? 'Unassigned' : `Worker ${workerCode}`}
                                                            </span>
                                                            <Badge variant="outline" className="ml-2">
                                                                {logs.length} entries
                                                            </Badge>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-medium">{totalHours.toFixed(1)}h</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                ${totalCost.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={async () => {
                                            try {
                                                const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
                                                const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
                                                
                                                const timeLogData = await generatePayrollFromTimeLogs(null, monthStart, monthEnd);
                                                toast({
                                                    title: 'Time Log Data Generated',
                                                    description: `Found ${timeLogData.length} days with time logs for payroll generation.`
                                                });
                                            } catch (error) {
                                                toast({
                                                    variant: 'destructive',
                                                    title: 'Error generating payroll data',
                                                    description: error.message
                                                });
                                            }
                                        }}
                                        disabled={timeLogs.length === 0}
                                    >
                                        Generate Payroll from Time Logs
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={() => {
                                            toast({
                                                title: 'Feature Coming Soon',
                                                description: 'Auto-populate payroll entries from time logs will be available soon.'
                                            });
                                        }}
                                    >
                                        Auto-populate Entries
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payroll Summary</CardTitle>
                    <CardDescription>Detailed payroll breakdown by worker and time period</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40px]"></TableHead>
                                    <TableHead>Worker</TableHead>
                                    <TableHead className="text-right">Month Due</TableHead>
                                    <TableHead className="text-right">Month Paid</TableHead>
                                    <TableHead className="text-right">Month Balance</TableHead>
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
                                    <TableRow><TableCell colSpan={5} className="text-center h-24">No payroll data found</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PayrollView;
