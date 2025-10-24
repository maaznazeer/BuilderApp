import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarPlus as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProject } from '@/contexts/ProjectContext';
import BudgetControl from '@/components/ui/BudgetControl';

const ledgerSchema = z.object({
  date: z.date({ required_error: 'A date is required.' }),
  project_code: z.string().min(1, 'Project is required.'),
  entry_type: z.enum(['deposit', 'expense']),
  deposit_method: z.string().optional(),
  amount_to_be_received: z.preprocess(
    (a) => (a === '' || a == null ? undefined : Number(a)),
    z.number().nonnegative().optional()
  ),
  fee_percent: z.preprocess(
    (a) => (a === '' || a == null ? undefined : Number(a)),
    z.number().min(0).max(100).optional()
  ),
  fee_fixed: z.preprocess(
    (a) => (a === '' || a == null ? undefined : Number(a)),
    z.number().nonnegative().optional()
  ),
  expense_category: z.string().optional(),
  reason_for_expense: z.string().optional(),
  expense_amount: z.preprocess(
    (a) => (a === '' || a == null ? undefined : Number(a)),
    z.number().nonnegative().optional()
  ),
  different_transfers: z.string().optional(),
  comment: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.entry_type === 'deposit') {
        if (!data.amount_to_be_received || data.amount_to_be_received <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Deposit amount must be greater than 0.",
                path: ['amount_to_be_received'],
            });
        }
        if (!data.deposit_method) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Deposit method is required.",
                path: ['deposit_method'],
            });
        }
    }
    if (data.entry_type === 'expense') {
        if (!data.expense_amount || data.expense_amount <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Expense amount must be greater than 0.",
                path: ['expense_amount'],
            });
        }
        if (!data.expense_category) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Expense category is required.",
                path: ['expense_category'],
            });
        }
    }
});

const depositMethods = ["Bank", "Mobile Money", "Cash", "Card"];
const expenseCategories = ["Materials", "Labor", "Equipment", "Transport", "Permits/Fees", "Utilities", "Security", "Professional Services", "Contingency", "Other"];

export const AddLedgerEntryDialog = ({ open, onOpenChange, onEntryAdded }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { projects } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(ledgerSchema),
    defaultValues: {
      date: new Date(),
      project_code: '',
      entry_type: 'deposit',
      amount_to_be_received: '',
      fee_percent: '',
      fee_fixed: '',
      expense_amount: '',
    },
  });

  const entryType = form.watch('entry_type');
  const projectCode = form.watch('project_code');
  const expenseAmount = form.watch('expense_amount');
  const selectedProject = projects.find(p => p.project_code === projectCode);
  const [budgetStatus, setBudgetStatus] = useState(null);

  async function onSubmit(values) {
    // Check budget before submitting if it's an expense
    if (values.entry_type === 'expense' && budgetStatus?.overBudget) {
      toast({
        variant: 'destructive',
        title: 'Budget Exceeded',
        description: 'This expense would exceed the project budget. Please reduce the amount or add more funds to the project.',
      });
      return;
    }

    setIsSubmitting(true);
    
    const dataToInsert = {
        user_id: user.id,
        date: format(values.date, 'yyyy-MM-dd'),
        project_code: values.project_code,
        comment: values.comment,
        different_transfers: values.different_transfers,
        currency: selectedProject?.currency || null,

        deposit_method: values.entry_type === 'deposit' ? values.deposit_method : null,
        amount_to_be_received: values.entry_type === 'deposit' ? values.amount_to_be_received : null,
        fee_percent: values.entry_type === 'deposit' ? values.fee_percent : null,
        fee_fixed: values.entry_type === 'deposit' ? values.fee_fixed : null,
        
        expense_category: values.entry_type === 'expense' ? values.expense_category : null,
        reason_for_expense: values.entry_type === 'expense' ? values.reason_for_expense : null,
        expense_amount: values.entry_type === 'expense' ? values.expense_amount : null,
    };
    
    const { error } = await supabase.from('financial_ledger').insert(dataToInsert);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error creating entry',
        description: error.message,
      });
    } else {
      toast({
        title: 'Ledger entry added!',
        description: 'The financial ledger has been updated.',
      });
      onEntryAdded();
      form.reset();
      onOpenChange(false);
    }
    setIsSubmitting(false);
  }
  
  function onInvalid(errors) {
    const firstKey = Object.keys(errors)[0];
    const firstError = firstKey ? errors[firstKey]?.message : 'Please fix the highlighted errors.';
    toast({ variant: 'destructive', title: 'Validation error', description: firstError || 'Please review the form.' });
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Ledger Entry</DialogTitle>
          <DialogDescription>
            Record a new deposit or expense for one of your projects.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="project_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map(p => (
                          <SelectItem key={p.project_code} value={p.project_code}>
                            {p.name} ({p.project_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="entry_type"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Entry Type</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value || undefined}>
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Select entry type" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         <SelectItem value="deposit">Deposit / Fund In</SelectItem>
                         <SelectItem value="expense">Expense / Fund Out</SelectItem>
                       </SelectContent>
                     </Select>
                    <FormMessage />
                </FormItem>
              )}
            />

            {entryType === 'deposit' && (
              <div className="p-4 border rounded-md space-y-4 bg-green-50/50">
                <FormField
                  control={form.control}
                  name="amount_to_be_received"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Amount ({selectedProject?.currency || '...'})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          placeholder="e.g., 10000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fee_percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fee (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            placeholder="e.g., 2.5"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fee_fixed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fixed Fee ({selectedProject?.currency || '...'})</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            placeholder="e.g., 50"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="deposit_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a method" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {depositMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {entryType === 'expense' && (
               <div className="p-4 border rounded-md space-y-4 bg-red-50/50">
                <FormField
                  control={form.control}
                  name="expense_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Amount ({selectedProject?.currency || '...'})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          placeholder="e.g., 1500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Budget Control for Expenses */}
                {selectedProject && expenseAmount && (
                  <BudgetControl
                    projectId={selectedProject.id}
                    amount={parseFloat(expenseAmount) || 0}
                    category="expense"
                    onBudgetCheck={setBudgetStatus}
                    compact={false}
                  />
                )}
                <FormField
                  control={form.control}
                  name="expense_category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {expenseCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason_for_expense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Expense</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          placeholder="e.g., Purchase of cement bags"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="different_transfers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference / Transfer Details</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      placeholder="e.g., Bank transfer ID, Mobile Money receipt"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      placeholder="Add any relevant notes here..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Entry
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};