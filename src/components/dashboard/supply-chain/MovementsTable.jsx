import React from 'react';
import { useMovements } from '@/hooks/useSupplyChain';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const MovementsTable = () => {
  const { data: movements, isLoading, error } = useMovements();

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
        <p>Error loading stock movements: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Ref #</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>From → To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements?.length > 0 ? (
              movements.map((move) => (
                <TableRow key={move.id}>
                  <TableCell>{move.date ? format(new Date(move.date), 'PPp') : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{move.ref}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{move.sku}</TableCell>
                  <TableCell className={`text-right font-semibold ${move.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {move.quantity > 0 ? `+${move.quantity}` : move.quantity} {move.unit}
                  </TableCell>
                  <TableCell className="flex items-center space-x-2">
                    <span>{move.from || 'Source'}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span>{move.to || 'Destination'}</span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No stock movements found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MovementsTable;