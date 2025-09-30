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
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Loader2 } from 'lucide-react';
    import { Combobox } from '@/components/ui/combobox';
    import { MATERIALS_LIST } from '@/lib/constants';

    const materialSchema = z.object({
        name: z.string().min(3, { message: 'Material name must be at least 3 characters.' }),
        quantity: z.coerce.number().min(0.1, { message: 'Quantity must be greater than 0.' }),
        unit_cost: z.coerce.number().min(0, { message: 'Unit cost cannot be negative.' }),
        supplier_id: z.string().uuid({ message: "Please select a valid supplier." }).optional().nullable(),
    });

    const materialOptions = MATERIALS_LIST.map(m => ({ value: m.name, label: m.name }));

    const AddEditMaterialDialog = ({ isOpen, onOpenChange, onSuccess, material, suppliers }) => {
        const { toast } = useToast();
        const [isSubmitting, setIsSubmitting] = useState(false);

        const form = useForm({
            resolver: zodResolver(materialSchema),
        });

        useEffect(() => {
            if (material && isOpen) {
                form.reset({
                    name: material.name,
                    quantity: material.quantity,
                    unit_cost: material.unit_cost,
                    supplier_id: material.supplier_id,
                });
            } else {
                form.reset({ name: '', quantity: 1, unit_cost: 0, supplier_id: null });
            }
        }, [material, isOpen, form]);

        const onSubmit = async (values) => {
            setIsSubmitting(true);
            try {
                const { error } = await supabase
                    .from('materials')
                    .update(values)
                    .eq('id', material.id);

                if (error) throw error;

                toast({
                    title: 'Material Updated!',
                    description: `"${values.name}" has been successfully updated.`,
                });

                onSuccess();
                onOpenChange(false);

            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error updating material',
                    description: error.message,
                });
            } finally {
                setIsSubmitting(false);
            }
        };

        if (!material) return null;

        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Material</DialogTitle>
                        <DialogDescription>
                            Update the details for this material.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Material Name</FormLabel>
                                  <FormControl>
                                    <Combobox
                                      options={materialOptions}
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="Select or type a material..."
                                      searchPlaceholder="Search materials..."
                                      notFoundText="No material found."
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="quantity" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl><Input type="number" placeholder="100" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="unit_cost" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit Cost</FormLabel>
                                        <FormControl><Input type="number" placeholder="8.50" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="supplier_id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Supplier</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={"Select a supplier (optional)"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="">No Supplier</SelectItem>
                                            {suppliers?.map((supplier) => (
                                                <SelectItem key={supplier.id} value={supplier.id}>
                                                    {supplier.supplier_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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

    export default AddEditMaterialDialog;