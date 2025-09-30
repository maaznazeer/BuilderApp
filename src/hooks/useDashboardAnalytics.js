import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useDashboard } from '@/contexts/DashboardContext';

const fetchDashboardAnalytics = async (projectIds) => {
  if (!projectIds || projectIds.length === 0) {
    return {
        spend_by_category_30d: [],
        schedule_risk: {
            delayed_milestones_count: 0,
            avg_lateness_days: 0,
            upcoming_milestones_14d: 0,
            overdue_tasks_count: 0,
        },
        schedule_risk_trend_60d: []
    };
  }

  const { data, error } = await supabase.rpc('get_dashboard_analytics', { p_project_ids: projectIds });

  if (error) {
    console.error('Error fetching dashboard analytics:', error);
    throw new Error('Failed to fetch dashboard analytics. ' + error.message);
  }
  
  return data;
};

export const useDashboardAnalytics = () => {
  const { projectIds } = useDashboard();
  
  return useQuery(
    ['dashboardAnalytics', projectIds],
    () => fetchDashboardAnalytics(projectIds),
    {
      enabled: !!projectIds && projectIds.length > 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );
};