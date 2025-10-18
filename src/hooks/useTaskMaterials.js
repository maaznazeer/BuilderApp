import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useTaskMaterials = (taskIds = []) => {
    const [taskMaterials, setTaskMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchTaskMaterials = useCallback(async () => {
        if (!taskIds || taskIds.length === 0) {
            setTaskMaterials([]);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('task_materials')
                .select(`
                    *,
                    materials (
                        name,
                        unit_cost,
                        quantity,
                        supplier_id
                    ),
                    pm_tasks (
                        task_name,
                        project_code
                    )
                `)
                .in('task_id', taskIds);

            if (error) throw error;
            setTaskMaterials(data || []);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error fetching task materials',
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    }, [taskIds, toast]);

    const addTaskMaterial = useCallback(async (taskId, materialId, quantityPlanned, unit, notes = '') => {
        try {
            const { data, error } = await supabase
                .from('task_materials')
                .insert({
                    task_id: taskId,
                    material_id: materialId,
                    quantity_planned: quantityPlanned,
                    unit: unit,
                    notes: notes
                })
                .select()
                .single();

            if (error) throw error;
            
            // Refresh the data
            await fetchTaskMaterials();
            
            toast({
                title: 'Material added to task',
                description: 'Material has been successfully added to the task.'
            });
            
            return data;
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error adding material to task',
                description: error.message
            });
            throw error;
        }
    }, [fetchTaskMaterials, toast]);

    const updateTaskMaterial = useCallback(async (taskMaterialId, updates) => {
        try {
            const { data, error } = await supabase
                .from('task_materials')
                .update(updates)
                .eq('id', taskMaterialId)
                .select()
                .single();

            if (error) throw error;
            
            // Refresh the data
            await fetchTaskMaterials();
            
            toast({
                title: 'Task material updated',
                description: 'Material assignment has been successfully updated.'
            });
            
            return data;
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error updating task material',
                description: error.message
            });
            throw error;
        }
    }, [fetchTaskMaterials, toast]);

    const removeTaskMaterial = useCallback(async (taskMaterialId) => {
        try {
            const { error } = await supabase
                .from('task_materials')
                .delete()
                .eq('id', taskMaterialId);

            if (error) throw error;
            
            // Refresh the data
            await fetchTaskMaterials();
            
            toast({
                title: 'Material removed from task',
                description: 'Material has been successfully removed from the task.'
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error removing material from task',
                description: error.message
            });
            throw error;
        }
    }, [fetchTaskMaterials, toast]);

    const markMaterialUsed = useCallback(async (taskMaterialId, quantityUsed) => {
        try {
            const { data, error } = await supabase
                .from('task_materials')
                .update({ quantity_used: quantityUsed })
                .eq('id', taskMaterialId)
                .select()
                .single();

            if (error) throw error;
            
            // Refresh the data
            await fetchTaskMaterials();
            
            toast({
                title: 'Material usage updated',
                description: `Marked ${quantityUsed} units as used.`
            });
            
            return data;
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error updating material usage',
                description: error.message
            });
            throw error;
        }
    }, [fetchTaskMaterials, toast]);

    const getTaskMaterials = useCallback((taskId) => {
        return taskMaterials.filter(tm => tm.task_id === taskId);
    }, [taskMaterials]);

    const getMaterialUsage = useCallback((materialId) => {
        return taskMaterials.filter(tm => tm.material_id === materialId);
    }, [taskMaterials]);

    const calculateTaskMaterialCost = useCallback((taskId) => {
        const materials = getTaskMaterials(taskId);
        return materials.reduce((total, tm) => {
            const material = tm.material_inventory;
            const plannedCost = (tm.quantity_planned || 0) * (material?.unit_price || 0);
            const usedCost = (tm.quantity_used || 0) * (material?.unit_price || 0);
            return total + usedCost; // Return actual cost based on usage
        }, 0);
    }, [getTaskMaterials]);

    useEffect(() => {
        fetchTaskMaterials();
    }, [fetchTaskMaterials]);

    return {
        taskMaterials,
        loading,
        addTaskMaterial,
        updateTaskMaterial,
        removeTaskMaterial,
        markMaterialUsed,
        getTaskMaterials,
        getMaterialUsage,
        calculateTaskMaterialCost,
        refresh: fetchTaskMaterials
    };
};
