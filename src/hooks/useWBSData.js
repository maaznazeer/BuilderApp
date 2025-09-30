import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';

const fetchWBSData = async (projectCode, filters) => {
  if (!projectCode) {
    return [];
  }

  let query = supabase
    .from('wbs_tasks')
    .select('*')
    .eq('project_code', projectCode);

  if (filters.phases?.length > 0) {
    query = query.in('phase', filters.phases);
  }
  
  if (filters.status) {
    const statusMap = {
      'Not Started': ['Not Started'],
      'In Progress': ['In Progress', 'On Hold', 'Delayed'],
      'Done': ['Done', 'Completed'],
    };
    if (statusMap[filters.status]) {
      query = query.in('status', statusMap[filters.status]);
    }
  }

  if (filters.priorities?.length > 0) {
    query = query.in('priority', filters.priorities);
  }

  query = query.order('wbs', { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

export const useWBSData = (projectCode, filters) => {
  return useQuery(
    ['wbsData', projectCode, filters],
    () => fetchWBSData(projectCode, filters),
    {
      enabled: !!projectCode,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );
};