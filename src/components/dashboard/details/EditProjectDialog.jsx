import React, { useState, useEffect } from 'react';
    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import * as z from 'zod';
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
    import {
      Form,
      FormControl,
      FormField,
      FormItem,
      FormLabel,
      FormMessage,
    } from '@/components/ui/form';
    import { Input } from '@/components/ui/input';
    import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
    } from '@/components/ui/select';
    import { Loader2 } from 'lucide-react';

    const projectSchema = z.object({
      name: z.string().min(3, 'Project name must be at least 3 characters.'),
      status: z.string().min(1, 'Status is required.'),
      budget_total: z.coerce.number().positive('Budget must be a positive number.'),
      city: z.string().optional(),
      country: z.string().optional(),
    });

    const PROJECT_STATUSES = ['Planned', 'Active', 'On Hold', 'Completed', 'Cancelled'];

    const EditProjectDialog = ({ project, isOpen, onOpenChange, onProjectUpdated }) => {
      const { toast } = useToast();
      const [isSubmitting, setIsSubmitting] = useState(false);

      const form = useForm({
        resolver: zodResolver(projectSchema),
        defaultValues: {
          name: '',
          status: 'Planned',
          budget_total: 0,
          city: '',
          country: '',
        },
      });

      useEffect(() => {
        if (project && isOpen) {
          form.reset({
            name: project.name || '',
            status: project.status || 'Planned',
            budget_total: project.budget_total || 0,
            city: project.city || '',
            country: project.country || '',
          });
        }
      }, [project, isOpen, form]);

      const onSubmit = async (values) => {
        if (!project) return;
        setIsSubmitting(true);

        try {
          const { error } = await supabase
            .from('projects')
            .update(values)
            .eq('id', project.id);

          if (error) {
            throw error;
          }

          toast({
            title: 'Success!',
            description: 'Project details have been updated.',
          });
          if (onProjectUpdated) {
            onProjectUpdated();
          }
          onOpenChange(false);
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Error updating project',
            description: error.message,
          });
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update the details for "{project?.name}". Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Downtown Office Build" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budget_total"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Budget ({project?.budget_currency})</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 50000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROJECT_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Douala" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Cameroon" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      );
    };

    export default EditProjectDialog;