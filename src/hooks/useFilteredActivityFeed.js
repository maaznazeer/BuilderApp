import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useDashboard } from '@/contexts/DashboardContext';

const fetchFilteredActivityFeed = async (projectIds, filter) => {
  if (!projectIds || projectIds.length === 0) {
    return [];
  }
  
  let rpcName = 'get_project_activity_all_projects';
  let params = { p_project_ids: projectIds, p_limit: 50 };

  if (filter) {
    rpcName = 'get_project_activity_by_type';
    params = { ...params, p_activity_type: filter };
  }

  const { data, error } = await supabase.rpc(rpcName, params);

  if (error) {
    throw new Error(`Failed to fetch activity feed: ${error.message}`);
  }

  return data;
};


export const useFilteredActivityFeed = (filter) => {
  const { projectIds } = useDashboard();
  
  return useQuery(
    ['activityFeed', projectIds, filter],
    () => fetchFilteredActivityFeed(projectIds, filter),
    {
      enabled: !!projectIds && projectIds.length > 0,
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: true,
    }
  );
};