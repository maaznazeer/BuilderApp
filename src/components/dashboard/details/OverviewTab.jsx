import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Skeleton } from '@/components/ui/skeleton';
    import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
    import { Progress } from '@/components/ui/progress';
    import { Button } from '@/components/ui/button';
    import { format, formatDistanceToNow, parseISO } from 'date-fns';
    import {
      AlertCircle,
      Banknote,
      CalendarClock,
      Truck,
      ListChecks,
      PlusCircle,
      FilePlus,
      UserPlus,
      Loader2,
      DatabaseZap
    } from 'lucide-react';

    const StatCard = ({ icon: Icon, title, value, footer, color, children }) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-semibold text-gray-600">{title}</h3>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {children ? (
          <div className="flex-grow">{children}</div>
        ) : (
          <div className="flex-grow">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{footer}</p>
          </div>
        )}
      </motion.div>
    );

    const ActivityItem = ({ icon, text, time }) => (
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <div className="w-5 h-5 text-gray-500">{icon}</div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-900">{text}</p>
          <p className="text-xs text-gray-500">{time}</p>
        </div>
      </div>
    );

    const OverviewTab = ({ project, onRefresh }) => {
      const { toast } = useToast();
      const [overviewData, setOverviewData] = useState(null);
      const [loading, setLoading] = useState(true);
      const [isImporting, setIsImporting] = useState(false);
      const [error, setError] = useState(null);

      const fetchOverviewData = useCallback(async () => {
        if (!project?.id) return;
        setLoading(true);
        setError(null);
        try {
          const [
            { data: expensesData, error: expensesError },
            { data: milestoneData, error: milestoneError },
            { data: activityData, error: activityError }
          ] = await Promise.all([
            supabase.from('expenses').select('amount').eq('project_id', project.id),
            supabase.from('milestones').select('title, due_date').eq('project_id', project.id).order('due_date', { ascending: true }).limit(1),
            supabase.rpc('get_project_activity', { p_project_id: project.id, p_limit: 5 })
          ]);

          if (expensesError) throw expensesError;
          if (milestoneError) throw milestoneError;
          if (activityError) throw activityError;

          const spent = expensesData.reduce((sum, e) => sum + e.amount, 0);

          setOverviewData({
            spent,
            upcomingMilestone: milestoneData[0],
            activityFeed: activityData
          });
        } catch (err) {
          console.error("Error fetching overview data:", err);
          setError("Failed to load project overview data. Please try again.");
          toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
          setLoading(false);
        }
      }, [project?.id, toast]);

      useEffect(() => {
        fetchOverviewData();
      }, [fetchOverviewData]);
      
      const handleImplementFeature = (featureName) => {
        toast({
          title: '🚀 Feature Request Noted!',
          description: `You can request the implementation of the "${featureName}" module in your next prompt.`,
        });
      };

      const handleImportSampleData = async () => {
        if (!project?.id) return;
        setIsImporting(true);
        try {
          const { data, error } = await supabase.functions.invoke('import-sample-data', {
            body: { projectId: project.id },
          });

          if (error) throw error;
          
          toast({
            title: 'Success!',
            description: 'Sample data has been imported. Refreshing project...',
          });
          
          if (onRefresh) {
              onRefresh();
          }

        } catch (err) {
          toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: err.message,
          });
        } finally {
          setIsImporting(false);
        }
      };

      if (loading) {
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
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

      const { spent, upcomingMilestone, activityFeed } = overviewData || {};
      const budget = project?.budget_total || 0;
      const spentPercentage = budget > 0 ? (spent / budget) * 100 : 0;

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatCard title="Budget vs. Spent" icon={Banknote} color="text-green-600">
              <div className="flex justify-between items-baseline">
                <p className="text-3xl font-bold text-gray-900">${(spent || 0).toLocaleString()}</p>
                <p className="text-md text-gray-500">/ ${(budget).toLocaleString()}</p>
              </div>
              <Progress value={spentPercentage} className="mt-3 h-3" />
              <p className="text-sm text-gray-500 mt-2">{Math.round(spentPercentage)}% of budget used</p>
            </StatCard>

            <StatCard title="Upcoming Milestone" icon={CalendarClock} color="text-blue-600">
              {upcomingMilestone ? (
                <>
                  <p className="text-2xl font-bold text-gray-900">{upcomingMilestone.title}</p>
                  <p className="text-md text-gray-500 mt-1">Due: {format(parseISO(upcomingMilestone.due_date), 'MMMM d, yyyy')}</p>
                </>
              ) : (
                <p className="text-xl text-gray-500 mt-4">No upcoming milestones.</p>
              )}
            </StatCard>
            
            <StatCard title="Activity Feed" icon={ListChecks} color="text-orange-600">
                <div className="space-y-3">
                    {(activityFeed || []).length > 0 ? activityFeed.map(act => (
                        <ActivityItem 
                            key={act.id} 
                            icon={<Banknote className="h-4 w-4"/>} 
                            text={`${act.activity_type}: ${act.details}`}
                            time={formatDistanceToNow(parseISO(act.created_at), { addSuffix: true })}
                        />
                    )) : (
                        <p className="text-sm text-gray-500">No recent activity.</p>
                    )}
                </div>
            </StatCard>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
                <Button variant="outline" onClick={() => handleImplementFeature("Add Expense")}><PlusCircle className="mr-2 h-4 w-4"/> Add Expense</Button>
                <Button variant="outline" onClick={() => handleImplementFeature("Add Material")}><PlusCircle className="mr-2 h-4 w-4"/> Add Material</Button>
                <Button variant="outline" onClick={() => handleImplementFeature("New Milestone")}><FilePlus className="mr-2 h-4 w-4"/> New Milestone</Button>
                <Button variant="outline" onClick={() => handleImplementFeature("Invite Collaborator")}><UserPlus className="mr-2 h-4 w-4"/> Invite Collaborator</Button>
                <Button variant="secondary" onClick={handleImportSampleData} disabled={isImporting}>
                    {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <DatabaseZap className="mr-2 h-4 w-4"/>}
                    Import Sample Data
                </Button>
            </div>
          </div>
        </div>
      );
    };

    export default OverviewTab;