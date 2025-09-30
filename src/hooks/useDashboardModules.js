import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useDashboard } from '@/contexts/DashboardContext';

const fetchDashboardModules = async (projectIds) => {
  if (!projectIds || projectIds.length === 0) {
    return null;
  }

  const { data, error } = await supabase.rpc('get_dashboard_modules', { p_project_ids: projectIds });

  if (error) {
    console.error('Error fetching dashboard modules:', error);
    throw new Error('Failed to fetch dashboard modules. ' + error.message);
  }
  
  return data;
};

export const useDashboardModules = () => {
  const { projectIds } = useDashboard();
  
  return useQuery(
    ['dashboardModules', projectIds],
    () => fetchDashboardModules(projectIds),
    {
      enabled: !!projectIds && projectIds.length > 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );
};