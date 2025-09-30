import React, { useState } from 'react';
import { usePurchases } from '@/hooks/useSupplyChain';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const PurchasesTable = () => {
  const { data: purchases, isLoading, error } = usePurchases();
  const { toast } = useToast();
  const navigate = useNavigate();

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'received':
        return 'success';
      case 'pending':
        return 'warning';
      case 'approved':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const handleCreatePO = () => {
    navigate('/dashboard/purchases/new');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span>Error loading purchases: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreatePO}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create PO
        </Button>
      </div>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO #</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ETA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases?.length > 0 ? (
              purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.po_no}</TableCell>
                  <TableCell>{purchase.supplier || 'N/A'}</TableCell>
                  <TableCell>{purchase.project || 'General'}</TableCell>
                  <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(purchase.total || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(purchase.status)}>
                      {purchase.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{purchase.eta ? format(new Date(purchase.eta), 'PPP') : 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No purchase orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PurchasesTable;