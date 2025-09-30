import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const BalanceDigestsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [digests, setDigests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBalanceDigests = useCallback(async () => {
    setLoading(true);
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('balance_digests')
      .select('*')
      .eq('user_id', user.id)
      .order('as_of', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Error fetching balance digests', description: error.message });
    } else {
      setDigests(data || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchBalanceDigests();
  }, [fetchBalanceDigests]);

  return (
    <>
      <Helmet>
        <title>Balance Digests - DomusBuilder Hub</title>
        <meta name="description" content="View summarized financial balances for your projects." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-6 lg:p-8 space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
              <DollarSign className="mr-3 h-8 w-8 text-green-600" />
              Balance Digests
            </h1>
            <p className="mt-2 text-lg text-gray-600">Summarized financial balances for your projects.</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group"
          >
            <button
              onClick={() => toast({ title: '🚧 This feature isn\'t implemented yet—but don\'t worry! You can request it in your next prompt! 🚀' })}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              <Calendar className="mr-2 h-4 w-4" /> Generate New Digest
            </button>
          </motion.div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>As Of</TableHead>
                <TableHead>Project Code</TableHead>
                <TableHead>Opening Balance</TableHead>
                <TableHead>Deposits (Period)</TableHead>
                <TableHead>Expenses (Period)</TableHead>
                <TableHead>Closing Balance</TableHead>
                <TableHead>Currency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="7" className="text-center h-24">
                      <div className="flex justify-center items-center">
                          <Loader2 className="animate-spin mr-2" /> Loading digests...
                      </div>
                  </TableCell>
                </TableRow>
              ) : digests.length > 0 ? (
                digests.map((digest) => (
                  <TableRow key={digest.id}>
                    <TableCell className="font-medium">{format(new Date(digest.as_of), 'PPP')}</TableCell>
                    <TableCell>{digest.project_code}</TableCell>
                    <TableCell>{digest.opening_balance?.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">{digest.deposits_period?.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">{digest.expenses_period?.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">{digest.closing_balance?.toLocaleString()}</TableCell>
                    <TableCell>{digest.currency}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="7" className="text-center h-24">No balance digests found. Generate one to see data.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </>
  );
};

export default BalanceDigestsPage;