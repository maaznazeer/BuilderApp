import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useDashboard } from '@/contexts/DashboardContext';

const fetchDashboardMetrics = async (projectIds) => {
  if (!projectIds || projectIds.length === 0) {
    return {
      active_projects_count: 0,
      total_budget: 0,
      total_spent: 0,
      budget_remaining: 0,
      spent_30d: 0,
      spent_30d_delta: 0,
      upcoming_milestones_7d: 0,
      overdue_tasks: 0,
      tasks_completed: 0,
      deliveries_due_7d: 0,
      projects_at_risk: 0
    };
  }

  try {
    const { data, error } = await supabase.rpc('get_dashboard_kpis_optimized', { p_project_ids: projectIds });
    if (error) {
      if (error.message.toLowerCase().includes('jwt')) {
        throw new Error('Your session may have expired. Please try re-authenticating.');
      }
      throw error;
    }
    return data || {};
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error);
    throw new Error(`Failed to fetch dashboard metrics. ${error.message}`);
  }
};

export const useDashboardMetrics = () => {
  const { projectIds } = useDashboard();
  return useQuery(
    ['dashboardMetrics', projectIds],
    () => fetchDashboardMetrics(projectIds),
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 1,
      enabled: !!projectIds,
    }
  );
};