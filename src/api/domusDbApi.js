import { supabase } from '@/lib/customSupabaseClient';

export const domusDbApi = {
    getMetrics: async () => {
        const { data, error } = await supabase.from('v_dashboard_metrics').select('*');
        if (error) throw error;
        return data;
    },
    getProjectCards: async () => {
        const { data, error } = await supabase.from('v_dashboard_project_cards').select('*').order('last_activity_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    getActivity: async () => {
        const { data, error } = await supabase.from('v_dashboard_activity').select('*').limit(20);
        if (error) throw error;
        return data;
    },
    getProjects: async () => {
        const { data, error } = await supabase.from('projects').select('*').order('updated_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    getPlannerTasks: async () => {
        const { data, error } = await supabase.from('tasks').select('*,milestone:milestones(title),assignee:profiles(full_name)').order('due_date', { ascending: true });
        if (error) throw error;
        return data;
    },
    getConstructionProcesses: async () => {
        const { data, error } = await supabase.from('construction_processes').select('*');
        if (error) throw error;
        return data;
    },
    getWorkflowTemplates: async () => {
        const { data, error } = await supabase.from('workflow_templates').select('*');
        if (error) throw error;
        return data;
    },
    getAutomations: async () => {
        const { data, error } = await supabase.from('automations').select('*');
        if (error) throw error;
        return data;
    },
    getWorkers: async () => {
        const { data, error } = await supabase.from('workers').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    getPayrollRuns: async () => {
        const { data, error } = await supabase.from('payroll_runs').select('*').order('run_date', { ascending: false });
        if (error) throw error;
        return data;
    },
    getSuppliers: async (projectId) => {
        let query = supabase.from('suppliers').select('*');
        if (projectId) {
            query = query.eq('project_id', projectId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data;
    },
    getInventoryItems: async () => {
        const { data, error } = await supabase.from('inventory_items').select('*');
        if (error) throw error;
        return data;
    },
    getMaterialPurchases: async () => {
        const { data, error } = await supabase.from('material_purchases').select('*');
        if (error) throw error;
        return data;
    },
    getGoodsReceivedNotes: async () => {
        const { data, error } = await supabase.from('grn').select('*');
        if (error) throw error;
        return data;
    },
    getGoodsIssueNotes: async () => {
        const { data, error } = await supabase.from('gin').select('*');
        if (error) throw error;
        return data;
    },
    getStockMovements: async () => {
        const { data, error } = await supabase.from('stock_movements').select('*');
        if (error) throw error;
        return data;
    },
    getProjectMaterials: async () => {
        const { data, error } = await supabase.from('project_materials').select('*');
        if (error) throw error;
        return data;
    },
    getFinancialLedger: async () => {
        const { data, error } = await supabase.from('financial_ledger').select('*').order('tx_date', { ascending: false });
        if (error) throw error;
        return data;
    },
    getBalanceDigests: async (userId) => {
        const { data, error } = await supabase
            .from('balance_digests')
            .select('*')
            .eq('user_id', userId)
            .order('as_of', { ascending: false });
        if (error) throw error;
        return data;
    },
    createBalanceDigest: async (digestData) => {
        const { data, error } = await supabase
            .from('balance_digests')
            .insert(digestData)
            .select();
        if (error) throw error;
        return data;
    },
    getReconciliations: async () => {
        const { data, error } = await supabase.from('reconciliations').select('*');
        if (error) throw error;
        return data;
    },
    getFinancialReports: async () => {
        const { data, error } = await supabase.from('financial_reports').select('*');
        if (error) throw error;
        return data;
    },
    getProjectSettings: async () => {
        const { data, error } = await supabase.from('project_settings').select('*');
        if (error) throw error;
        return data;
    },
};