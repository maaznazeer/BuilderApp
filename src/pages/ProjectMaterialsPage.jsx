import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ProjectMaterialsTable from '@/components/dashboard/supply-chain/ProjectMaterialsTable';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import AddMaterialDialog from '@/components/materials/dialogs/AddMaterialDialog';

const ProjectMaterialsPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Project Materials | DomusBuilder</title>
        <meta name="description" content="Manage and view all materials for your project." />
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Project Materials</h1>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Material
            </Button>
          </div>
          <ProjectMaterialsTable />
        </div>
      </div>
      <AddMaterialDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />
    </>
  );
};

export default ProjectMaterialsPage;