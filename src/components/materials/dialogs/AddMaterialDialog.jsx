import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient, useMutation, useQuery } from 'react-query';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';

const materialSchema = z.object({
  project_code: z.string().min(1, 'Project is required.'),
  material: z.string().min(1, 'Material name is required.'),
  category: z.string().optional(),
  supplier_code: z.string().optional(),
  qty: z.preprocess((val) => Number(val), z.number().positive('Quantity must be positive.')),
  unit: z.string().optional(),
  unit_price: z.preprocess((val) => Number(val), z.number().nonnegative('Unit price cannot be negative.')),
  notes: z.string().optional(),
});

const fetchProjects = async (userId) => {
  const { data, error } = await supabase.from('projects').select('project_code, name').eq('owner_id', userId);
  if (error) throw new Error(error.message);
  return data;
};

const fetchSuppliers = async () => {
  const { data, error } = await supabase.from('suppliers').select('supplier_code, supplier_name');
  if (error) throw new Error(error.message);
  return data;
};

const AddMaterialDialog = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: projects, isLoading: isLoadingProjects } = useQuery(
    ['projects', user?.id],
    () => fetchProjects(user.id),
    { enabled: !!user }
  );
  
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery('suppliers', fetchSuppliers);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    resolver: zodResolver(materialSchema),
  });

  const addMaterialMutation = useMutation(
    async (newMaterial) => {
      const { data, error } = await supabase.from('materials_inventory').insert({
        ...newMaterial,
        remaining_stock: newMaterial.qty,
      }).select();

      if (error) throw new Error(error.message);
      return data;
    },
    {
      onSuccess: () => {
        toast({
          title: 'Success!',
          description: 'Material has been added successfully.',
        });
        queryClient.invalidateQueries('projectMaterialsList');
        onClose();
        reset();
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  const onSubmit = (data) => {
    addMaterialMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
          <DialogDescription>
            Enter the details for the new material. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project_code" className="text-right">Project</Label>
            <Controller
              name="project_code"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingProjects ? (
                      <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                    ) : (
                      projects?.map((project) => (
                        <SelectItem key={project.project_code} value={project.project_code}>
                          {project.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
             {errors.project_code && <p className="col-span-4 text-red-500 text-xs text-right">{errors.project_code.message}</p>}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="material" className="text-right">Material</Label>
            <Input id="material" {...register('material')} className="col-span-3" />
            {errors.material && <p className="col-span-4 text-red-500 text-xs text-right">{errors.material.message}</p>}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Input id="category" {...register('category')} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="supplier_code" className="text-right">Supplier</Label>
            <Controller
              name="supplier_code"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSuppliers ? (
                      <SelectItem value="loading" disabled>Loading suppliers...</SelectItem>
                    ) : (
                      suppliers?.map((supplier) => (
                        <SelectItem key={supplier.supplier_code} value={supplier.supplier_code}>
                          {supplier.supplier_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="qty">Quantity</Label>
                <Input id="qty" type="number" {...register('qty')} />
                {errors.qty && <p className="text-red-500 text-xs">{errors.qty.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" {...register('unit')} placeholder="e.g., kg, pcs, m"/>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit_price">Unit Price</Label>
            <Input id="unit_price" type="number" step="0.01" {...register('unit_price')} />
            {errors.unit_price && <p className="text-red-500 text-xs">{errors.unit_price.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register('notes')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={addMaterialMutation.isLoading}>
              {addMaterialMutation.isLoading ? 'Saving...' : 'Save Material'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaterialDialog;