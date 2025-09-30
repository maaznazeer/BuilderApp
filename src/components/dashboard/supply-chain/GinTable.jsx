import React from 'react';
import { useGin } from '@/hooks/useSupplyChain';
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

const GinTable = () => {
  const { data: gins, isLoading, error } = useGin();

  if (isLoading) {
    return (
      <div className="space-y-4">
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
        <p>Error loading Goods Issue Notes: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GIN #</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Issued At</TableHead>
              <TableHead>Issued By</TableHead>
              <TableHead className="text-right">Total Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gins?.length > 0 ? (
              gins.map((gin) => (
                <TableRow key={gin.id}>
                  <TableCell className="font-medium">{gin.gin_no}</TableCell>
                  <TableCell>{gin.project || 'N/A'}</TableCell>
                  <TableCell>{gin.issued_at ? format(new Date(gin.issued_at), 'PPP') : 'N/A'}</TableCell>
                  <TableCell>{gin.issued_by || 'N/A'}</TableCell>
                  <TableCell className="text-right">{gin.total_items}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No Goods Issue Notes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GinTable;