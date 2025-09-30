import React, { useState, useEffect } from 'react';
        import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
        import { Button } from "@/components/ui/button";
        import { Input } from "@/components/ui/input";
        import { Label } from "@/components/ui/label";
        import { Textarea } from "@/components/ui/textarea";
        import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
        import { Calendar } from "@/components/ui/calendar";
        import { CalendarPlus as CalendarIcon } from 'lucide-react';
        import { format } from 'date-fns';
        import { cn } from '@/lib/utils';
        import { supabase } from '@/lib/customSupabaseClient';

const AddTaskDialog = ({ isOpen, onClose, onSave, project }) => {
    const [taskName, setTaskName] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [notes, setNotes] = useState('');
    const [isMilestone, setIsMilestone] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setTaskName('');
            setStartDate(null);
            setEndDate(null);
            setNotes('');
            setIsMilestone(false);
        }
    }, [isOpen]);

    const handleSave = () => {
        if (!taskName || !startDate || !endDate) {
            alert("Please fill all required fields.");
            return;
        }
        onSave({
            task_name: taskName,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            notes,
            is_milestone: isMilestone,
            status: 'Not Started',
            percent_complete: 0,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="taskName">Task Name</Label>
                        <Input id="taskName" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="isMilestone" checked={isMilestone} onChange={(e) => setIsMilestone(e.target.checked)} />
                        <Label htmlFor="isMilestone">Mark as Milestone</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Task</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddTaskDialog;