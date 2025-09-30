import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useQuery } from 'react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarPlus as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const taskSchema = z.object({
  project_id: z.string().uuid({ message: 'Please select a project.' }),
  milestone_id: z.string().uuid({ message: 'Please select a milestone.' }),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  due_date: z.date().optional(),
});

const fetchMilestones = async (projectId) => {
  if (!projectId) return [];
  const { data, error } = await supabase.from('milestones').select('id, title').eq('project_id', projectId);
  if (error) throw new Error(error.message);
  return data;
};

const QuickAddTaskDialog = ({ isOpen, onOpenChange, onSuccess }) => {
  const { projects } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({ resolver: zodResolver(taskSchema) });
  const selectedProjectId = form.watch('project_id');

  const { data: milestones, isLoading: milestonesLoading } = useQuery(
    ['milestones', selectedProjectId],
    () => fetchMilestones(selectedProjectId),
    { enabled: !!selectedProjectId }
  );

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('tasks').insert({ ...values, completed: false, project_id: values.project_id });
      if (error) throw error;
      form.reset();
      onSuccess('Task added successfully.');
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Add Task</DialogTitle>
          <DialogDescription>Add a new task to any project.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="project_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger></FormControl>
                  <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="milestone_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Milestone</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedProjectId || milestonesLoading}>
                  <FormControl><SelectTrigger><SelectValue placeholder={milestonesLoading ? "Loading..." : "Select a milestone"} /></SelectTrigger></FormControl>
                  <SelectContent>{milestones?.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Task Title</FormLabel>
                <FormControl><Input placeholder="e.g., Order foundation materials" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="due_date" render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddTaskDialog;