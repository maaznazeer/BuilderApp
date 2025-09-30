import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';

const fetchWorkers = async () => {
    const { data, error } = await supabase.from('v_workforce_workers').select('*').limit(5);
    if (error) throw new Error(error.message);
    return data;
};

const fetchPayrollRuns = async () => {
    const { data, error } = await supabase.from('v_payroll_runs').select('*').order('run_date', { ascending: false }).limit(5);
    if (error) throw new Error(error.message);
    return data;
};

export const useWorkforceWorkers = () => {
    return useQuery('workforce_workers', fetchWorkers);
};

export const usePayrollRuns = () => {
    return useQuery('payroll_runs', fetchPayrollRuns);
};