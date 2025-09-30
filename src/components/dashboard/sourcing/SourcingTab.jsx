import React, { useState } from 'react';
    import { useQuery, useQueryClient } from 'react-query';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useProject } from '@/contexts/ProjectContext';
    import { Button } from '@/components/ui/button';
    import { PlusCircle } from 'lucide-react';
    import { Skeleton } from '@/components/ui/skeleton';
    import AddMaterialDialog from '@/components/dashboard/sourcing/AddMaterialDialog';
    import SourcingTable from '@/components/dashboard/sourcing/SourcingTable';
    import AddSupplierDialog from '@/components/dashboard/sourcing/AddSupplierDialog';
    import SuppliersTable from '@/components/dashboard/sourcing/SuppliersTable';
    import { Separator } from '@/components/ui/separator';
    import { useMaterials } from '@/hooks/useMaterials';
    import { useSuppliers } from '@/hooks/useSuppliers';

    const SourcingTab = () => {
      const { selectedProject } = useProject();
      const queryClient = useQueryClient();

      const { data: materials, isLoading: isLoadingMaterials, refetch: refetchMaterials } = useMaterials(selectedProject?.id);
      const { data: suppliers, isLoading: isLoadingSuppliers, refetch: refetchSuppliers } = useSuppliers(selectedProject?.id);

      const [isAddMaterialDialogOpen, setAddMaterialDialogOpen] = useState(false);
      const [isAddSupplierDialogOpen, setAddSupplierDialogOpen] = useState(false);

      const handleSuccess = () => {
        refetchMaterials();
        refetchSuppliers();
      };

      return (
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Materials</h2>
              <Button onClick={() => setAddMaterialDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Material
              </Button>
            </div>
            {isLoadingMaterials ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : (
              <SourcingTable materials={materials} suppliers={suppliers} onUpdate={handleSuccess} />
            )}
          </div>

          <Separator />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Suppliers</h2>
              <Button onClick={() => setAddSupplierDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </div>
            {isLoadingSuppliers ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : (
              <SuppliersTable suppliers={suppliers} onUpdate={handleSuccess} />
            )}
          </div>

          <AddMaterialDialog
            isOpen={isAddMaterialDialogOpen}
            onOpenChange={setAddMaterialDialogOpen}
            projectId={selectedProject?.id}
            onSuccess={handleSuccess}
            suppliers={suppliers}
          />
          <AddSupplierDialog
            isOpen={isAddSupplierDialogOpen}
            onOpenChange={setAddSupplierDialogOpen}
            projectId={selectedProject?.id}
            onSuccess={handleSuccess}
          />
        </div>
      );
    };

    export default SourcingTab;