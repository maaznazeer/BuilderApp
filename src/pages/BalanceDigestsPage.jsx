import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useBalanceDigests, useGenerateBalanceDigest, useClearBalanceDigests } from '@/hooks/useBalanceDigests';
import { useQueryClient } from 'react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import { format } from 'date-fns';

const BalanceDigestsPage = () => {
  const { data: digests, isLoading: loading, refetch } = useBalanceDigests();
  const generateDigestMutation = useGenerateBalanceDigest();
  const clearDigestsMutation = useClearBalanceDigests();
  const queryClient = useQueryClient();
  const [showClearDialog, setShowClearDialog] = useState(false);


  return (
    <>
      <Helmet>
        <title>Balance Digests - DomusBuilder Hub</title>
        <meta name="description" content="View summarized financial balances for your projects." />
      </Helmet>
      
      {/* Loading overlay to prevent navigation during clear operation */}
      {clearDigestsMutation.isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">Clearing Balance Digests</h3>
                <p className="text-sm text-gray-600">Please stay on this page until the operation completes...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
            <div className="flex gap-2">
              <button
                onClick={() => generateDigestMutation.mutate()}
                disabled={generateDigestMutation.isLoading}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {generateDigestMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Generate New Digest
                  </>
                )}
              </button>
              <button
                onClick={() => setShowClearDialog(true)}
                disabled={clearDigestsMutation.isLoading || digests?.length === 0}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
              >
                {clearDigestsMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Data
                  </>
                )}
              </button>
            </div>
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

        {/* Clear Data Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={showClearDialog}
          onOpenChange={setShowClearDialog}
          onConfirm={() => {
            clearDigestsMutation.mutate();
            setShowClearDialog(false);
          }}
          title="Clear All Balance Digests"
          description="Are you sure you want to clear all balance digest data? This action cannot be undone and will remove all generated balance summaries."
          itemName={`${digests?.length || 0} balance digest(s)`}
          itemType="balance digests"
          isLoading={clearDigestsMutation.isLoading}
          loadingText="Clearing data..."
          confirmText="Clear All Data"
          cancelText="Cancel"
        />
      </motion.div>
    </>
  );
};

export default BalanceDigestsPage;