import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, ArrowUpDown, PlusCircle, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export const FinancialLedgerTable = ({ entries, onAddEntry }) => {
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

  const formatCurrency = (amount, currency) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', minimumFractionDigits: 2 }).format(amount);
  };

  const filteredEntries = useMemo(() => {
    let sortableEntries = [...entries];
    if (sortConfig.key) {
      sortableEntries.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    if (!filter) {
      return sortableEntries;
    }

    return sortableEntries.filter((entry) =>
      Object.values(entry).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [entries, filter, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  return (
    <div>
        <div className="flex items-center justify-between py-4">
            <Input
            placeholder="Filter entries..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
            />
            <div className="space-x-2">
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
                <Button onClick={onAddEntry}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Entry
                </Button>
            </div>
        </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('date')}>
                  Date{getSortIndicator('date')}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('project_code')}>
                  Project{getSortIndicator('project_code')}
                </Button>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => requestSort('amount_after_fees')}>
                  Deposit{getSortIndicator('amount_after_fees')}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => requestSort('expense_amount')}>
                  Expense{getSortIndicator('expense_amount')}
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{format(new Date(entry.date), 'dd MMM yyyy')}</TableCell>
                <TableCell className="font-medium">{entry.project_code}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {entry.expense_amount > 0 ? entry.reason_for_expense || entry.expense_category : 'Funds Deposit'}
                    </span>
                    <span className="text-sm text-muted-foreground">{entry.comment}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {entry.amount_after_fees > 0 ? formatCurrency(entry.amount_after_fees, entry.currency) : '-'}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {entry.expense_amount > 0 ? formatCurrency(entry.expense_amount, entry.currency) : '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Entry</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};