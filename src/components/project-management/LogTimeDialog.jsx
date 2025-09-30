import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/customSupabaseClient';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const LogTimeDialog = ({ isOpen, onClose, onSave, task }) => {
    const [resources, setResources] = useState([]);
    const [selectedResource, setSelectedResource] = useState('');
    const [hours, setHours] = useState('');
    const [date, setDate] = useState(new Date());
    const [notes, setNotes] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        const fetchResources = async () => {
            const { data, error } = await supabase
                .from('resources')
                .select('resource_id, resource_name')
                .in('type', ['Person', 'Equipment'])
                .eq('active', true);
            if (error) {
                toast({ title: 'Error fetching resources', variant: 'destructive' });
            } else {
                setResources(data);
            }
        };
        if (isOpen) {
            fetchResources();
        }
    }, [isOpen, toast]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedResource('');
            setHours('');
            setDate(new Date());
            setNotes('');
        }
    }, [isOpen]);

    const handleSave = () => {
        if (!task || !selectedResource || !hours || !date) {
            toast({ title: 'Missing fields', description: 'Please fill out all required fields.', variant: 'destructive' });
            return;
        }

        onSave({
            task_id: task.task_id,
            resource_id: selectedResource,
            date: format(date, 'yyyy-MM-dd'),
            hours: parseFloat(hours),
            notes,
            source: 'Manual'
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Time</DialogTitle>
                    <DialogDescription>Log time for task: <span className="font-semibold">{task?.task_name}</span></DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Resource</Label>
                        <Select value={selectedResource} onValueChange={setSelectedResource}>
                            <SelectTrigger><SelectValue placeholder="Select a resource" /></SelectTrigger>
                            <SelectContent>
                                {resources.map(r => <SelectItem key={r.resource_id} value={r.resource_id}>{r.resource_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Hours</Label>
                            <Input type="number" step="0.1" value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g. 2.5" />
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Notes (Optional)</Label>
                        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe the work done..." />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Log Time</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LogTimeDialog;