import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Check, X, Search, DollarSign, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

const PayrollApprovalWidget = () => {
    const { t } = useTranslation(['custom']);
    const { toast } = useToast();
    const { projects, loading: projectsLoading } = useProject();
    
    const [selectedProject, setSelectedProject] = useState(null);
    const [payrollEntries, setPayrollEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        console.log('📋 Projects loaded:', projects);
        if (projects.length > 0 && !selectedProject) {
            console.log('🔍 First project structure:', projects[0]);
            console.log('🔍 Available fields:', Object.keys(projects[0]));
            
            // Try different possible field names for project code
            const projectCode = projects[0].code || projects[0].project_code || projects[0].id;
            console.log('🎯 Selected project code:', projectCode);
            setSelectedProject(projectCode);
        }
    }, [projects, selectedProject]);

    const fetchPayrollEntries = useCallback(async () => {
        if (!selectedProject) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('payroll_entries')
                .select(`
                    *,
                    workers(first_name, surname, worker_code)
                `)
                .eq('project_code', selectedProject)
                .order('payment_date', { ascending: false });

            if (error) {
                console.error('Payroll fetch error:', error);
                throw error;
            }
            
            setPayrollEntries(data || []);
        } catch (error) {
            console.error('Payroll fetch error details:', error);
            toast({ 
                title: 'Error fetching payroll entries', 
                description: error.message, 
                variant: 'destructive' 
            });
        } finally {
            setLoading(false);
        }
    }, [selectedProject, toast]);

    useEffect(() => {
        fetchPayrollEntries();
    }, [fetchPayrollEntries]);

    const handleApprove = async (payrollId) => {
        try {
            const { error } = await supabase
                .from('payroll_entries')
                .update({ status: 'Approved' })
                .eq('id', payrollId);

            if (error) throw error;
            
            toast({ title: 'Payroll approved successfully!' });
            fetchPayrollEntries();
        } catch (error) {
            toast({ 
                title: 'Error approving payroll', 
                description: error.message, 
                variant: 'destructive' 
            });
        }
    };

    const handleReject = async (payrollId) => {
        try {
            const { error } = await supabase
                .from('payroll_entries')
                .update({ status: 'Rejected' })
                .eq('id', payrollId);

            if (error) throw error;
            
            toast({ title: 'Payroll rejected successfully!' });
            fetchPayrollEntries();
        } catch (error) {
            toast({ 
                title: 'Error rejecting payroll', 
                description: error.message, 
                variant: 'destructive' 
            });
        }
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return 'N/A';
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            minimumFractionDigits: 2 
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const variants = {
            'Pending': 'secondary',
            'Approved': 'default',
            // 'Paid': 'success',
            'Rejected': 'destructive'
        };
        return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const filteredEntries = payrollEntries.filter(entry => {
        const searchLower = searchTerm.toLowerCase();
        const workerName = entry.workers ? `${entry.workers.first_name || ''} ${entry.workers.surname || ''}`.trim() : '';
        const matchesSearch = (
            workerName.toLowerCase().includes(searchLower) ||
            entry.workers?.worker_code?.toLowerCase().includes(searchLower) ||
            entry.notes?.toLowerCase().includes(searchLower)
        );
        const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalAmount = filteredEntries.reduce((sum, entry) => {
        const regularPay = (entry.hours_worked || 0) * (entry.hourly_rate || 0);
        const overtimePay = (entry.overtime_hours || 0) * (entry.overtime_rate || 0);
        const bonus = entry.bonus || 0;
        const deductions = entry.deductions || 0;
        return sum + regularPay + overtimePay + bonus - deductions;
    }, 0);

    const pendingCount = filteredEntries.filter(entry => entry.status === 'Pending').length;
    const approvedCount = filteredEntries.filter(entry => entry.status === 'Approved').length;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Payroll Approval
                            </CardTitle>
                            <CardDescription>
                                Review and approve payroll entries for workers
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <Select value={selectedProject || ''} onValueChange={(value) => {
                            console.log('🎯 Project selection changed to:', value);
                            setSelectedProject(value);
                        }}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(project => {
                                    const projectCode = project.code || project.project_code || project.id;
                                    const projectName = project.name || project.project_name;
                                    return (
                                        <SelectItem key={projectCode} value={projectCode}>
                                            {projectName}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full md:w-[150px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                {/* <SelectItem value="Paid">Paid</SelectItem> */}
                                <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search workers or notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                    <div>
                                        <p className="text-sm font-medium">Pending</p>
                                        <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <div>
                                        <p className="text-sm font-medium">Approved</p>
                                        <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-blue-500" />
                                    <div>
                                        <p className="text-sm font-medium">Total Amount</p>
                                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Worker</TableHead>
                                        <TableHead>Payment Date</TableHead>
                                        <TableHead>Hours Worked</TableHead>
                                        <TableHead>Hourly Rate</TableHead>
                                        <TableHead>Overtime</TableHead>
                                        <TableHead>Bonus</TableHead>
                                        <TableHead>Deductions</TableHead>
                                        <TableHead>Total Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEntries.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                                No payroll entries found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredEntries.map((entry) => {
                                            const regularPay = (entry.hours_worked || 0) * (entry.hourly_rate || 0);
                                            const overtimePay = (entry.overtime_hours || 0) * (entry.overtime_rate || 0);
                                            const bonus = entry.bonus || 0;
                                            const deductions = entry.deductions || 0;
                                            const total = regularPay + overtimePay + bonus - deductions;

                                            return (
                                                <TableRow key={entry.id}>
                                                    <TableCell className="font-medium">
                                                        {entry.workers ? `${entry.workers.first_name || ''} ${entry.workers.surname || ''}`.trim() || 'Unknown' : 'Unknown'}
                                                        <div className="text-sm text-muted-foreground">
                                                            {entry.workers?.worker_code}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {entry.payment_date ? format(new Date(entry.payment_date), 'MMM dd, yyyy') : 
                                                         entry.created_at ? format(new Date(entry.created_at), 'MMM dd, yyyy') : 
                                                         entry.updated_at ? format(new Date(entry.updated_at), 'MMM dd, yyyy') : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>{entry.hours_worked || 0}h</TableCell>
                                                    <TableCell>{formatCurrency(entry.hourly_rate || 0)}</TableCell>
                                                    <TableCell>
                                                        {entry.overtime_hours || 0}h @ {formatCurrency(entry.overtime_rate || 0)}
                                                    </TableCell>
                                                    <TableCell>{formatCurrency(entry.bonus || 0)}</TableCell>
                                                    <TableCell>{formatCurrency(entry.deductions || 0)}</TableCell>
                                                    <TableCell className="font-semibold">
                                                        {formatCurrency(total)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(entry.status)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {entry.status === 'Pending' && (
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleApprove(entry.id)}
                                                                    className="text-green-600 hover:text-green-700"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleReject(entry.id)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                        {entry.status !== 'Pending' && (
                                                            <span className="text-sm text-muted-foreground">
                                                                {entry.status}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PayrollApprovalWidget;
