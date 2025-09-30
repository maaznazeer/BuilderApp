import React, { useState, useMemo } from 'react';
    import { X, Trash2, Plus } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import {
      Command,
      CommandEmpty,
      CommandGroup,
      CommandInput,
      CommandItem,
    } from '@/components/ui/command';
    import {
      Popover,
      PopoverContent,
      PopoverTrigger,
    } from '@/components/ui/popover';
    import { Badge } from '@/components/ui/badge';
    import { Separator } from '@/components/ui/separator';
    import { ScrollArea } from '@/components/ui/scroll-area';

    const DependencyPanel = ({ task, allTasks, onClose, updateAndSaveTask }) => {
      const [open, setOpen] = useState(false);

      const predecessors = useMemo(() => {
        const predWbs = new Set(task.predecessors?.split(',').map(p => p.trim()).filter(Boolean) || []);
        return allTasks.filter(t => predWbs.has(String(t.wbs)));
      }, [task.predecessors, allTasks]);

      const availableTasks = useMemo(() => {
        const predWbs = new Set(task.predecessors?.split(',').map(p => p.trim()).filter(Boolean) || []);
        // Cannot be a predecessor of itself or one of its existing predecessors
        return allTasks.filter(t => String(t.wbs) !== String(task.wbs) && !predWbs.has(String(t.wbs)) && t.type !== 'Summary');
      }, [task.wbs, task.predecessors, allTasks]);

      const handleUpdatePredecessors = (newPreds) => {
        const newPredString = newPreds.map(p => p.wbs).join(',');
        updateAndSaveTask(task.id, { predecessors: newPredString });
      };

      const addPredecessor = (predTask) => {
        const newPreds = [...predecessors, predTask];
        handleUpdatePredecessors(newPreds);
        setOpen(false);
      };

      const removePredecessor = (predTask) => {
        const newPreds = predecessors.filter(p => p.id !== predTask.id);
        handleUpdatePredecessors(newPreds);
      };

      return (
        <div className="absolute top-0 right-0 h-full w-80 bg-card border-l shadow-lg z-30 flex flex-col p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Dependencies</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mb-2">
            <p className="text-sm font-medium">{task.name}</p>
            <p className="text-xs text-muted-foreground">Editing predecessors for this task.</p>
          </div>
          <Separator className="my-4" />
          <div className="flex-grow space-y-2 overflow-y-auto">
            <h4 className="text-sm font-semibold mb-2">Predecessors ({predecessors.length})</h4>
            {predecessors.length > 0 ? (
              predecessors.map(pred => (
                <div key={pred.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                  <span className="truncate flex-1" title={pred.name}>{pred.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePredecessor(pred)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No predecessors.</p>
            )}
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Predecessor
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0">
              <Command>
                <CommandInput placeholder="Search tasks..." />
                <CommandEmpty>No tasks found.</CommandEmpty>
                <CommandGroup>
                    <ScrollArea className="h-60">
                  {availableTasks.map(availableTask => (
                    <CommandItem
                      key={availableTask.id}
                      value={availableTask.name}
                      onSelect={() => addPredecessor(availableTask)}
                    >
                      {availableTask.name}
                    </CommandItem>
                  ))}
                  </ScrollArea>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      );
    };

    export default DependencyPanel;