import React from 'react';
    import { Helmet } from 'react-helmet-async';
    import { useProject } from '@/contexts/ProjectContext';
    import BudgetTab from '@/components/dashboard/details/BudgetTab';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Skeleton } from '@/components/ui/skeleton';

    const BudgetPage = () => {
      const { selectedProject, loading } = useProject();

      return (
        <>
          <Helmet>
            <title>Budget - {selectedProject?.name || 'Project'} | Domus</title>
            <meta name="description" content={`Manage the budget and expenses for ${selectedProject?.name}.`} />
          </Helmet>
          <div className="space-y-6">
            {loading ? (
              <Skeleton className="h-12 w-1/3" />
            ) : (
              <h1 className="text-3xl font-bold tracking-tight">Budget: {selectedProject?.name}</h1>
            )}
            
            {loading ? (
              <Card>
                <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                <CardContent><Skeleton className="h-96 w-full" /></CardContent>
              </Card>
            ) : selectedProject ? (
              <BudgetTab project={selectedProject} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Project Selected</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Please select a project from the dropdown to view its budget details.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      );
    };

    export default BudgetPage;