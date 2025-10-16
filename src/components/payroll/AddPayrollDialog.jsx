import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/customSupabaseClient';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

const AddPayrollDialog = ({ isOpen, onClose, onSave, payroll, projects, workers = [], loadingWorkers = false }) => {
    const [workerCode, setWorkerCode] = useState('');
    const [projectCode, setProjectCode] = useState('');
    const [payPeriod, setPayPeriod] = useState(() => new Date());
    const [hoursWorked, setHoursWorked] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');
    const [overtimeHours, setOvertimeHours] = useState('');
    const [overtimeRate, setOvertimeRate] = useState('');
    const [bonus, setBonus] = useState('');
    const [deductions, setDeductions] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (payroll) {
            setWorkerCode(payroll.worker_code || '');
            setProjectCode(payroll.project_code || '');
            const dateValue = payroll.payment_date ? new Date(payroll.payment_date) : new Date();
            setPayPeriod(isNaN(dateValue.getTime()) ? new Date() : dateValue);
            setHoursWorked(payroll.hours_worked?.toString() || '');
            setHourlyRate(payroll.hourly_rate?.toString() || '');
            setOvertimeHours(payroll.overtime_hours?.toString() || '');
            setOvertimeRate(payroll.overtime_rate?.toString() || '');
            setBonus(payroll.bonus?.toString() || '');
            setDeductions(payroll.deductions?.toString() || '');
            setNotes(payroll.notes || '');
        } else {
            // Reset form for new payroll entry
            setWorkerCode('');
            setProjectCode('');
            setPayPeriod(new Date());
            setHoursWorked('');
            setHourlyRate('');
            setOvertimeHours('');
            setOvertimeRate('');
            setBonus('');
            setDeductions('');
            setNotes('');
        }
    }, [payroll, isOpen]);

    const handleSave = async () => {
        if (!workerCode || !projectCode || !hoursWorked || !hourlyRate) {
            toast({ 
                variant: 'destructive', 
                title: 'Validation Error', 
                description: 'Worker, Project, Hours Worked, and Hourly Rate are required.' 
            });
            return;
        }

        setLoading(true);
        try {
            const payrollData = {
                worker_code: workerCode,
                project_code: projectCode,
                payment_date: payPeriod && !isNaN(new Date(payPeriod).getTime()) ? format(payPeriod, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                hours_worked: parseFloat(hoursWorked) || 0,
                hourly_rate: parseFloat(hourlyRate) || 0,
                overtime_hours: parseFloat(overtimeHours) || 0,
                overtime_rate: parseFloat(overtimeRate) || 0,
                bonus: parseFloat(bonus) || 0,
                deductions: parseFloat(deductions) || 0,
                notes: notes,
                status: 'Pending'
            };

            if (payroll?.id) {
                // Update existing payroll
                const { error } = await supabase
                    .from('payroll_entries')
                    .update(payrollData)
                    .eq('id', payroll.id);
                
                if (error) throw error;
                toast({ title: 'Payroll Updated!', description: 'Payroll entry has been updated successfully.' });
            } else {
                // Create new payroll
                const { error } = await supabase
                    .from('payroll_entries')
                    .insert([payrollData]);
                
                if (error) throw error;
                toast({ title: 'Payroll Added!', description: 'New payroll entry has been created successfully.' });
            }

            onSave();
            onClose();
        } catch (error) {
            toast({ 
                variant: 'destructive', 
                title: 'Error', 
                description: error.message || 'Failed to save payroll entry.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        const regularPay = (parseFloat(hoursWorked) || 0) * (parseFloat(hourlyRate) || 0);
        const overtimePay = (parseFloat(overtimeHours) || 0) * (parseFloat(overtimeRate) || 0);
        const bonusAmount = parseFloat(bonus) || 0;
        const deductionAmount = parseFloat(deductions) || 0;
        
        return regularPay + overtimePay + bonusAmount - deductionAmount;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{payroll ? 'Edit Payroll Entry' : 'Add New Payroll Entry'}</DialogTitle>
                    <DialogDescription>Enter the payroll details for the worker below.</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="worker">Worker *</Label>
                            <Select value={workerCode} onValueChange={setWorkerCode}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a worker" />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingWorkers ? (
                                        <SelectItem value="" disabled>Loading workers...</SelectItem>
                                    ) : workers.length === 0 ? (
                                        <SelectItem value="" disabled>No workers available</SelectItem>
                                    ) : (
                                        workers.map(worker => (
                                            <SelectItem key={worker.worker_code} value={worker.worker_code}>
                                                {`${worker.first_name || ''} ${worker.surname || ''}`.trim()} ({worker.worker_code})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="project">Project *</Label>
                            <Select value={projectCode} onValueChange={setProjectCode}>
                                <SelectTrigger>
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
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Pay Period *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {payPeriod && !isNaN(new Date(payPeriod).getTime()) ? format(payPeriod, 'PPP') : 'Select a date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={payPeriod && !isNaN(new Date(payPeriod).getTime()) ? payPeriod : new Date()}
                                    onSelect={(date) => setPayPeriod(date || new Date())}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="hoursWorked">Hours Worked *</Label>
                            <Input 
                                id="hoursWorked" 
                                type="number" 
                                step="0.1"
                                value={hoursWorked} 
                                onChange={(e) => setHoursWorked(e.target.value)} 
                                placeholder="40"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
                            <Input 
                                id="hourlyRate" 
                                type="number" 
                                step="0.01"
                                value={hourlyRate} 
                                onChange={(e) => setHourlyRate(e.target.value)} 
                                placeholder="25.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="overtimeHours">Overtime Hours</Label>
                            <Input 
                                id="overtimeHours" 
                                type="number" 
                                step="0.1"
                                value={overtimeHours} 
                                onChange={(e) => setOvertimeHours(e.target.value)} 
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="overtimeRate">Overtime Rate ($)</Label>
                            <Input 
                                id="overtimeRate" 
                                type="number" 
                                step="0.01"
                                value={overtimeRate} 
                                onChange={(e) => setOvertimeRate(e.target.value)} 
                                placeholder="37.50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bonus">Bonus ($)</Label>
                            <Input 
                                id="bonus" 
                                type="number" 
                                step="0.01"
                                value={bonus} 
                                onChange={(e) => setBonus(e.target.value)} 
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deductions">Deductions ($)</Label>
                            <Input 
                                id="deductions" 
                                type="number" 
                                step="0.01"
                                value={deductions} 
                                onChange={(e) => setDeductions(e.target.value)} 
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea 
                            id="notes" 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            placeholder="Additional notes about this payroll entry..."
                            rows={3}
                        />
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Total Pay:</span>
                            <span className="text-lg font-bold text-green-600">
                                ${calculateTotal().toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : (payroll ? 'Update Payroll' : 'Add Payroll')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddPayrollDialog;
