import React, { useState } from 'react';
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
    
    const AddTaskDialog = ({ isOpen, onClose, onAddTask, projectCode, maxWbs }) => {
      const [name, setName] = useState('');
      const [type, setType] = useState('Task');
      const [duration, setDuration] = useState(1);
      const [predecessors, setPredecessors] = useState('');
      const { toast } = useToast();
    
      const handleSave = () => {
        if (!name || !type || !projectCode) {
          toast({
            title: 'Missing Information',
            description: 'Please fill in all required fields.',
            variant: 'destructive',
          });
          return;
        }
    
        const newWbsNumber = (parseInt(maxWbs?.split('.').pop() || '0', 10) + 1);
        const newWbs = `${Math.floor(newWbsNumber / 100) || 1}.${newWbsNumber}`;
    
        const newTask = {
          project_code: projectCode,
          wbs: newWbs,
          level: 1,
          name,
          type,
          status: 'Not Started',
          duration_days: parseInt(duration, 10) || 0,
          predecessors: predecessors,
          start_offset_days: 0,
          end_offset_days: (parseInt(duration, 10) || 1) -1,
        };
    
        onAddTask(newTask);
        onClose();
        // Reset form
        setName('');
        setType('Task');
        setDuration(1);
        setPredecessors('');
      };
    
      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Add a new task or milestone to your Work Breakdown Structure.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Task">Task</SelectItem>
                    <SelectItem value="Milestone">Milestone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration (days)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="col-span-3"
                  disabled={type === 'Milestone'}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="predecessors" className="text-right">
                  Predecessors
                </Label>
                <Input
                  id="predecessors"
                  value={predecessors}
                  onChange={(e) => setPredecessors(e.target.value)}
                  placeholder="e.g., 1, 5, 12"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };
    
    export default AddTaskDialog;