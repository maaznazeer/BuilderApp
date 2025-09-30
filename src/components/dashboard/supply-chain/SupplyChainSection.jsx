import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Warehouse, ShoppingCart, ArchiveRestore, PackageCheck, Package, Building2 } from 'lucide-react';
import SuppliersTable from '@/components/dashboard/supply-chain/SuppliersTable';
import InventoryTable from '@/components/dashboard/supply-chain/InventoryTable';
import PurchasesTable from '@/components/dashboard/supply-chain/PurchasesTable';
import GrnTable from '@/components/dashboard/supply-chain/GrnTable';
import GinTable from '@/components/dashboard/supply-chain/GinTable';
import MovementsTable from '@/components/dashboard/supply-chain/MovementsTable';
import ProjectMaterialsTable from '@/components/dashboard/supply-chain/ProjectMaterialsTable';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast.js';

const PlaceholderContent = ({ title }) => {
  const { toast } = useToast();
  const handleRequest = () => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: `The ${title} module is not yet available. You can request it in your next prompt! 🚀`,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
      <h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2">This module is under construction.</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={handleRequest}>
        Request This Feature
      </Button>
    </div>
  );
};


const SupplyChainSection = () => {
  const tabs = [
    { value: 'suppliers', label: 'Suppliers', icon: Truck },
    { value: 'inventory', label: 'Inventory', icon: Warehouse },
    { value: 'purchases', label: 'Purchases', icon: ShoppingCart },
    { value: 'grn', label: 'GRN', icon: PackageCheck },
    { value: 'gin', label: 'GIN', icon: ArchiveRestore },
    { value: 'movements', label: 'Movements', icon: Package },
    { value: 'project_materials', label: 'Project Materials', icon: Building2 },
  ];

  return (
    <Card className="w-full border-l-4 border-primary/20">
      <CardHeader>
        <CardTitle>Supply Chain Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                <tab.icon className="w-4 h-4 mr-1.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="suppliers" className="mt-4">
            <SuppliersTable />
          </TabsContent>
          <TabsContent value="inventory" className="mt-4">
            <InventoryTable />
          </TabsContent>
          <TabsContent value="purchases" className="mt-4">
            <PurchasesTable />
          </TabsContent>
          <TabsContent value="grn" className="mt-4">
            <GrnTable />
          </TabsContent>
          <TabsContent value="gin" className="mt-4">
            <GinTable />
          </TabsContent>
          <TabsContent value="movements" className="mt-4">
            <MovementsTable />
          </TabsContent>
          <TabsContent value="project_materials" className="mt-4">
            <ProjectMaterialsTable />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SupplyChainSection;