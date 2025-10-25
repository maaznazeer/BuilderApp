import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useBudgetTracking = (projectId) => {
    const [budgetData, setBudgetData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const { toast } = useToast();

    const fetchBudgetData = useCallback(async () => {
        if (!projectId) {
            console.warn('useBudgetTracking - No projectId provided');
            return;
        }

        setLoading(true);
        try {
            // Get project budget information
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('id, name, budget_total, budget_currency, start_date, end_date')
                .eq('id', projectId)
                .single();

            if (projectError) throw projectError;

            // Get all spending data from different sources
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
                    .eq('project_code', projectId)
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
                        materials!inner(unit_cost),
                        pm_tasks!inner(project_code)
                    `)
                    .eq('pm_tasks.project_code', projectId),
                
                // Task costs (estimated and actual)
                supabase
                    .from('pm_tasks')
                    .select('estimated_labor_cost, estimated_material_cost, actual_labor_cost, actual_material_cost')
                    .eq('project_code', projectId),
                
                // Financial ledger entries
                supabase
                    .from('financial_ledger')
                    .select('expense_amount, amount_to_be_received, date')
                    .eq('project_code', projectId)
            ]);

            // Calculate total spending
            let totalSpent = 0;
            const spendingBreakdown = {
                payroll: 0,
                expenses: 0,
                materials: 0,
                tasks: 0,
                ledger: 0
            };

            // Payroll spending
            if (payrollResult.data) {
                payrollResult.data.forEach(entry => {
                    totalSpent += entry.total_amount || 0;
                    spendingBreakdown.payroll += entry.total_amount || 0;
                });
            }

            // Direct expenses
            if (expensesResult.data) {
                expensesResult.data.forEach(expense => {
                    totalSpent += expense.amount || 0;
                    spendingBreakdown.expenses += expense.amount || 0;
                });
            }

            // Material costs
            if (materialsResult.data) {
                materialsResult.data.forEach(material => {
                    const materialCost = (material.quantity_planned || 0) * (material.materials?.unit_cost || 0);
                    totalSpent += materialCost;
                    spendingBreakdown.materials += materialCost;
                });
            }

            // Task costs (use actual if available, otherwise estimated)
            if (tasksResult.data) {
                tasksResult.data.forEach(task => {
                    const laborCost = task.actual_labor_cost || task.estimated_labor_cost || 0;
                    const materialCost = task.actual_material_cost || task.estimated_material_cost || 0;
                    const taskTotal = laborCost + materialCost;
                    totalSpent += taskTotal;
                    spendingBreakdown.tasks += taskTotal;
                });
            }

            // Financial ledger expenses
            if (ledgerResult.data) {
                ledgerResult.data.forEach(entry => {
                    const expenseAmount = entry.expense_amount || 0;
                    totalSpent += expenseAmount;
                    spendingBreakdown.ledger += expenseAmount;
                });
            }

            const budgetTotal = project.budget_total || 0;
            const remainingBudget = budgetTotal - totalSpent;
            const budgetPercentage = budgetTotal > 0 ? (totalSpent / budgetTotal) * 100 : 0;

            // Generate alerts based on budget status
            const newAlerts = [];
            if (budgetPercentage >= 100) {
                newAlerts.push({
                    type: 'critical',
                    message: 'Budget exceeded! Total spending has reached or exceeded the project budget.',
                    amount: totalSpent - budgetTotal
                });
            } else if (budgetPercentage >= 90) {
                newAlerts.push({
                    type: 'warning',
                    message: 'Budget nearly exhausted! You have used 90% or more of your project budget.',
                    remaining: remainingBudget
                });
            } else if (budgetPercentage >= 75) {
                newAlerts.push({
                    type: 'info',
                    message: 'Budget alert: You have used 75% or more of your project budget.',
                    remaining: remainingBudget
                });
            }

            const budgetInfo = {
                project,
                budgetTotal,
                totalSpent,
                remainingBudget,
                budgetPercentage,
                spendingBreakdown,
                alerts: newAlerts,
                lastUpdated: new Date().toISOString()
            };

            // Debug logging
            console.log('useBudgetTracking Debug:', {
                projectId,
                project,
                budgetTotal,
                totalSpent,
                remainingBudget,
                budgetPercentage,
                spendingBreakdown,
                payrollData: payrollResult.data?.length || 0,
                expensesData: expensesResult.data?.length || 0,
                materialsData: materialsResult.data?.length || 0,
                tasksData: tasksResult.data?.length || 0,
                ledgerData: ledgerResult.data?.length || 0
            });

            setBudgetData(budgetInfo);
            setAlerts(newAlerts);

            // Show alerts to user
            newAlerts.forEach(alert => {
                toast({
                    variant: alert.type === 'critical' ? 'destructive' : 
                            alert.type === 'warning' ? 'destructive' : 'default',
                    title: `Budget ${alert.type === 'critical' ? 'Exceeded' : 
                            alert.type === 'warning' ? 'Warning' : 'Alert'}`,
                    description: alert.message
                });
            });

        } catch (error) {
            console.error('Error fetching budget data:', error);
            toast({
                variant: 'destructive',
                title: 'Error loading budget data',
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    }, [projectId, toast]);

    useEffect(() => {
        fetchBudgetData();
    }, [fetchBudgetData]);

    return {
        budgetData,
        loading,
        alerts,
        refreshBudget: fetchBudgetData
    };
};
