import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';

const fetchPlannerTasks = async () => {
    const { data, error } = await supabase
        .from('planner_tasks')
        .select('*');

    if (error) {
        console.error('Error fetching planner tasks:', error);
        throw new Error(error.message);
    }

    return data;
};

export const usePlannerTasks = () => {
    return useQuery('plannerTasks', fetchPlannerTasks, {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: true,
    });
};