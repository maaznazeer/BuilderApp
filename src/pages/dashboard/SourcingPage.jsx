import React, { useState, useMemo, useEffect } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { useParams } from 'react-router-dom';
    import { useQueryClient, useQuery } from 'react-query';
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
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { supabase } from '@/lib/customSupabaseClient';

    const SourcingPage = ({ project: projectFromProps }) => {
      const { id: projectIdFromParams } = useParams();
      const { selectedProject: selectedProjectFromContext, loading: projectLoading } = useProject();

      const projectId = useMemo(() => {
        return projectIdFromParams || projectFromProps?.id || selectedProjectFromContext?.id;
      }, [projectIdFromParams, projectFromProps, selectedProjectFromContext]);

      const { data: projectDetails, isLoading: isLoadingProjectDetails } = useQuery(
        ['projectDetails', projectId],
        async () => {
            const { data, error } = await supabase.from('projects').select('name').eq('id', projectId).single();
            if (error) throw new Error(error.message);
            return data;
        },
        {
            enabled: !!projectId && !projectFromProps,
        }
    );

      const currentProject = useMemo(() => {
        if (projectFromProps) return projectFromProps;
        if (projectIdFromParams && projectDetails) return { id: projectIdFromParams, ...projectDetails };
        return selectedProjectFromContext;
      }, [projectFromProps, projectIdFromParams, projectDetails, selectedProjectFromContext]);

      const { data: materials, isLoading: isLoadingMaterials, refetch: refetchMaterials } = useMaterials(projectId);
      const { data: suppliers, isLoading: isLoadingSuppliers, refetch: refetchSuppliers } = useSuppliers(projectId);
      
      const [isAddMaterialDialogOpen, setAddMaterialDialogOpen] = useState(false);
      const [isAddSupplierDialogOpen, setAddSupplierDialogOpen] = useState(false);

      const handleSuccess = () => {
        if (projectId) {
          refetchMaterials();
          refetchSuppliers();
        }
      };

      const isLoading = projectLoading || isLoadingProjectDetails || isLoadingMaterials || isLoadingSuppliers;

      const pageTitle = `Sourcing${currentProject ? `: ${currentProject.name}` : ''}`;
      const pageDescription = `Manage materials and suppliers ${currentProject ? `for ${currentProject.name}` : ''}.`;
      
      if (isLoading && !materials && !suppliers) {
        return (
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <div className="space-y-8">
              <div className="space-y-6">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-48 w-full" />
              </div>
              <Separator />
              <div className="space-y-6">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        )
      }

      if (!projectId && !projectLoading) {
        return (
          <>
            <Helmet>
              <title>Sourcing | Domus</title>
              <meta name="description" content="Manage materials and suppliers." />
            </Helmet>
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Sourcing</h1>
              <Card>
                <CardHeader>
                  <CardTitle>No Project Selected</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Please select a project from the main dashboard or navigation to manage its sourcing needs.</p>
                </CardContent>
              </Card>
            </div>
          </>
        );
      }

      return (
        <>
          <Helmet>
            <title>{pageTitle} | Domus</title>
            <meta name="description" content={pageDescription} />
          </Helmet>

          <div className="space-y-6">
            {!projectFromProps && !projectIdFromParams && (
              <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
            )}

            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Materials</h2>
                  <Button onClick={() => setAddMaterialDialogOpen(true)} disabled={!projectId}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Material
                  </Button>
                </div>
                {isLoadingMaterials ? (
                  <div className="space-y-2">
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
                  <Button onClick={() => setAddSupplierDialogOpen(true)} disabled={!projectId}>
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
            </div>
          </div>
          
          {projectId && (
            <>
              <AddMaterialDialog
                isOpen={isAddMaterialDialogOpen}
                onOpenChange={setAddMaterialDialogOpen}
                projectId={projectId}
                onSuccess={handleSuccess}
                suppliers={suppliers || []}
              />
              <AddSupplierDialog
                isOpen={isAddSupplierDialogOpen}
                onOpenChange={setAddSupplierDialogOpen}
                projectId={projectId}
                onSuccess={handleSuccess}
              />
            </>
          )}
        </>
      );
    };

    export default SourcingPage;