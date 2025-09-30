import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';

const fetchSuppliers = async (projectId) => {
  if (!projectId) return [];

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('project_id', projectId)
    .order('supplier_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useSuppliers = (projectId) => {
  return useQuery(['suppliers', projectId], () => fetchSuppliers(projectId), {
    enabled: !!projectId,
  });
};