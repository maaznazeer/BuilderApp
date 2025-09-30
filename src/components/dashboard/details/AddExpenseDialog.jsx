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
  DialogTrigger,
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
import { PlusCircle, Loader2, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const expenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be a positive number'),
  proof_file: z.any().optional(),
});

const EXPENSE_CATEGORIES = ['Materials', 'Labor', 'Transport', 'Permits', 'Equipment Rental', 'Other'];

const AddExpenseDialog = ({ projectId, onExpenseAdded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);

  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: '',
      amount: '',
    },
  });

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const onSubmit = async (values) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    setIsSubmitting(true);

    try {
      let proofFileUrl = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user.id}/${projectId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('expense-proofs')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('expense-proofs')
          .getPublicUrl(filePath);
        
        proofFileUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('expenses').insert({
        project_id: projectId,
        category: values.category,
        amount: values.amount,
        payer_id: user.id,
        proof_file: proofFileUrl,
      });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: 'Success!',
        description: 'Expense has been added successfully.',
      });
      onExpenseAdded();
      setIsOpen(false);
      form.reset();
      setFile(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error adding expense',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Log a new expense for this project. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an expense category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 150.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Proof of Expense (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input id="proof_file" type="file" className="pl-12" onChange={handleFileChange} />
                  <label htmlFor="proof_file" className="absolute left-0 top-0 h-full px-3 flex items-center bg-gray-100 border-r rounded-l-md">
                    <Upload className="h-4 w-4 text-gray-600" />
                  </label>
                </div>
              </FormControl>
              {file && <p className="text-sm text-muted-foreground mt-2">Selected: {file.name}</p>}
              <FormMessage />
            </FormItem>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Expense
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;