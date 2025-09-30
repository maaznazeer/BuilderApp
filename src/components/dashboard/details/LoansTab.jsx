import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, Loader2, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AddLoanDialog from '@/components/dashboard/details/AddLoanDialog.jsx';
import { cn } from '@/lib/utils.js';

const LoansTab = ({ project }) => {
  const { toast } = useToast();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  const [loanToEdit, setLoanToEdit] = useState(null);

  const fetchLoans = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Error fetching loans', description: error.message });
    } else {
      setLoans(data || []);
    }
    setLoading(false);
  }, [project?.id, toast]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleAddLoan = () => {
    setLoanToEdit(null);
    setIsLoanDialogOpen(true);
  };

  const handleEditLoan = (loan) => {
    setLoanToEdit(loan);
    setIsLoanDialogOpen(true);
  };

  const handleDeleteLoan = async (loanId) => {
    const { error } = await supabase.from('loans').delete().eq('id', loanId);

    if (error) {
      toast({ variant: 'destructive', title: 'Error deleting loan', description: error.message });
    } else {
      toast({ title: 'Success', description: 'Loan entry deleted.' });
      fetchLoans();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Cleared': return <Badge variant="success">Cleared</Badge>;
      case 'Partial': return <Badge variant="warning">Partial</Badge>;
      case 'Open': return <Badge variant="destructive">Open</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: project?.currency || 'USD' }).format(amount || 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Loans & Contributions</CardTitle>
            <CardDescription>Track all microloans and financial contributions for this project.</CardDescription>
          </div>
          <Button onClick={handleAddLoan}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Loan
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Lender Name</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loans.length > 0 ? (
                    loans.map((loan) => (
                        <TableRow key={loan.id}>
                        <TableCell className="font-medium">{loan.lender_name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(loan.amount)}</TableCell>
                        <TableCell>{getStatusBadge(loan.repayment_status)}</TableCell>
                        <TableCell>{format(new Date(loan.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditLoan(loan)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span>Delete</span>
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>This action cannot be undone. This will permanently delete the loan record.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteLoan(loan.id)} className={cn(buttonVariants({ variant: 'destructive' }))}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                        No loans or contributions have been added yet.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <AddLoanDialog
        isOpen={isLoanDialogOpen}
        onOpenChange={setIsLoanDialogOpen}
        onSave={fetchLoans}
        loan={loanToEdit}
        projectId={project?.id}
        projectCurrency={project?.currency}
      />
    </motion.div>
  );
};

export default LoansTab;