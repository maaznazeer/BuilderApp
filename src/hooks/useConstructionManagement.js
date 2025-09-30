import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';

const fetchProcesses = async () => {
    const { data, error } = await supabase.from('v_cm_processes').select('*');
    if (error) throw new Error(error.message);
    return data;
};

const fetchTemplates = async () => {
    const { data, error } = await supabase.from('v_cm_workflow_templates').select('*');
    if (error) throw new Error(error.message);
    return data;
};

const fetchAutomations = async () => {
    const { data, error } = await supabase.from('v_cm_automations').select('*');
    if (error) throw new Error(error.message);
    return data;
};

export const useConstructionProcesses = () => {
    return useQuery('cm_processes', fetchProcesses);
};

export const useWorkflowTemplates = () => {
    return useQuery('cm_workflow_templates', fetchTemplates);
};

export const useAutomations = () => {
    return useQuery('cm_automations', fetchAutomations);
};