import React from 'react';
import { useGrn } from '@/hooks/useSupplyChain';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const GrnTable = () => {
  const { data: grns, isLoading, error } = useGrn();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 text-destructive bg-destructive/10 rounded-lg">
        <AlertCircle className="h-5 w-5" />
        <p>Error loading Goods Received Notes: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GRN #</TableHead>
              <TableHead>PO #</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Received At</TableHead>
              <TableHead>Received By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grns?.length > 0 ? (
              grns.map((grn) => (
                <TableRow key={grn.id}>
                  <TableCell className="font-medium">{grn.grn_no}</TableCell>
                  <TableCell>
                    {grn.po_no ? (
                      <Badge variant="outline">{grn.po_no}</Badge>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>{grn.supplier || 'N/A'}</TableCell>
                  <TableCell>{grn.received_at ? format(new Date(grn.received_at), 'PPP') : 'N/A'}</TableCell>
                  <TableCell>{grn.received_by || 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No Goods Received Notes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GrnTable;