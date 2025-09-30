import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Loader2, Search, X, Users, UserCheck, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import TrialsTable from '@/components/admin/TrialsTable';
import FullDemoFeatures from '@/components/admin/FullDemoFeatures';
import InfoBanner from '@/components/admin/InfoBanner';

const fetchTrialStatus = async () => {
  const { data, error } = await supabase.from('trial_status').select('*');
  if (error) throw error;
  return data;
};

const MetricCard = ({ title, value, Icon, isLoading }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-1/2" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
);

const TrialsDemosPage = () => {
  const { toast } = useToast();
  const [searchEmail, setSearchEmail] = useState('');
  const debouncedSearchEmail = useDebounce(searchEmail, 300);

  const { data: trials, isLoading, error } = useQuery(
    'trial_status',
    fetchTrialStatus,
    {
      onError: (err) => {
        toast({
          variant: 'destructive',
          title: 'Error fetching trial data',
          description: err.message,
        });
      },
    }
  );

  const metrics = useMemo(() => {
    if (!trials) {
      return { activeDemos: 0, expiringSoon: 0, expiredCount: 0 };
    }
    const activeDemos = trials.filter(t => t.status === 'active').length;
    const expiringSoon = trials.filter(t => t.status === 'active' && t.days_left <= 7).length;
    const expiredCount = trials.filter(t => t.status === 'expired').length;
    return { activeDemos, expiringSoon, expiredCount };
  }, [trials]);

  return (
    <>
      <Helmet>
        <title>Trials & Demos | DomusBuilder Admin</title>
        <meta name="description" content="Manage user trials and demos for DomusBuilder." />
      </Helmet>
      <motion.div
        className="p-4 sm:p-6 lg:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <InfoBanner />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Trials & Demos Management</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
            <MetricCard title="Active Demos" value={metrics.activeDemos} Icon={Users} isLoading={isLoading} />
            <MetricCard title="Expiring ≤7d" value={metrics.expiringSoon} Icon={UserCheck} isLoading={isLoading} />
            <MetricCard title="Expired" value={metrics.expiredCount} Icon={UserX} isLoading={isLoading} />
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by user email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="pl-10 w-full md:w-1/3"
          />
          {searchEmail && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7"
              onClick={() => setSearchEmail('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <div className="text-center py-10 px-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            <p>Failed to load data. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && trials && (
            <TrialsTable 
                trials={trials} 
                searchEmail={debouncedSearchEmail}
            />
        )}

        <div className="mt-8">
            <FullDemoFeatures />
        </div>

      </motion.div>
    </>
  );
};

export default TrialsDemosPage;