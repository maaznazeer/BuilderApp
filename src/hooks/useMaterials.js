import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';

const fetchMaterials = async (projectId) => {
  if (!projectId) return [];

  const { data, error } = await supabase
    .from('materials')
    .select(`
      *,
      suppliers (
        supplier_name
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useMaterials = (projectId) => {
  return useQuery(['materials', projectId], () => fetchMaterials(projectId), {
    enabled: !!projectId,
  });
};