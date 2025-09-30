import React, { useState, useEffect, useMemo, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import {
      Alert,
      AlertDescription,
      AlertTitle,
    } from '@/components/ui/alert';
    import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
    } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Skeleton } from '@/components/ui/skeleton';
    import { Badge } from '@/components/ui/badge';
    import { format, parseISO } from 'date-fns';
    import { AlertCircle, ChevronLeft, ChevronRight, FileDown, Trash2, Zap } from 'lucide-react';
    import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
    import AddExpenseDialog from './AddExpenseDialog';
    import { TooltipProvider, Tooltip as TooltipComponent, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
    import { useDashboard } from '@/contexts/DashboardContext.jsx';
    import { useNavigate } from 'react-router-dom';

    const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--destructive))', '#8884d8', '#82ca9d'];

    const BudgetTab = ({ project }) => {
      const { toast } = useToast();
      const { plan } = useDashboard();
      const navigate = useNavigate();
      const [expenses, setExpenses] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [page, setPage] = useState(1);
      const [hasMore, setHasMore] = useState(true);
      const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

      const ITEMS_PER_PAGE = 10;
      const canExport = plan?.toLowerCase() === 'premium' || plan?.toLowerCase() === 'lifetime';

      const fetchExpenses = useCallback(async () => {
        if (!project?.id) return;
        setLoading(true);
        setError(null);

        const from = (page - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        try {
          const { data, error, count } = await supabase
            .from('v_expenses_client')
            .select('id:expense_id, project_id, amount, category, created_at', { count: 'exact' })
            .eq('project_id', project.id)
            .order(sortConfig.key, { ascending: sortConfig.direction === 'asc' })
            .range(from, to);

          if (error) throw error;

          setExpenses(data);
          setHasMore(data.length === ITEMS_PER_PAGE && (page * ITEMS_PER_PAGE) < count);
        } catch (err) {
          console.error('Error fetching expenses:', err);
          setError('Failed to load expenses. Please try again.');
          toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
          setLoading(false);
        }
      }, [project?.id, toast, page, sortConfig]);

      useEffect(() => {
        fetchExpenses();
      }, [fetchExpenses]);

      const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
        }
        setSortConfig({ key, direction });
        setPage(1);
      };

      const handleDeleteExpense = async (expenseId) => {
        try {
          const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
          if (error) throw error;
          toast({ title: 'Success', description: 'Expense deleted successfully.' });
          fetchExpenses();
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete expense.' });
        }
      };

      const categorySummary = useMemo(() => {
        const summary = expenses.reduce((acc, expense) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
          return acc;
        }, {});
        return Object.entries(summary).map(([name, value]) => ({ name, value }));
      }, [expenses]);

      const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: project?.currency || 'USD' }).format(amount);

      if (loading && page === 1) {
        return (
          <div className="space-y-6">
            <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-96 w-full" /></CardContent></Card>
          </div>
        );
      }

      if (error) {
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        );
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Budget Summary</CardTitle>
              <CardDescription>Breakdown of expenses by category.</CardDescription>
            </CardHeader>
            <CardContent>
              {expenses.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categorySummary}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categorySummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No expenses logged yet to display a chart.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>All logged expenses for this project.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                    <TooltipComponent>
                        <TooltipTrigger asChild>
                          <div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => { 
                                    if(canExport) {
                                        toast({ title: 'Coming soon!', description: 'CSV/PDF export will be available shortly.' })
                                    } else {
                                        navigate('/pricing');
                                    }
                                }}
                            >
                                {!canExport && <Zap className="mr-2 h-4 w-4 text-accent" />}
                                <FileDown className="mr-2 h-4 w-4" /> Export
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {!canExport && (
                            <TooltipContent>
                                <p>Upgrade to a Premium plan to export data.</p>
                            </TooltipContent>
                        )}
                    </TooltipComponent>
                </TooltipProvider>

                <AddExpenseDialog projectId={project.id} onExpenseAdded={fetchExpenses} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => handleSort('created_at')} className="cursor-pointer">Date</TableHead>
                      <TableHead onClick={() => handleSort('category')} className="cursor-pointer">Category</TableHead>
                      <TableHead onClick={() => handleSort('amount')} className="cursor-pointer text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && page > 1 && <TableRow><TableCell colSpan={4} className="text-center">Loading more...</TableCell></TableRow>}
                    {!loading && expenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                          No expenses have been logged for this project yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenses.map((expense) => (
                        <TableRow key={expense.expense_id}>
                          <TableCell>{format(parseISO(expense.created_at), 'MMM d, yyyy')}</TableCell>
                          <TableCell><Badge variant="secondary">{expense.category}</Badge></TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.expense_id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm">Page {page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasMore || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default BudgetTab;