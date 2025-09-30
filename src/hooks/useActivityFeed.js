import { useQuery } from 'react-query';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useDashboard } from '@/contexts/DashboardContext';

    const fetchActivityFeed = async (projectIds) => {
        if (!projectIds || projectIds.length === 0) {
            return [];
        }

        const { data, error } = await supabase
            .from('v_activity_feed_safe')
            .select('*')
            .in('project_id', projectIds)
            .order('created_at', { ascending: false })
            .limit(15);

        if (error) {
            console.error('Error fetching activity feed:', error);
            throw new Error('Failed to fetch activity feed. ' + error.message);
        }
        
        return data;
    };

    export const useActivityFeed = () => {
        const { projectIds } = useDashboard();
        
        return useQuery(
            ['activityFeed', projectIds],
            () => fetchActivityFeed(projectIds),
            {
                enabled: !!projectIds && projectIds.length > 0,
                staleTime: 1000 * 60 * 1, // 1 minute
            }
        );
    };