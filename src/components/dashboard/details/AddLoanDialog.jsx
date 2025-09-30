import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const loanSchema = z.object({
  lender_name: z.string().min(2, { message: "Lender name must be at least 2 characters." }),
  amount: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: "Amount must be a positive number." })
  ),
  repayment_status: z.enum(['Open', 'Partial', 'Cleared']),
});

const AddLoanDialog = ({ isOpen, onOpenChange, onSave, loan, projectId, projectCurrency }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
    const renderCount = React.useRef(0);
    renderCount.current++;
    console.log("AddLoanDialog renders:", renderCount.current);

    console.log("edit loan:", loan, projectId, projectCurrency)

  const form = useForm({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      lender_name: '',
      amount: '',
      repayment_status: 'Open',
    },
  });

  useEffect(() => {
    if (loan) {
      form.reset({
        lender_name: loan.lender_name,
        amount: loan.amount?.toString() ?? '',
        repayment_status: loan.repayment_status,
      });
    } else {
      form.reset({
        lender_name: '',
        amount: '',
        repayment_status: 'Open',
      });
    }
  }, [loan, isOpen, form]);

  const onSubmit = async (values) => {
      console.log("submitted values:", values)
      setIsSubmitting(true);

    const dataToUpsert = {
      project_id: projectId,
      lender_name: values.lender_name,
      amount: values.amount,
      repayment_status: values.repayment_status,
    };

    let response;
    if (loan?.id) {
      response = await supabase.from('loans').update(dataToUpsert).eq('id', loan.id);
    } else {
      response = await supabase.from('loans').insert(dataToUpsert);
    }

    setIsSubmitting(false);

    if (response.error) {
      toast({
        variant: 'destructive',
        title: 'Error saving loan',
        description: response.error.message,
      });
    } else {
      toast({
        title: `Loan ${loan ? 'updated' : 'added'}!`,
        description: 'The financial record has been updated.',
      });
      onSave();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{loan ? 'Edit Loan' : 'Add New Loan'}</DialogTitle>
          <DialogDescription>
            {loan ? 'Update the details for this financial entry.' : 'Log a new loan or financial contribution for this project.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="lender_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lender/Contributor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe or Bank of America" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ({projectCurrency || 'USD'})</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="repayment_status"
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
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                        <SelectItem value="Cleared">Cleared</SelectItem>
                      </SelectContent>
                    </Select>
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
                    {loan ? 'Save Changes' : 'Add Loan'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLoanDialog;