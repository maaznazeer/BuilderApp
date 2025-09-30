import React, { useState, useMemo } from 'react';
    import { useQueryClient } from 'react-query';
    import { useProject } from '@/contexts/ProjectContext';
    import { useMaterials } from '@/hooks/useMaterials';
    import { useSuppliers } from '@/hooks/useSuppliers';
    import { Button } from '@/components/ui/button';
    import { PlusCircle } from 'lucide-react';
    import { Skeleton } from '@/components/ui/skeleton';
    import AddMaterialDialog from '@/components/dashboard/sourcing/AddMaterialDialog';
    import SourcingTable from '@/components/dashboard/sourcing/SourcingTable';
    import AddSupplierDialog from '@/components/dashboard/sourcing/AddSupplierDialog';
    import SuppliersTable from '@/components/dashboard/sourcing/SuppliersTable';
    import { Separator } from '@/components/ui/separator';

    const SourcingTab = ({ projectId: projectIdFromProps }) => {
      const { selectedProject } = useProject();
      const queryClient = useQueryClient();
      
      const projectId = useMemo(() => projectIdFromProps || selectedProject?.id, [projectIdFromProps, selectedProject]);

      const { data: materials, isLoading: isLoadingMaterials } = useMaterials(projectId);
      const { data: suppliers, isLoading: isLoadingSuppliers } = useSuppliers(projectId);
      
      const [isAddMaterialDialogOpen, setAddMaterialDialogOpen] = useState(false);
      const [isAddSupplierDialogOpen, setAddSupplierDialogOpen] = useState(false);

      const handleSuccess = () => {
        if (projectId) {
          queryClient.invalidateQueries(['materials', projectId]);
          queryClient.invalidateQueries(['suppliers', projectId]);
        }
      };

      if (!projectId) {
          return (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                  <p>Please select a project to view its sourcing information.</p>
              </div>
          );
      }

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
            projectId={projectId}
            onSuccess={handleSuccess}
            suppliers={suppliers}
          />
          <AddSupplierDialog
            isOpen={isAddSupplierDialogOpen}
            onOpenChange={setAddSupplierDialogOpen}
            projectId={projectId}
            onSuccess={handleSuccess}
          />
        </div>
      );
    };

    export default SourcingTab;