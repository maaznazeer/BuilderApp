import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const AddEditTaskDialog = ({ isOpen, onOpenChange, onSave, task, milestoneId, milestones, projectId, collaborators }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
      title: '', description: '', milestone_id: milestoneId, due_date: null, assigned_to: null,
    });
  
    useEffect(() => {
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          milestone_id: task.milestone_id || milestoneId,
          due_date: task.due_date ? new Date(task.due_date) : null,
          assigned_to: task.assigned_to || null,
        });
      } else {
        setFormData({
          title: '', description: '', milestone_id: milestoneId, due_date: null, assigned_to: null,
        });
      }
    }, [task, milestoneId, isOpen]);
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.milestone_id || !formData.due_date) {
          toast({ variant: 'destructive', title: 'Validation Error', description: 'Title, Milestone, and Due Date are required.' });
          return;
        }
        setLoading(true);
      
        const payload = {
            ...formData,
            project_id: projectId,
            due_date: formData.due_date.toISOString().split('T')[0],
            completed: task ? task.completed : false,
        };

        const { error } = task?.id
          ? await supabase.from('tasks').update(payload).eq('id', task.id)
          : await supabase.from('tasks').insert(payload);
    
        setLoading(false);
        if (error) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
        } else {
          toast({ title: 'Success!', description: `Task ${task ? 'updated' : 'created'}.` });
          onSave();
          onOpenChange(false);
        }
    };
  
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                <DialogDescription>Break down your milestone into actionable steps.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <Select value={formData.milestone_id} onValueChange={(val) => setFormData({...formData, milestone_id: val})}>
                    <Label htmlFor="milestone">Milestone</Label>
                    <SelectTrigger id="milestone"><SelectValue placeholder="Select a milestone" /></SelectTrigger>
                    <SelectContent>
                    {milestones.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                    </SelectContent>
                </Select>
                <div>
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input id="task-title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Due Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.due_date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.due_date ? format(formData.due_date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.due_date} onSelect={(d) => setFormData({...formData, due_date: d})} /></PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Label>Assigned To</Label>
                        <Select value={formData.assigned_to || ''} onValueChange={(val) => setFormData({...formData, assigned_to: val || null})}>
                            <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Unassigned</SelectItem>
                                {collaborators.map(c => <SelectItem key={c.profiles.id} value={c.profiles.id}>{c.profiles.full_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {task ? 'Save Changes' : 'Create Task'}
                    </Button>
                </DialogFooter>
            </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddEditTaskDialog;