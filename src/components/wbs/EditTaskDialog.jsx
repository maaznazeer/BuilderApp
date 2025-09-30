import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const statusOptions = ["Not Started", "In Progress", "On Hold", "Delayed", "Done"];
const priorityOptions = ["Low", "Medium", "High", "Critical"];

const EditTaskDialog = ({ isOpen, onClose, task, onUpdateTask }) => {
  const [formData, setFormData] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        phase: task.phase || '',
        status: task.status || 'Not Started',
        duration_days: task.duration_days || 1,
        predecessors: task.predecessors || '',
        priority: task.priority || 'Medium',
      });
    }
  }, [task]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name) {
      toast({
        title: 'Missing Information',
        description: 'Task name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    const updates = {
      ...formData,
      duration_days: parseInt(formData.duration_days, 10) || 0,
    };

    onUpdateTask(task.id, updates);
    onClose();
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the details for task: {task.wbs} - {task.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phase" className="text-right">Phase</Label>
            <Input id="phase" value={formData.phase} onChange={(e) => handleChange('phase', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
              <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
              <SelectContent>
                {priorityOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">Duration (days)</Label>
            <Input id="duration" type="number" min="0" value={formData.duration_days} onChange={(e) => handleChange('duration_days', e.target.value)} className="col-span-3" disabled={task.type === 'Milestone'} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="predecessors" className="text-right">Predecessors</Label>
            <Input id="predecessors" value={formData.predecessors} onChange={(e) => handleChange('predecessors', e.target.value)} placeholder="e.g., 1.1, 1.2" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;