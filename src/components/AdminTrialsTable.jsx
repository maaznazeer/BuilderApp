import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function AdminTrialsTable({ rows, me, onActionSuccess }) {
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState(null);
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
  const [selectedTrialId, setSelectedTrialId] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');

  const canApprove = me?.role === 'super_owner';
  const canActivate = me?.role === 'system_admin';
  const canReject = me?.role === 'super_owner';

  const showConfirmDialog = (action, trialId, title, description) => {
    setSelectedTrialId(trialId);
    setConfirmAction(() => action);
    setConfirmTitle(title);
    setConfirmDescription(description);
    setIsConfirmDialogOpen(true);
  };

  const executeConfirmedAction = async () => {
    setIsConfirmDialogOpen(false);
    if (confirmAction) {
      await confirmAction(selectedTrialId);
    }
  };

  const handleApiCall = async (endpoint, body, successMessage, trialId, actionName) => {
    setActionLoading(`${actionName}-${trialId}`);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }
      toast({ title: 'Success!', description: successMessage });
      onActionSuccess();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (trialId) => {
    await handleApiCall('trial-approve', { trial_id: trialId }, 'Trial request approved.', trialId, 'approve');
  };

  const handleReject = async (trialId) => {
    await handleApiCall('trial-reject', { trial_id: trialId }, 'Trial request rejected.', trialId, 'reject');
  };

  const handleActivateClick = (trialId) => {
    setSelectedTrialId(trialId);
    setSelectedStartDate(new Date());
    setIsActivateDialogOpen(true);
  };

  const handleActivate = async (trialId) => {
    await handleApiCall(
      'trial-activate',
      { trial_id: trialId, start_date: selectedStartDate.toISOString() },
      'Trial activated.',
      trialId,
      'activate'
    );
    setIsActivateDialogOpen(false);
    setSelectedTrialId(null);
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Trial Requests</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr>
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">Months</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Start → End</th>
              <th className="py-2 pr-4">Requested / Approved / Activated</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="py-2 pr-4">
                  <div className="font-medium">{r.target_user_email || r.target_user_name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{r.id.slice(0, 8)}</div>
                </td>
                <td className="py-2 pr-4">{r.months}</td>
                <td className="py-2 pr-4">
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full border text-xs',
                      r.status === 'pending' && 'bg-yellow-100 text-yellow-800 border-yellow-300',
                      r.status === 'requested' && 'bg-yellow-100 text-yellow-800 border-yellow-300',
                      r.status === 'approved' && 'bg-blue-100 text-blue-800 border-blue-300',
                      r.status === 'active' && 'bg-green-100 text-green-800 border-green-300',
                      r.status === 'rejected' && 'bg-red-100 text-red-800 border-red-300',
                      r.status === 'expired' && 'bg-gray-100 text-gray-800 border-gray-300'
                    )}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  {r.start_date ? new Date(r.start_date).toLocaleDateString() : '—'} →{' '}
                  {r.end_date ? new Date(r.end_date).toLocaleDateString() : '—'}
                </td>
                <td className="py-2 pr-4 text-xs text-gray-600">
                  Req: {r.requested_by_email || r.requested_by_name || '—'}
                  <br />
                  Appr: {r.approved_by_email || r.approved_by_name || '—'}
                  <br />
                  Act: {r.activated_by_email || r.activated_by_name || '—'}
                </td>
                <td className="py-2 pr-4 space-x-2">
                  {canApprove && r.status === 'requested' && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() =>
                        showConfirmDialog(
                          handleApprove,
                          r.id,
                          'Confirm Approval',
                          'Are you sure you want to approve this trial request?'
                        )
                      }
                      disabled={actionLoading === `approve-${r.id}`}
                    >
                      {actionLoading === `approve-${r.id}` && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Approve
                    </Button>
                  )}
                  {canReject && (r.status === 'requested' || r.status === 'approved') && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        showConfirmDialog(
                          handleReject,
                          r.id,
                          'Confirm Rejection',
                          'Are you sure you want to reject this trial request?'
                        )
                      }
                      disabled={actionLoading === `reject-${r.id}`}
                    >
                      {actionLoading === `reject-${r.id}` && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Reject
                    </Button>
                  )}
                  {canActivate && r.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleActivateClick(r.id)}
                      disabled={actionLoading === `activate-${r.id}`}
                    >
                      {actionLoading === `activate-${r.id}` && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Activate
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeConfirmedAction}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isActivateDialogOpen} onOpenChange={setIsActivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate Trial</DialogTitle>
            <DialogDescription>
              Select the start date for the trial. The trial duration will be based on the months requested.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid items-center gap-4">
              <label htmlFor="startDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[240px] justify-start text-left font-normal',
                      !selectedStartDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedStartDate ? format(selectedStartDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedStartDate}
                    onSelect={setSelectedStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActivateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => showConfirmDialog(
                handleActivate,
                selectedTrialId,
                'Confirm Activation',
                'Are you sure you want to activate this trial? This action cannot be undone.'
            )}>
              {actionLoading === `activate-${selectedTrialId}` && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}