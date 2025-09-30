import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const fetchBalances = async (userId) => {
    if (!userId) return [];
    const { data, error } = await supabase
        .from('v_fin_balances')
        .select('*')
        .eq('user_id', userId);
    if (error) throw new Error(error.message);
    
    const balances = { Cash: 0, Payables: 0, Receivables: 0, currency: 'USD' };
    data.forEach(item => {
        if (item.account_type in balances) {
            balances[item.account_type] = item.balance;
        }
        if(item.currency) balances.currency = item.currency;
    });
    return balances;
};

export const useFinancialBalances = () => {
    const { user } = useAuth();
    return useQuery(['financialBalances', user?.id], () => fetchBalances(user?.id), {
        enabled: !!user,
    });
};

const fetchLedger = async (userId) => {
    if (!userId) return [];
    const { data, error } = await supabase
        .from('v_fin_ledger')
        .select('*')
        .eq('user_id', userId)
        .order('tx_date', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

export const useFinancialLedger = () => {
    const { user } = useAuth();
    return useQuery(['financialLedger', user?.id], () => fetchLedger(user?.id), {
        enabled: !!user,
    });
};

const fetchReconciliations = async (userId) => {
    if (!userId) return [];
    const { data, error } = await supabase
        .from('fin_reconciliations')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

export const useFinancialReconciliations = () => {
    const { user } = useAuth();
    return useQuery(['financialReconciliations', user?.id], () => fetchReconciliations(user?.id), {
        enabled: !!user,
    });
};