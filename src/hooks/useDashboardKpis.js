import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';

const fetchDashboardKpis = async (projectIds) => {
  if (!projectIds || projectIds.length === 0) {
    return {
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

  const { data, error } = await supabase.rpc('get_dashboard_kpis_optimized', { p_project_ids: projectIds });

  if (error) {
    console.error('Error fetching dashboard KPIs:', error);
    throw new Error('Failed to fetch dashboard KPIs. ' + error.message);
  }
  
  return data;
};

export const useDashboardKpis = (projectIds) => {
  return useQuery(
    ['dashboardKpis', projectIds],
    () => fetchDashboardKpis(projectIds),
    {
      enabled: !!projectIds && projectIds.length > 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 1, // Retry once on failure
    }
  );
};