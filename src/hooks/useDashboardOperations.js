import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useDashboard } from '@/contexts/DashboardContext';

const fetchDashboardOperations = async (projectIds) => {
  if (!projectIds || projectIds.length === 0) {
    return {
        activity_feed: [],
        deliveries_timeline: []
    };
  }

  const { data, error } = await supabase.rpc('get_dashboard_operations', { p_project_ids: projectIds });

  if (error) {
    console.error('Error fetching dashboard operations:', error);
    throw new Error('Failed to fetch dashboard operations. ' + error.message);
  }
  
  return data;
};

export const useDashboardOperations = () => {
  const { projectIds } = useDashboard();
  
  return useQuery(
    ['dashboardOperations', projectIds],
    () => fetchDashboardOperations(projectIds),
    {
      enabled: !!projectIds,
      staleTime: 1000 * 60 * 1, // 1 minute
      refetchOnWindowFocus: true,
    }
  );
};