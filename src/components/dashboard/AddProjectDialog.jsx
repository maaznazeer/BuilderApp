import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
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
import { Loader2 } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { currencies } from '@/lib/currencies';

const projectSchema = z.object({
  name: z.string().min(3, { message: 'Project name must be at least 3 characters.' }),
  budget_currency: z.string().length(3, { message: 'Currency must be a 3-letter code (e.g., USD).' }).toUpperCase(),
  budget_total: z.coerce.number().min(0, { message: 'Opening balance cannot be negative.' }),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format." }),
  city: z.string().min(1, { message: 'City is required.' }),
  country: z.string().min(1, { message: 'Country is required.' }),
});

const AddProjectDialog = ({ isOpen, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refreshProjects } = useProject();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      budget_currency: 'USD',
      budget_total: 0,
      start_date: new Date().toISOString().split('T')[0],
      city: '',
      country: '',
    },
  });

  const onSubmit = async (values) => {
    if (!user) {
       toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a project." });
       return;
    }
    setIsSubmitting(true);
    
    try {
      const projectCode = `PRJ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({
          name: values.name,
          budget_currency: values.budget_currency,
          currency: values.budget_currency,
          budget_total: values.budget_total,
          start_date: values.start_date,
          city: values.city,
          country: values.country,
          owner_uuid: user.id,
          code: projectCode,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Project Created!',
        description: `"${newProject.name}" has been successfully created.`,
      });
      
      form.reset();
      await refreshProjects();
      onOpenChange(false);
      navigate(`/dashboard/projects/${newProject.id}`);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error creating project',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Project</DialogTitle>
          <DialogDescription>
            Start a new project by providing some basic details.
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
                    <Input placeholder="e.g., My Dream Home" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget_currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget_total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Balance</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New York" {...field} />
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
                      <Input placeholder="e.g., United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectDialog;