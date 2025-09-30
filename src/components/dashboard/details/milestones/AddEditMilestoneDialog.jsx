import React, {useState, useEffect} from 'react';
import {supabase} from '@/lib/customSupabaseClient';
import {useToast} from '@/components/ui/use-toast';
import {Button, buttonVariants} from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Calendar} from '@/components/ui/calendar';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {format} from 'date-fns';
import {Calendar as CalendarIcon, Loader2} from 'lucide-react';
import {cn} from '@/lib/utils';

const AddEditMilestoneDialog = ({isOpen, onOpenChange, onSave, milestone, projectId}) => {
    const {toast} = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({title: '', due_date: new Date(), status: 'Planned'});

    useEffect(() => {
        if (milestone) {
            setFormData({
                title: milestone.title || '',
                due_date: milestone.due_date ? new Date(milestone.due_date) : null,
                status: milestone.status || 'Planned',
            });
        } else {
            setFormData({title: '', due_date: null, status: 'Planned'});
        }
    }, [milestone, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.due_date) {
            toast({variant: 'destructive', title: 'Validation Error', description: 'Title and Due Date are required.'});
            return;
        }
        setLoading(true);

        const payload = {
            ...formData,
            project_id: projectId,
            due_date: formData.due_date.toISOString().split('T')[0],
            // progress: milestone ? milestone.progress : 0,
        };

        const {error} = milestone?.id
            ? await supabase.from('milestones').update(payload).eq('id', milestone.id)
            : await supabase.from('milestones').insert(payload);

        setLoading(false);
        if (error) {
            toast({variant: 'destructive', title: 'Error', description: error.message});
        } else {
            toast({title: 'Success!', description: `Milestone ${milestone ? 'updated' : 'created'}.`});
            onSave();
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent id="my-dialog-content">
                <DialogHeader>
                    <DialogTitle>{milestone ? 'Edit Milestone' : 'Add New Milestone'}</DialogTitle>
                    <DialogDescription>Define a major goal or deliverable for your project.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="title">Milestone Title</Label>
                        <Input id="title" value={formData.title}
                               onChange={(e) => setFormData({...formData, title: e.target.value})} required/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="due_date">Due Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        id="due_date"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.due_date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4"/>
                                        {formData.due_date
                                            ? format(new Date(formData.due_date), "PPP")  // ✅ ensure Date for formatting
                                            : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-50" disablePortal={true}>
                                        <Calendar
                                            mode="single"
                                            selected={formData.due_date || undefined}
                                            onSelect={(d) => {
                                                if (d) {
                                                    setFormData(prev => ({...prev, due_date: d}))
                                                }
                                            }}
                                            defaultMonth={formData.due_date || new Date()}  // <– important
                                            initialFocus
                                        />

                                    </PopoverContent>
                                </Popover>
                        </div>
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status}
                                    onValueChange={(value) => setFormData({...formData, status: value})}>
                                <SelectTrigger><SelectValue placeholder="Select status"/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planned">Planned</SelectItem>
                                    <SelectItem value="not_started">Not Started</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="delayed">Delayed</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {milestone ? 'Save Changes' : 'Create Milestone'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddEditMilestoneDialog;