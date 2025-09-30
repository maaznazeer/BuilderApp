import { supabase } from '@/lib/customSupabaseClient';

const BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`;

const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    // When a user is logged in, we must use their access token (JWT) for authorization.
    // The anon key is only for requests where a user is not authenticated.
    const token = session?.access_token;

    if (!token) {
        // This case should ideally not happen for authenticated routes.
        // Fallback to anon key for public data if necessary, but it's better to ensure a session exists.
        console.warn("No user session found, using anon key for API request. Data may be restricted.");
    }
    
    return {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
    };
};

const apiFetch = async (endpoint) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}${endpoint}`, { headers });

    if (!response.ok) {
        const errorData = await response.json();
        // Check for common auth errors to provide better feedback.
        if (response.status === 401 || (errorData.message && (errorData.message.includes('JWT') || errorData.message.includes('token')))) {
            throw new Error('Your session may have expired. Please try re-authenticating.');
        }
        throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }
    return response.json();
};

export const domusDbApi = {
    getMetrics: () => {
        return apiFetch('/v_dashboard_metrics?select=*');
    },
    getProjectCards: () => {
        return apiFetch('/v_dashboard_project_cards?select=*&order=last_activity_at.desc');
    },
    getActivity: () => {
        return apiFetch('/v_dashboard_activity?select=*&limit=20');
    },
    getProjects: () => {
        return apiFetch('/projects?select=*&order=updated_at.desc');
    },
    getPlannerTasks: () => {
        return apiFetch('/tasks?select=*,milestone:milestones(title),assignee:profiles(full_name)&order=due_date.asc');
    },
    getConstructionProcesses: () => {
        return apiFetch('/construction_processes?select=*');
    },
    getWorkflowTemplates: () => {
        return apiFetch('/workflow_templates?select=*');
    },
    getAutomations: () => {
        return apiFetch('/automations?select=*');
    },
    getWorkers: () => {
        return apiFetch('/workers?select=*&order=created_at.desc');
    },
    getPayrollRuns: () => {
        return apiFetch('/payroll_runs?select=*&order=run_date.desc');
    },
    getSuppliers: () => {
        return apiFetch('/suppliers?select=*');
    },
    getInventoryItems: () => {
        return apiFetch('/inventory_items?select=*');
    },
    getMaterialPurchases: () => {
        return apiFetch('/material_purchases?select=*');
    },
    getGoodsReceivedNotes: () => {
        return apiFetch('/grn?select=*');
    },
    getGoodsIssueNotes: () => {
        return apiFetch('/gin?select=*');
    },
    getStockMovements: () => {
        return apiFetch('/stock_movements?select=*');
    },
    getProjectMaterials: () => {
        return apiFetch('/project_materials?select=*');
    },
    getFinancialLedger: () => {
        return apiFetch('/financial_ledger?select=*&order=tx_date.desc');
    },
    getBalanceDigests: () => {
        return apiFetch('/balance_digests?select=*');
    },
    getReconciliations: () => {
        return apiFetch('/reconciliations?select=*');
    },
    getFinancialReports: () => {
        return apiFetch('/financial_reports?select=*');
    },
    getProjectSettings: () => {
        return apiFetch('/project_settings?select=*');
    },
};