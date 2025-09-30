import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';

const fetchProjects = async () => {
  const { data, error } = await supabase.rpc('get_user_projects');

  if (error) {
    console.error("Error fetching projects:", error);
    throw new Error('Failed to fetch projects. ' + error.message);
  }
  return data;
};

export const useProjects = () => {
  return useQuery('projects', fetchProjects, {
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
};

const fetchProjectsForTable = async () => {
    const { data, error } = await supabase.rpc('get_projects_for_table');
    if (error) {
        throw new Error(`Failed to fetch projects for table: ${error.message}`);
    }
    return data;
};

export const useProjectsTable = () => {
    return useQuery('projectsForTable', fetchProjectsForTable, {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: true,
    });
};