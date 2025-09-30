import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const statusConfig = {
  pending: {
    color: 'bg-yellow-500',
    icon: <AlertCircle className="h-4 w-4 mr-2" />,
  },
  approved: {
    color: 'bg-green-500',
    icon: <CheckCircle className="h-4 w-4 mr-2" />,
  },
  rejected: {
    color: 'bg-red-500',
    icon: <XCircle className="h-4 w-4 mr-2" />,
  },
};

const fetchTimesheets = async () => {
  const { data, error } = await supabase
    .from('v_timesheets_with_status')
    .select('id:timesheet_row_id, timesheet_id, worker_code, work_date, days_worked, status, remarks, worker_data')
    .order('work_date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const updateTimesheetStatus = async ({ timesheetId, status, remarks }) => {
  const { error } = await supabase.rpc('rpc_mark_timesheet_status', {
    p_timesheet_id: timesheetId,
    p_status: status,
    p_remarks: remarks,
  });

  if (error) {
    throw new Error(error.message);
  }
};

const ApprovalsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: timesheets, isLoading, error, refetch } = useQuery('timesheets', fetchTimesheets);

  const mutation = useMutation(updateTimesheetStatus, {
    onSuccess: (data, variables) => {
      toast({
        title: 'Success!',
        description: `Timesheet has been ${variables.status}.`,
      });
      queryClient.invalidateQueries('timesheets');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating status',
        description: error.message,
      });
    },
  });

  const handleApprove = (timesheetId) => {
    mutation.mutate({
      timesheetId,
      status: 'approved',
      remarks: 'Approved via Horizons',
    });
  };

  const handleReject = (timesheetId) => {
    mutation.mutate({
      timesheetId,
      status: 'rejected',
      remarks: 'Rejected via Horizons',
    });
  };

  const renderStatusBadge = (status) => {
    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    return (
      <Badge variant="outline" className="capitalize flex items-center w-32">
        <span className={`h-2 w-2 rounded-full mr-2 ${config.color}`} />
        {status}
      </Badge>
    );
  };
  
  return (
    <>
      <Helmet>
        <title>Timesheet Approvals - DomusBuilder Hub</title>
        <meta name="description" content="Approve or reject employee timesheets." />
      </Helmet>
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Timesheet Approvals</h1>
          <p className="text-muted-foreground">Review and manage pending timesheet submissions.</p>
        </div>
        
        {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        )}

        {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Fetching Timesheets</AlertTitle>
              <AlertDescription>
                {error.message}
                <Button onClick={() => refetch()} variant="link" className="pl-1">Retry</Button>
              </AlertDescription>
            </Alert>
        )}

        {!isLoading && !error && (
            <div className="rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Work Date</TableHead>
                    <TableHead>Timesheet ID</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>Days Worked</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {timesheets?.filter(ts => ts.status === 'pending').length > 0 ? (
                        timesheets.filter(ts => ts.status === 'pending').map((ts) => (
                            <TableRow key={ts.id}>
                                <TableCell>{new Date(ts.work_date).toLocaleDateString()}</TableCell>
                                <TableCell className="font-mono">{ts.timesheet_id}</TableCell>
                                <TableCell>{ts.worker_data?.first_name || 'N/A'} {ts.worker_data?.surname || ''} ({ts.worker_code})</TableCell>
                                <TableCell>{ts.days_worked}</TableCell>
                                <TableCell>{renderStatusBadge(ts.status)}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleApprove(ts.timesheet_id)}
                                        disabled={mutation.isLoading || ts.status === 'approved'}
                                        className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleReject(ts.timesheet_id)}
                                        disabled={mutation.isLoading || ts.status === 'rejected'}
                                        className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        Reject
                                    </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                            No pending timesheets found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        )}
      </div>
    </>
  );
};

export default ApprovalsPage;