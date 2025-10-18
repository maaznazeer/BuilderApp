import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';

const fetchProcesses = async () => {
    const { data, error } = await supabase
        .from('construction_workflow')
        .select('*')
        .order('id', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

const fetchTemplates = async () => {
    const { data, error } = await supabase
        .from('construction_workflow')
        .select('*')
        .is('template_id', null)
        .order('id', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

const fetchAutomations = async () => {
    const { data, error } = await supabase
        .from('construction_workflow')
        .select('*')
        .not('automation_trigger', 'is', null)
        .order('id', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

// Construction Processes
export const useConstructionProcesses = () => {
    return useQuery('construction_processes', fetchProcesses);
};

export const useCreateConstructionProcess = () => {
    const queryClient = useQueryClient();
    return useMutation(
        async (processData) => {
            const { data, error } = await supabase
                .from('construction_workflow')
                .insert([{
                    step_name: processData.name,
                    project_id: processData.project_id,
                    phase: processData.phases?.[0]?.name || 'Planning',
                    phase_order: 1,
                    step_order: 1,
                    status: processData.status || 'Not Started',
                    estimated_duration: processData.estimated_duration
                }])
                .select()
                .single();
            if (error) throw new Error(error.message);
            return data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('construction_processes');
            }
        }
    );
};

export const useUpdateConstructionProcess = () => {
    const queryClient = useQueryClient();
    return useMutation(
        async ({ id, ...processData }) => {
            const { data, error } = await supabase
                .from('construction_workflow')
                .update({
                    step_name: processData.name,
                    description: processData.description,
                    status: processData.status,
                    estimated_duration: processData.estimated_duration
                })
                .eq('id', id)
                .select()
                .single();
            if (error) throw new Error(error.message);
            return data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('construction_processes');
            }
        }
    );
};

export const useDeleteConstructionProcess = () => {
    const queryClient = useQueryClient();
    return useMutation(
        async (id) => {
            const { error } = await supabase
                .from('construction_workflow')
                .delete()
                .eq('id', id);
            if (error) throw new Error(error.message);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('construction_processes');
            }
        }
    );
};

// Workflow Templates
export const useWorkflowTemplates = () => {
    return useQuery('workflow_templates', fetchTemplates);
};

export const useCreateWorkflowTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation(
        async (templateData) => {
            const { data, error } = await supabase
                .from('construction_workflow')
                .insert([{
                    step_name: templateData.name,
                    phase: templateData.category,
                    phase_order: 1,
                    step_order: 1,
                    status: 'Template',
                    estimated_duration: templateData.estimated_duration,
                    template_id: null
                }])
                .select()
                .single();
            if (error) throw new Error(error.message);
            return data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('workflow_templates');
            }
        }
    );
};

export const useUpdateWorkflowTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation(
        async ({ id, ...templateData }) => {
            const { data, error } = await supabase
                .from('construction_workflow')
                .update({
                    step_name: templateData.name,
                    description: templateData.description,
                    phase: templateData.category,
                    estimated_duration: templateData.estimated_duration
                })
                .eq('id', id)
                .select()
                .single();
            if (error) throw new Error(error.message);
            return data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('workflow_templates');
            }
        }
    );
};

export const useDeleteWorkflowTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation(
        async (id) => {
            const { error } = await supabase
                .from('construction_workflow')
                .delete()
                .eq('id', id);
            if (error) throw new Error(error.message);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('workflow_templates');
            }
        }
    );
};

// Automations
export const useAutomations = () => {
    return useQuery('automations', fetchAutomations);
};

export const useCreateAutomation = () => {
    const queryClient = useQueryClient();
    return useMutation(
        async (automationData) => {
            const { data, error } = await supabase
                .from('construction_workflow')
                .insert([{
                    step_name: automationData.name,
                    project_id: automationData.project_id,
                    phase: 'Automation',
                    phase_order: 1,
                    step_order: 1,
                    status: automationData.is_active ? 'Active' : 'Inactive',
                    automation_trigger: automationData.trigger_type,
                    automation_conditions: automationData.trigger_conditions,
                    automation_actions: automationData.actions
                }])
                .select()
                .single();
            if (error) throw new Error(error.message);
            return data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('automations');
            }
        }
    );
};

export const useUpdateAutomation = () => {
    const queryClient = useQueryClient();
    return useMutation(
        async ({ id, ...automationData }) => {
            const { data, error } = await supabase
                .from('construction_workflow')
                .update({
                    step_name: automationData.name,
                    description: automationData.description,
                    status: automationData.is_active ? 'Active' : 'Inactive',
                    automation_trigger: automationData.trigger_type,
                    automation_conditions: automationData.trigger_conditions,
                    automation_actions: automationData.actions
                })
                .eq('id', id)
                .select()
                .single();
            if (error) throw new Error(error.message);
            return data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('automations');
            }
        }
    );
};

export const useDeleteAutomation = () => {
    const queryClient = useQueryClient();
    return useMutation(
        async (id) => {
            const { error } = await supabase
                .from('construction_workflow')
                .delete()
                .eq('id', id);
            if (error) throw new Error(error.message);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('automations');
            }
        }
    );
};