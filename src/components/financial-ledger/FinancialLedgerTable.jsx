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
import { MoreHorizontal, ArrowUpDown, PlusCircle, Download, AlertTriangle, CheckCircle, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useBudgetTracking } from '@/hooks/useBudgetTracking';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

// Component to show budget status for a single entry
const BudgetStatusCell = ({ entry }) => {
  const { budgetData } = useBudgetTracking(entry.project_id);
  
  if (!budgetData || !entry.expense_amount) {
    return <span className="text-muted-foreground">-</span>;
  }

  const { budgetTotal, totalSpent, remainingBudget } = budgetData;
  const newTotalSpent = totalSpent + entry.expense_amount;
  const newRemainingBudget = budgetTotal - newTotalSpent;
  const percentage = budgetTotal > 0 ? (newTotalSpent / budgetTotal) * 100 : 0;

  const isOverBudget = newRemainingBudget < 0;
  const isNearLimit = percentage >= 90;

  if (isOverBudget) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Over Budget
      </Badge>
    );
  }

  if (isNearLimit) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800">
        <AlertTriangle className="h-3 w-3" />
        Near Limit
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      Within Budget
    </Badge>
  );
};

export const FinancialLedgerTable = ({ entries, onAddEntry, onEntryUpdated }) => {
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (entry) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (entry) => {
    setSelectedEntry(entry);
    setIsViewDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEntry) return;
    
    try {
      const { error } = await supabase
        .from('financial_ledger')
        .delete()
        .eq('id', selectedEntry.id);

      if (error) throw error;

      toast({
        title: 'Entry Deleted',
        description: 'Financial ledger entry has been deleted successfully.',
      });

      if (onEntryUpdated) onEntryUpdated();
      setIsDeleteDialogOpen(false);
      setSelectedEntry(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error deleting entry',
        description: error.message,
      });
    }
  };

  const handleEditSuccess = () => {
    if (onEntryUpdated) onEntryUpdated();
    setIsEditDialogOpen(false);
    setSelectedEntry(null);
  };

  const handleEditSubmit = async (formData) => {
    if (!selectedEntry) return;
    
    try {
      const { error } = await supabase
        .from('financial_ledger')
        .update(formData)
        .eq('id', selectedEntry.id);

      if (error) throw error;

      toast({
        title: 'Entry Updated',
        description: 'Financial ledger entry has been updated successfully.',
      });

      handleEditSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error updating entry',
        description: error.message,
      });
    }
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
              <TableHead>Budget Status</TableHead>
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
                  <BudgetStatusCell entry={entry} />
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
                      <DropdownMenuItem onClick={() => handleView(entry)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(entry)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Entry
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(entry)} className="text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this financial ledger entry? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedEntry(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Dialog */}
      {isViewDialogOpen && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Entry Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-sm">{format(new Date(selectedEntry.date), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Project Code</label>
                  <p className="text-sm">{selectedEntry.project_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Currency</label>
                  <p className="text-sm">{selectedEntry.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Entry Type</label>
                  <p className="text-sm">{selectedEntry.expense_amount > 0 ? 'Expense' : 'Deposit'}</p>
                </div>
              </div>
              
              {selectedEntry.amount_after_fees > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Deposit Amount</label>
                  <p className="text-sm text-green-600">{formatCurrency(selectedEntry.amount_after_fees, selectedEntry.currency)}</p>
                </div>
              )}
              
              {selectedEntry.expense_amount > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Expense Amount</label>
                  <p className="text-sm text-red-600">{formatCurrency(selectedEntry.expense_amount, selectedEntry.currency)}</p>
                </div>
              )}
              
              {selectedEntry.reason_for_expense && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Reason for Expense</label>
                  <p className="text-sm">{selectedEntry.reason_for_expense}</p>
                </div>
              )}
              
              {selectedEntry.expense_category && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Expense Category</label>
                  <p className="text-sm">{selectedEntry.expense_category}</p>
                </div>
              )}
              
              {selectedEntry.comment && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Comment</label>
                  <p className="text-sm">{selectedEntry.comment}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setSelectedEntry(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {isEditDialogOpen && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Entry</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                date: formData.get('date'),
                project_code: formData.get('project_code'),
                comment: formData.get('comment'),
                amount_after_fees: formData.get('amount_after_fees') ? parseFloat(formData.get('amount_after_fees')) : null,
                expense_amount: formData.get('expense_amount') ? parseFloat(formData.get('expense_amount')) : null,
                reason_for_expense: formData.get('reason_for_expense'),
                expense_category: formData.get('expense_category'),
                currency: formData.get('currency')
              };
              handleEditSubmit(data);
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={selectedEntry.date}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Project Code</label>
                    <input
                      type="text"
                      name="project_code"
                      defaultValue={selectedEntry.project_code}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Currency</label>
                    <select
                      name="currency"
                      defaultValue={selectedEntry.currency}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Entry Type</label>
                    <p className="text-sm text-gray-600">
                      {selectedEntry.expense_amount > 0 ? 'Expense' : 'Deposit'}
                    </p>
                  </div>
                </div>
                
                {selectedEntry.amount_after_fees > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Deposit Amount</label>
                    <input
                      type="number"
                      name="amount_after_fees"
                      defaultValue={selectedEntry.amount_after_fees}
                      step="0.01"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                )}
                
                {selectedEntry.expense_amount > 0 && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Expense Amount</label>
                      <input
                        type="number"
                        name="expense_amount"
                        defaultValue={selectedEntry.expense_amount}
                        step="0.01"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reason for Expense</label>
                      <input
                        type="text"
                        name="reason_for_expense"
                        defaultValue={selectedEntry.reason_for_expense}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Expense Category</label>
                      <input
                        type="text"
                        name="expense_category"
                        defaultValue={selectedEntry.expense_category}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Comment</label>
                  <textarea
                    name="comment"
                    defaultValue={selectedEntry.comment}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedEntry(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Update Entry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};