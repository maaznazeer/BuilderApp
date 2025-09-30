import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const GrantTrialDialog = ({ isOpen, setIsOpen, user }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState('30');
  const [reason, setReason] = useState('');

  const startTrialMutation = useMutation(
    (vars) => supabase.rpc('start_full_trial', vars),
    {
      onSuccess: () => {
        toast({
          title: 'Success!',
          description: `Full demo active for ${user.email}.`,
        });
        queryClient.invalidateQueries('trial_status');
        setIsOpen(false);
      },
      onError: (err) => {
        toast({
          variant: 'destructive',
          title: 'Error starting trial',
          description: err.message,
        });
      },
    }
  );

  const handleConfirm = () => {
    startTrialMutation.mutate({
      p_user_id: user.user_id,
      p_days: parseInt(duration),
      p_reason: reason.trim() || 'admin_grant',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Grant Full Demo</DialogTitle>
          <DialogDescription>
            Grant a full-featured demo trial for {user?.email}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              Duration
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="col-span-3"
              placeholder="Optional: Reason for granting trial"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={startTrialMutation.isLoading}>
            {startTrialMutation.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Grant Demo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GrantTrialDialog;