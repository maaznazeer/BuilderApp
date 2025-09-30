import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const askAssistant = async (params) => {
    const { data, error } = await supabase.functions.invoke('assistant-ask', {
        body: params,
    });

    if (error) {
        throw new Error(error.message);
    }
    return data;
};

const embedContent = async (params) => {
    const { data, error } = await supabase.functions.invoke('assistant-embed', {
        body: params,
    });

    if (error) {
        throw new Error(error.message);
    }
    return data;
};


export const useAiHub = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { mutateAsync: askAssistantMutation, isLoading } = useMutation(askAssistant, {
        onError: (error) => {
            toast({
                title: "Error Asking Assistant",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const { mutateAsync: embedContentMutation, isLoading: isEmbedding } = useMutation(embedContent, {
        onError: (error) => {
            toast({
                title: "Embedding Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return {
        askAssistant: askAssistantMutation,
        isLoading,
        embedContent: embedContentMutation,
        isEmbedding,
    };
};


const fetchAiTasks = async () => {
    const { data, error } = await supabase
        .from('ai_tasks')
        .select(`
            id,
            kind,
            status,
            created_at,
            projects (
                name
            )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
    if (error) throw new Error(error.message);
    return data;
};

export const useAiTasks = () => {
    return useQuery('ai_tasks', fetchAiTasks, {
        staleTime: 5 * 60 * 1000,
    });
};

const fetchAiAlerts = async (projectId) => {
    if (!projectId) return [];
    const { data, error } = await supabase
        .from('ai_alerts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50);
    if (error) throw new Error(error.message);
    return data;
};

export const useAiAlerts = (projectId) => {
    return useQuery(['ai_alerts', projectId], () => fetchAiAlerts(projectId), {
        staleTime: 1 * 60 * 1000,
        enabled: !!projectId,
    });
};