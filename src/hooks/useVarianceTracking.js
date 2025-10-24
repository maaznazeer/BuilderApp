import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useVarianceTracking = (projectId) => {
    const [varianceData, setVarianceData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const { toast } = useToast();

    const fetchVarianceData = useCallback(async () => {
        if (!projectId) return;

        setLoading(true);
        try {
            // Get project budget information
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('id, name, budget_total, budget_currency, start_date, end_date')
                .eq('id', projectId)
                .single();

            if (projectError) throw projectError;

            // Get all financial data for variance calculation
            const [
                payrollResult,
                expensesResult,
                materialsResult,
                tasksResult,
                ledgerResult
            ] = await Promise.all([
                // Payroll spending
                supabase
                    .from('payroll_entries')
                    .select('total_amount, payment_date, status')
                    .eq('project_code', project.code)
                    .eq('status', 'Paid'),
                
                // Direct expenses
                supabase
                    .from('expenses')
                    .select('amount, category, created_at')
                    .eq('project_id', projectId),
                
                // Material costs from task materials
                supabase
                    .from('task_materials')
                    .select(`
                        quantity_planned,
                        quantity_used,
                        materials!inner(unit_cost),
                        pm_tasks!inner(project_code)
                    `)
                    .eq('pm_tasks.project_code', project.code),
                
                // Task costs (estimated vs actual)
                supabase
                    .from('pm_tasks')
                    .select('estimated_labor_cost, estimated_material_cost, actual_labor_cost, actual_material_cost, task_name, status')
                    .eq('project_code', project.id),
                
                // Financial ledger entries
                supabase
                    .from('financial_ledger')
                    .select('expense_amount, amount_to_be_received, date')
                    .eq('project_code', project.code)
            ]);

            // Calculate planned vs actual costs
            let plannedCosts = {
                labor: 0,
                materials: 0,
                expenses: 0,
                total: 0
            };

            let actualCosts = {
                labor: 0,
                materials: 0,
                expenses: 0,
                total: 0
            };

            // Calculate planned costs from tasks
            if (tasksResult.data) {
                tasksResult.data.forEach(task => {
                    plannedCosts.labor += task.estimated_labor_cost || 0;
                    plannedCosts.materials += task.estimated_material_cost || 0;
                });
            }

            // Calculate actual costs
            // Payroll (actual labor)
            if (payrollResult.data) {
                payrollResult.data.forEach(entry => {
                    actualCosts.labor += entry.total_amount || 0;
                });
            }

            // Direct expenses
            if (expensesResult.data) {
                expensesResult.data.forEach(expense => {
                    actualCosts.expenses += expense.amount || 0;
                });
            }

            // Material costs (actual)
            if (materialsResult.data) {
                materialsResult.data.forEach(material => {
                    const quantityUsed = material.quantity_used || material.quantity_planned || 0;
                    const materialCost = quantityUsed * (material.materials?.unit_cost || 0);
                    actualCosts.materials += materialCost;
                });
            }

            // Financial ledger expenses
            if (ledgerResult.data) {
                ledgerResult.data.forEach(entry => {
                    const expenseAmount = entry.expense_amount || 0;
                    actualCosts.expenses += expenseAmount;
                });
            }

            // Calculate totals
            plannedCosts.total = plannedCosts.labor + plannedCosts.materials + plannedCosts.expenses;
            actualCosts.total = actualCosts.labor + actualCosts.materials + actualCosts.expenses;

            // Calculate variances
            const variances = {
                labor: actualCosts.labor - plannedCosts.labor,
                materials: actualCosts.materials - plannedCosts.materials,
                expenses: actualCosts.expenses - plannedCosts.expenses,
                total: actualCosts.total - plannedCosts.total
            };

            // Calculate variance percentages
            const variancePercentages = {
                labor: plannedCosts.labor > 0 ? (variances.labor / plannedCosts.labor) * 100 : 0,
                materials: plannedCosts.materials > 0 ? (variances.materials / plannedCosts.materials) * 100 : 0,
                expenses: plannedCosts.expenses > 0 ? (variances.expenses / plannedCosts.expenses) * 100 : 0,
                total: plannedCosts.total > 0 ? (variances.total / plannedCosts.total) * 100 : 0
            };

            // Generate variance alerts
            const newAlerts = [];
            
            // Critical variance alerts (>20% over budget)
            if (variancePercentages.total > 20) {
                newAlerts.push({
                    type: 'critical',
                    category: 'total',
                    message: `Critical variance: Project is ${variancePercentages.total.toFixed(1)}% over budget`,
                    amount: variances.total
                });
            }

            // Labor variance alerts
            if (variancePercentages.labor > 15) {
                newAlerts.push({
                    type: 'warning',
                    category: 'labor',
                    message: `Labor variance: ${variancePercentages.labor.toFixed(1)}% over planned`,
                    amount: variances.labor
                });
            }

            // Material variance alerts
            if (variancePercentages.materials > 15) {
                newAlerts.push({
                    type: 'warning',
                    category: 'materials',
                    message: `Material variance: ${variancePercentages.materials.toFixed(1)}% over planned`,
                    amount: variances.materials
                });
            }

            // Positive variance (under budget) - good news
            if (variancePercentages.total < -10) {
                newAlerts.push({
                    type: 'success',
                    category: 'total',
                    message: `Positive variance: Project is ${Math.abs(variancePercentages.total).toFixed(1)}% under budget`,
                    amount: Math.abs(variances.total)
                });
            }

            const varianceInfo = {
                project,
                plannedCosts,
                actualCosts,
                variances,
                variancePercentages,
                alerts: newAlerts,
                lastUpdated: new Date().toISOString()
            };

            setVarianceData(varianceInfo);
            setAlerts(newAlerts);

            // Show alerts to user
            newAlerts.forEach(alert => {
                toast({
                    variant: alert.type === 'critical' ? 'destructive' : 
                            alert.type === 'warning' ? 'destructive' : 'default',
                    title: `Variance ${alert.type === 'critical' ? 'Alert' : 
                            alert.type === 'warning' ? 'Warning' : 'Update'}`,
                    description: alert.message
                });
            });

        } catch (error) {
            console.error('Error fetching variance data:', error);
            toast({
                variant: 'destructive',
                title: 'Error loading variance data',
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    }, [projectId, toast]);

    useEffect(() => {
        fetchVarianceData();
    }, [fetchVarianceData]);

    return {
        varianceData,
        loading,
        alerts,
        refreshVariance: fetchVarianceData
    };
};
