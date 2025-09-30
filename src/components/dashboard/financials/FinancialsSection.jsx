import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { DollarSign, TrendingUp, TrendingDown, FileText, RefreshCw, Plus, BookOpen, FileCheck } from 'lucide-react';
import { useFinancialBalances, useFinancialLedger, useFinancialReconciliations } from '@/hooks/useFinancials';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

const BalanceCard = ({ title, amount, currency, icon, isLoading, color }) => {
  const Icon = icon;
  if (isLoading) {
    return (
      <Card className="border-l-4 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Skeleton className="h-6 w-6" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-3/4" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-l-4 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", color)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(amount, currency)}</div>
      </CardContent>
    </Card>
  );
};

const FinancialsSection = () => {
  const { toast } = useToast();
  const { data: balances, isLoading: balancesLoading } = useFinancialBalances();
  const { data: ledger, isLoading: ledgerLoading } = useFinancialLedger();
  const { data: reconciliations, isLoading: recsLoading } = useFinancialReconciliations();

  const handleActionClick = (feature) => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: `The "${feature}" feature is not yet available. You can request it in your next prompt! 🚀`,
    });
  };

  return (
    <Card className="w-full border-l-4 border-primary/20">
      <CardHeader>
        <CardTitle>Financials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <BalanceCard title="Cash" amount={balances?.Cash} currency={balances?.currency} icon={DollarSign} isLoading={balancesLoading} color="text-green-500" />
          <BalanceCard title="Receivables" amount={balances?.Receivables} currency={balances?.currency} icon={TrendingUp} isLoading={balancesLoading} color="text-blue-500" />
          <BalanceCard title="Payables" amount={balances?.Payables} currency={balances?.currency} icon={TrendingDown} isLoading={balancesLoading} color="text-red-500" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-l-4 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Ledger
              </CardTitle>
              <Button size="sm" onClick={() => handleActionClick('Add Ledger Entry')}>
                <Plus className="mr-2 h-4 w-4" /> Add Entry
              </Button>
            </CardHeader>
            <CardContent>
              {ledgerLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(ledger || []).slice(0, 5).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{format(new Date(entry.tx_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{entry.account}</TableCell>
                        <TableCell className={`text-right font-medium ${entry.credit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(entry.credit > 0 ? entry.credit : -entry.debit, entry.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-teal-500" />
                Reconciliations
              </CardTitle>
              <Button size="sm" onClick={() => handleActionClick('Run Reconciliation')}>
                <RefreshCw className="mr-2 h-4 w-4" /> Run
              </Button>
            </CardHeader>
            <CardContent>
              {recsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {(reconciliations || []).slice(0, 3).map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{rec.statement_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(rec.period_start), 'MMM dd')} - {format(new Date(rec.period_end), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={rec.status === 'Completed' ? 'success' : 'secondary'}>{rec.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialsSection;