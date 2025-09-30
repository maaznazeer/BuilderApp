import React, { useState } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button, buttonVariants } from '@/components/ui/button';
    import { MoreHorizontal, Globe, Phone, Edit, Trash2 } from 'lucide-react';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { useToast } from '@/components/ui/use-toast';
    import AddEditSupplierDialog from '@/components/dashboard/sourcing/AddEditSupplierDialog';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
    import { cn } from '@/lib/utils';

    const SuppliersTable = ({ suppliers, onUpdate }) => {
      const { toast } = useToast();
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const [selectedSupplier, setSelectedSupplier] = useState(null);

      const handleEdit = (supplier) => {
        setSelectedSupplier(supplier);
        setIsEditDialogOpen(true);
      };
      
      const handleDelete = async (supplierId) => {
        try {
            const { error } = await supabase.from('suppliers').delete().eq('id', supplierId);
            if (error) throw error;
            toast({ title: 'Success', description: 'Supplier deleted successfully.' });
            onUpdate();
        } catch(error) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
      };


      return (
        <>
          <div className="rounded-lg border overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers && suppliers.length > 0 ? suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.supplier_name}</TableCell>
                    <TableCell>{supplier.supplier_code}</TableCell>
                    <TableCell>{supplier.country || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {supplier.phone && <span className="flex items-center gap-2 text-sm"><Phone className="h-3 w-3 text-muted-foreground" /> {supplier.phone}</span>}
                        {supplier.website && <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><Globe className="h-3 w-3" /> Website</a>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(supplier)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                 <Button variant="ghost" className="w-full justify-start text-sm font-normal text-destructive hover:bg-destructive/10 hover:text-destructive p-2 relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    <Trash2 className="mr-2 h-4 w-4" />Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the supplier. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(supplier.id)} className={cn(buttonVariants({ variant: 'destructive' }))}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan="5" className="h-24 text-center text-muted-foreground">
                      No suppliers found for this project.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <AddEditSupplierDialog 
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={onUpdate}
            supplier={selectedSupplier}
          />
        </>
      );
    };

    export default SuppliersTable;