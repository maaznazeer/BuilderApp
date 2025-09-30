import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const supplierSchema = z.object({
  supplier_name: z.string().min(2, { message: 'Supplier name must be at least 2 characters.' }),
  supplier_code: z.string().min(2, { message: 'Supplier code must be at least 2 characters.' }).toUpperCase(),
  country: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

const AddEditSupplierDialog = ({ isOpen, onOpenChange, onSuccess, supplier }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(supplierSchema),
  });
  
  useEffect(() => {
    if (supplier && isOpen) {
      form.reset({
        supplier_name: supplier.supplier_name,
        supplier_code: supplier.supplier_code,
        country: supplier.country || '',
        phone: supplier.phone || '',
        website: supplier.website || '',
      });
    } else {
        form.reset({ supplier_name: '', supplier_code: '', country: '', phone: '', website: '' });
    }
  }, [supplier, isOpen, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('suppliers')
        .update(values)
        .eq('id', supplier.id);

      if (error) throw error;

      toast({
        title: 'Supplier Updated!',
        description: `"${values.supplier_name}" has been successfully updated.`,
      });
      
      onSuccess();
      onOpenChange(false);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error updating supplier',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!supplier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Supplier</DialogTitle>
          <DialogDescription>
            Update the details for this supplier.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="supplier_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Name</FormLabel>
                <FormControl><Input placeholder="e.g., City Hardware" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="supplier_code" render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Code</FormLabel>
                <FormControl><Input placeholder="e.g., CH001" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="country" render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl><Input placeholder="e.g., Cameroon" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input placeholder="e.g., +237 600 000 000" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl><Input placeholder="e.g., https://city-hardware.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
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

export default AddEditSupplierDialog;