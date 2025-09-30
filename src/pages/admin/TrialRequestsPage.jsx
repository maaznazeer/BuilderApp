import React, { useState, useCallback } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Loader2, RefreshCw, PlusCircle } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import AdminTrialsTable from '@/components/AdminTrialsTable';
    import { motion } from 'framer-motion';
    import { useQuery } from 'react-query';
    import RequestTrialDialog from '@/components/admin/RequestTrialDialog';

    const fetchTrialRequests = async () => {
        const { data, error } = await supabase
          .from('trial_requests')
          .select(`
            *,
            target_user_email:profiles!trial_requests_target_user_fkey(email, full_name),
            requested_by_email:profiles!trial_requests_requested_by_fkey(email, full_name),
            approved_by_email:profiles!trial_requests_approved_by_fkey(email, full_name),
            activated_by_email:profiles!trial_requests_activated_by_fkey(email, full_name)
          `)
          .order('created_at', { ascending: false });
          
        if (error) {
            throw new Error(error.message);
        }

        return data.map(r => ({
            ...r,
            target_user_email: r.target_user_email?.email,
            target_user_name: r.target_user_email?.full_name,
            requested_by_email: r.requested_by_email?.email,
            requested_by_name: r.requested_by_email?.full_name,
            approved_by_email: r.approved_by_email?.email,
            approved_by_name: r.approved_by_email?.full_name,
            activated_by_email: r.activated_by_email?.email,
            activated_by_name: r.activated_by_email?.full_name,
        })) || [];
    };

    const TrialRequestsPage = () => {
      const { profile } = useAuth();
      const { toast } = useToast();
      const [isRequestTrialOpen, setIsRequestTrialOpen] = useState(false);

      const { 
        data: trials, 
        isLoading, 
        isFetching, 
        error, 
        refetch 
      } = useQuery('trialRequests', fetchTrialRequests, {
        staleTime: 5 * 60 * 1000, // 5 minutes
        onError: (err) => {
            toast({
                variant: 'destructive',
                title: 'Error loading trial requests',
                description: err.message,
            });
        }
      });

      const handleRefresh = useCallback(() => {
        refetch();
      }, [refetch]);

      return (
        <>
          <Helmet>
            <title>Trial Requests | DomusBuilder Admin</title>
            <meta name="description" content="Manage user trial requests for DomusBuilder." />
          </Helmet>
          <div className="p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Trial Requests</h1>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsRequestTrialOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Request New Trial
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching}>
                    {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="ml-2">Refresh</span>
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-10 px-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                    <p>Failed to load trial requests. Please try refreshing.</p>
                </div>
              ) : (
                <AdminTrialsTable rows={trials || []} me={profile} onActionSuccess={refetch} />
              )}
            </motion.div>
          </div>
          <RequestTrialDialog 
            isOpen={isRequestTrialOpen} 
            onOpenChange={setIsRequestTrialOpen}
            onSuccess={refetch}
          />
        </>
      );
    };

    export default TrialRequestsPage;