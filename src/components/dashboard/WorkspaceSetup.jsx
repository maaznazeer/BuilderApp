import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { useToast } from '@/components/ui/use-toast';

const WorkspaceSetup = () => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProject();
  const { toast } = useToast();
  const [counts, setCounts] = useState({
    projects_count: 0,
    workers_count: 0,
    suppliers_count: 0,
    fin_ledgers: 0,
    settings_count: 0,
  });
  const [loadingCounts, setLoadingCounts] = useState(true);

  const fetchCounts = useCallback(async () => {
    if (!user) {
      setLoadingCounts(false);
      return;
    }

    setLoadingCounts(true);
    try {
      // Projects count (user's own projects)
      const { count: projectsCount, error: projectsError } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      if (projectsError) throw projectsError;

      // Workers count (any worker in the system)
      const { count: workersCount, error: workersError } = await supabase
        .from('workers')
        .select('id', { count: 'exact', head: true });

      if (workersError) throw workersError;

      // Suppliers count (any supplier in the system)
      const { count: suppliersCount, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id', { count: 'exact', head: true });

      if (suppliersError) throw suppliersError;

      // Financial Ledger count (user's own entries)
      const { count: finLedgersCount, error: finLedgersError } = await supabase
        .from('financial_ledger')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (finLedgersError) throw finLedgersError;

      // Project Alert Settings count (user's own settings)
      const { count: settingsCount, error: settingsError } = await supabase
        .from('project_alert_settings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (settingsError) throw settingsError;

      setCounts({
        projects_count: projectsCount || 0,
        workers_count: workersCount || 0,
        suppliers_count: suppliersCount || 0,
        fin_ledgers: finLedgersCount || 0,
        settings_count: settingsCount || 0,
      });

    } catch (error) {
      console.error('Error fetching setup counts:', error);
      toast({
        title: 'Error loading setup progress',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingCounts(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchCounts();

    const projectChannel = supabase.channel('public:projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchCounts())
      .subscribe();
    const workersChannel = supabase.channel('public:workers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => fetchCounts())
      .subscribe();
    const suppliersChannel = supabase.channel('public:suppliers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, () => fetchCounts())
      .subscribe();
    const financialLedgerChannel = supabase.channel('public:financial_ledger')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_ledger' }, () => fetchCounts())
      .subscribe();
    const projectAlertSettingsChannel = supabase.channel('public:project_alert_settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_alert_settings' }, () => fetchCounts())
      .subscribe();

    return () => {
      supabase.removeChannel(projectChannel);
      supabase.removeChannel(workersChannel);
      supabase.removeChannel(suppliersChannel);
      supabase.removeChannel(financialLedgerChannel);
      supabase.removeChannel(projectAlertSettingsChannel);
    };
  }, [fetchCounts]);

  const setupItems = [
    {
      id: 'projects',
      label: 'Create your first Project',
      route: '/dashboard/projects',
      isComplete: counts.projects_count > 0,
    },
    {
      id: 'construction',
      label: 'Define Construction Workflow',
      route: '/dashboard/construction-process',
      isComplete: false, // This requires more complex logic, placeholder for now
    },
    {
      id: 'workforce',
      label: 'Add your Workforce',
      route: '/dashboard/workers',
      isComplete: counts.workers_count > 0,
    },
    {
      id: 'supplyChain',
      label: 'Setup Supply Chain',
      route: '/dashboard/suppliers',
      isComplete: counts.suppliers_count > 0,
    },
    {
      id: 'financials',
      label: 'Record Financial Entries',
      route: '/dashboard/financial-ledger',
      isComplete: counts.fin_ledgers > 0,
    },
    {
      id: 'settings',
      label: 'Configure Project Settings',
      route: '/dashboard/project-settings',
      isComplete: counts.settings_count > 0,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (loadingCounts || projectsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  const allComplete = setupItems.every(item => item.isComplete);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-2">Set up your Workspace</h2>
      <p className="text-gray-500 mb-6">Start with what you need, customize as you go.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {setupItems.map((item) => (
          <motion.div key={item.id} variants={itemVariants}>
            <Link to={item.route} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              {item.isComplete ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300 mr-3" />
              )}
              <span className={`font-medium ${item.isComplete ? 'text-gray-600 line-through' : 'text-gray-800'}`}>
                {item.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
      {allComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center text-green-600 font-semibold text-lg"
        >
          🎉 Your workspace is fully set up! Time to build!
        </motion.div>
      )}
    </motion.div>
  );
};

export default WorkspaceSetup;