import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast";

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AddEditCalendarDialog = ({ isOpen, onClose, onSave, calendar }) => {
    const [name, setName] = useState('');
    const [dailyHours, setDailyHours] = useState('8');
    const [workDays, setWorkDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    const [exceptions, setExceptions] = useState('{}');
    const { toast } = useToast();

    useEffect(() => {
        if (calendar) {
            setName(calendar.name || '');
            setDailyHours(calendar.daily_hours?.toString() || '8');
            setWorkDays(calendar.work_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
            setExceptions(calendar.exceptions ? JSON.stringify(calendar.exceptions, null, 2) : '{}');
        } else {
            // Reset form for new calendar
            setName('');
            setDailyHours('8');
            setWorkDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
            setExceptions('{}');
        }
    }, [calendar, isOpen]);

    const handleWorkDayChange = (day) => {
        setWorkDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSave = () => {
        if (!name) {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'Calendar Name is required.' });
            return;
        }
        let parsedExceptions;
        try {
            parsedExceptions = JSON.parse(exceptions);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Invalid JSON', description: 'Exceptions must be valid JSON.' });
            return;
        }
        
        const calendarData = {
            name,
            daily_hours: parseFloat(dailyHours) || 8,
            work_days: workDays,
            exceptions: parsedExceptions,
        };

        onSave(calendarData, calendar?.calendar_id);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{calendar ? 'Edit Calendar' : 'Create New Calendar'}</DialogTitle>
                    <DialogDescription>Define the working schedule for this calendar.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="calendarName">Calendar Name</Label>
                        <Input id="calendarName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Standard Work Week" />
                    </div>
                    <div className="space-y-2">
                        <Label>Working Days</Label>
                        <div className="flex flex-wrap gap-4 pt-2">
                            {weekDays.map(day => (
                                <div key={day} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`day-${day}`}
                                        checked={workDays.includes(day)}
                                        onCheckedChange={() => handleWorkDayChange(day)}
                                    />
                                    <Label htmlFor={`day-${day}`} className="font-normal">{day}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="dailyHours">Default Daily Hours</Label>
                        <Input id="dailyHours" type="number" value={dailyHours} onChange={(e) => setDailyHours(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="exceptions">Exceptions (JSON)</Label>
                        <Textarea
                            id="exceptions"
                            value={exceptions}
                            onChange={(e) => setExceptions(e.target.value)}
                            rows={4}
                            placeholder='e.g., {"2025-12-25": 0, "2025-12-26": 4}'
                        />
                        <p className="text-xs text-muted-foreground">Define non-working days or days with different hours in JSON format.</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Calendar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddEditCalendarDialog;