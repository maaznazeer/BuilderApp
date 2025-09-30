import React, { useState } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const ColumnManagerModal = () => {
  const { isColumnModalOpen, setIsColumnModalOpen, addColumnToTasksDue, taskTableColumns, availableColumns } = useDashboard();
  const [selectedColumn, setSelectedColumn] = useState('');
  const { toast } = useToast();

  const handleAddColumn = () => {
    if (!selectedColumn) {
      toast({
        title: 'No column selected',
        description: 'Please choose a column to add.',
        variant: 'destructive',
      });
      return;
    }

    const columnToAdd = availableColumns.find(c => c.value === selectedColumn);
    if (columnToAdd) {
        if (taskTableColumns.some(c => c.accessor === columnToAdd.value)) {
            toast({
                title: 'Column already exists',
                description: `The "${columnToAdd.label}" column is already visible.`,
                variant: 'warning',
            });
        } else {
            addColumnToTasksDue(selectedColumn);
            toast({
                title: 'Column added!',
                description: `The "${columnToAdd.label}" column has been added to the table.`,
            });
            setIsColumnModalOpen(false);
            setSelectedColumn('');
        }
    }
  };

  const handleOpenChange = (isOpen) => {
    setIsColumnModalOpen(isOpen);
    if (!isOpen) {
      setSelectedColumn('');
    }
  };

  return (
    <Dialog open={isColumnModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a column</DialogTitle>
          <DialogDescription>
            Choose a field to show as a new column in the tasks table.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new_col_select" className="text-right">
              Field
            </Label>
            <div className="col-span-3">
              <Select onValueChange={setSelectedColumn} value={selectedColumn}>
                <SelectTrigger id="new_col_select">
                  <SelectValue placeholder="Choose field to show" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map(col => (
                    <SelectItem key={col.value} value={col.value}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddColumn}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnManagerModal;