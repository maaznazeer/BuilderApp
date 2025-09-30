import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import GrantTrialDialog from '@/components/admin/GrantTrialDialog';

const TrialsTable = ({ trials, searchEmail }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'gray';
      default:
        return 'slate';
    }
  };

  const endTrialMutation = useMutation(
    (userId) => supabase.rpc('end_trial', { p_user_id: userId }),
    {
      onSuccess: () => {
        toast({ title: 'Success!', description: 'Demo ended.' });
        queryClient.invalidateQueries('trial_status');
      },
      onError: (err) => {
        toast({ variant: 'destructive', title: 'Error ending trial', description: err.message });
      },
    }
  );

  const handleGrantClick = (trial) => {
    setSelectedUser(trial);
    setIsGrantDialogOpen(true);
  };

  const filteredAndSortedTrials = useMemo(() => {
    if (!trials) return [];

    const statusOrder = { 'active': 1, 'expired': 2, 'inactive': 3, 'none': 4 };

    return trials
      .filter(trial => trial.email?.toLowerCase().includes(searchEmail.toLowerCase()))
      .sort((a, b) => {
        const statusA = statusOrder[a.status] || 99;
        const statusB = statusOrder[b.status] || 99;
        if (statusA !== statusB) {
          return statusA - statusB;
        }
        return (a.days_left ?? 9999) - (b.days_left ?? 9999);
      });
  }, [trials, searchEmail]);

  return (
    <>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTrials.map((trial) => (
                <TableRow key={trial.user_id}>
                  <TableCell className="font-medium">{trial.email}</TableCell>
                  <TableCell className="font-mono text-xs">{trial.role_id}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(trial.status)}>
                      {trial.status || 'none'}
                    </Badge>
                  </TableCell>
                  <TableCell>{trial.days_left ?? 'N/A'}</TableCell>
                  <TableCell>{trial.expires_at ? new Date(trial.expires_at).toLocaleString() : 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {trial.status !== 'active' && (
                      <Button size="sm" variant="outline" onClick={() => handleGrantClick(trial)}>Grant Full Demo</Button>
                    )}
                    {trial.status === 'active' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">End Demo Now</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will immediately end the trial for {trial.email}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => endTrialMutation.mutate(trial.user_id)} disabled={endTrialMutation.isLoading}>
                              {endTrialMutation.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              End Demo
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {selectedUser && (
        <GrantTrialDialog
          isOpen={isGrantDialogOpen}
          setIsOpen={setIsGrantDialogOpen}
          user={selectedUser}
        />
      )}
    </>
  );
};

export default TrialsTable;