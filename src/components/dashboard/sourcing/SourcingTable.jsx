import React, { useState } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button, buttonVariants } from '@/components/ui/button';
    import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { useToast } from '@/components/ui/use-toast';
    import AddEditMaterialDialog from '@/components/dashboard/sourcing/AddEditMaterialDialog';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
    import { cn } from '@/lib/utils';
    import { Badge } from '@/components/ui/badge';

    const SourcingTable = ({ materials, suppliers, onUpdate }) => {
      const { toast } = useToast();
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const [selectedMaterial, setSelectedMaterial] = useState(null);

      const handleEdit = (material) => {
        setSelectedMaterial(material);
        setIsEditDialogOpen(true);
      };
      
      const handleDelete = async (materialId) => {
        try {
            const { error } = await supabase.from('materials').delete().eq('id', materialId);
            if (error) throw error;
            toast({ title: 'Success', description: 'Material deleted successfully.' });
            onUpdate();
        } catch(error) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
      };

      const getSupplierName = (supplierId) => {
        const supplier = suppliers?.find(s => s.id === supplierId);
        return supplier ? supplier.supplier_name : 'N/A';
      };

      return (
        <>
          <div className="rounded-lg border overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials && materials.length > 0 ? materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{material.quantity}</TableCell>
                    <TableCell>${material.unit_cost?.toFixed(2)}</TableCell>
                    <TableCell>${(material.quantity * material.unit_cost).toFixed(2)}</TableCell>
                    <TableCell>
                      {material.supplier_id ? <Badge variant="outline">{getSupplierName(material.supplier_id)}</Badge> : <span className="text-muted-foreground">None</span>}
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
                          <DropdownMenuItem onClick={() => handleEdit(material)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                 <Button variant="ghost" className="w-full justify-start text-sm font-normal text-destructive hover:bg-destructive/10 hover:text-destructive p-2 relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    <Trash2 className="mr-2 h-4 w-4" />Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the material. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(material.id)} className={cn(buttonVariants({ variant: 'destructive' }))}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan="6" className="h-24 text-center text-muted-foreground">
                      No materials found for this project.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <AddEditMaterialDialog 
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={onUpdate}
            material={selectedMaterial}
            suppliers={suppliers}
          />
        </>
      );
    };

    export default SourcingTable;