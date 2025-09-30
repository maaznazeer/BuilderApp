import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useWorkflow = (isTemplate = false, templateId = null) => {
    const { toast } = useToast();
    const [workflow, setWorkflow] = useState([]);
    const [loading, setLoading] = useState(true);

    const fromTable = 'construction_workflow';
    
    const fetchWorkflow = useCallback(async () => {
        setLoading(true);
        let query = supabase.from(fromTable).select('*');

        if (isTemplate) {
            if (templateId) {
                query = query.eq('template_id', templateId);
            } else {
                query = query.is('template_id', null);
            }
        }
        
        const { data, error } = await query
            .order('phase_order')
            .order('step_order');

        if (error) {
            toast({ title: "Error fetching workflow", description: error.message, variant: "destructive" });
            setWorkflow([]);
        } else {
            setWorkflow(data || []);
        }
        setLoading(false);
    }, [toast, fromTable, isTemplate, templateId]);

    useEffect(() => {
        fetchWorkflow();
    }, [fetchWorkflow]);

    const addWorkflowStep = async (formData, files) => {
        const payload = { ...formData };
        if(isTemplate) {
            payload.template_id = templateId || null;
        }

        const { data, error } = await supabase.from('construction_workflow').insert(payload).select().single();
        
        if (error) {
            toast({ title: "Error creating step", description: error.message, variant: "destructive" });
            return null;
        } 
        
        if (files.length > 0) {
            toast({
                title: "Files 'uploaded' for step!",
                description: `${files.map(f => f.name).join(', ')} would be uploaded here.`
            });
        }
        
        toast({ title: "Step created successfully!", description: data.step_name });
        await fetchWorkflow();
        return data;
    };
    
    const updateWorkflowStep = async (stepId, formData, files) => {
        const { data, error } = await supabase.from('construction_workflow').update(formData).eq('id', stepId).select().single();

        if (error) {
            toast({ title: "Error updating step", description: error.message, variant: "destructive" });
            return null;
        }
        
        if (files.length > 0) {
            toast({
                title: "Files 'uploaded' for step!",
                description: `${files.map(f => f.name).join(', ')} would be uploaded here.`
            });
        }

        toast({ title: "Step updated successfully!", description: data.step_name });
        await fetchWorkflow();
        return data;
    };
    
    const deleteWorkflowStep = async (stepId) => {
        if (!window.confirm("Are you sure you want to delete this step? This action cannot be undone.")) return;
        
        const { error } = await supabase.from('construction_workflow').delete().eq('id', stepId);

        if (error) {
            toast({ title: "Error deleting step", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Step deleted successfully!" });
            await fetchWorkflow();
        }
    };
    
    const groupedWorkflow = useMemo(() => {
        return workflow.reduce((acc, step) => {
            const phaseKey = `${step.phase_order}-${step.phase}`;
            (acc[phaseKey] = acc[phaseKey] || []).push(step);
            return acc;
        }, {});
    }, [workflow]);

    return { 
        workflow, 
        loading, 
        groupedWorkflow,
        fetchWorkflow, 
        addWorkflowStep,
        updateWorkflowStep,
        deleteWorkflowStep
    };
};