import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Loader2, Scale } from 'lucide-react';

const ReconciliationPage = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const { projects } = useProject();
    const [loading, setLoading] = useState(false);
    const [running, setRunning] = useState(false);
    const [selectedProject, setSelectedProject] = useState('');
    const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [reconciliationData, setReconciliationData] = useState(null);

    const fetchReconciliationData = useCallback(async () => {
        // Force project selection if none selected
        let projectToUse = selectedProject;
        
        if (!projectToUse && projects && projects.length > 0) {
            projectToUse = projects[0].code || projects[0].id || projects[0].name;
            setSelectedProject(projectToUse);
            
            // Small delay to ensure state is updated
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // If still no project, try again with the first available project
        if (!projectToUse && projects && projects.length > 0) {
            projectToUse = projects[0].code || projects[0].id || projects[0].name;
        }
        
        // Check if we have all required data
        if (!user) {
            toast({ 
                variant: 'destructive', 
                title: 'Authentication Error', 
                description: 'Please log in to continue.' 
            });
            return;
        }
        
        if (!startDate || !endDate) {
            toast({ 
                variant: 'destructive', 
                title: 'Missing Date Range', 
                description: 'Please select both start and end dates.' 
            });
            return;
        }
        
        if (!projectToUse) {
            toast({ 
                variant: 'destructive', 
                title: 'No Projects Available', 
                description: 'No projects found. Please create a project first.' 
            });
            return;
        }

        setLoading(true);
        setReconciliationData(null);

        try {
            // Get financial ledger data for the selected project and date range
            const { data: ledgerData, error: ledgerError } = await supabase
                .from('financial_ledger')
                .select('*')
                .eq('user_id', user.id)
                .eq('project_code', projectToUse)
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: true });

            if (ledgerError) {
                throw new Error(ledgerError.message);
            }

            if (!ledgerData || ledgerData.length === 0) {
                setReconciliationData(null);
                toast({ title: 'No Data', description: 'No financial transactions found for the selected criteria.' });
                return;
            }

            // Calculate reconciliation data
            const reconciliation = {
                project_code: projectToUse,
                period_start: startDate,
                period_end: endDate,
                total_deposits: 0,
                total_expenses: 0,
                net_balance: 0,
                transaction_count: ledgerData.length,
                transactions: ledgerData
            };

            // Calculate totals
            ledgerData.forEach(entry => {
                if (entry.amount_to_be_received > 0) {
                    reconciliation.total_deposits += entry.amount_to_be_received;
                }
                if (entry.expense_amount > 0) {
                    reconciliation.total_expenses += entry.expense_amount;
                }
            });

            reconciliation.net_balance = reconciliation.total_deposits - reconciliation.total_expenses;

            setReconciliationData(reconciliation);
            console.log('Reconciliation data calculated:', reconciliation);
        } catch (error) {
            console.error('Error calculating reconciliation:', error);
            toast({ variant: 'destructive', title: 'Error calculating reconciliation', description: error.message });
            setReconciliationData(null);
        }
        
        setLoading(false);
    }, [selectedProject, startDate, endDate, user, toast]);

    const runReconciliation = async () => {
        // Auto-select first project if none selected
        let projectToUse = selectedProject;
        if (!projectToUse && projects && projects.length > 0) {
            projectToUse = projects[0].code;
            setSelectedProject(projectToUse);
        }
        
        // Check if we have all required data
        if (!user) {
            toast({ 
                variant: 'destructive', 
                title: 'Authentication Error', 
                description: 'Please log in to continue.' 
            });
            return;
        }
        
        if (!startDate || !endDate) {
            toast({ 
                variant: 'destructive', 
                title: 'Missing Date Range', 
                description: 'Please select both start and end dates.' 
            });
            return;
        }
        
        if (!projectToUse) {
            toast({ 
                variant: 'destructive', 
                title: 'No Projects Available', 
                description: 'No projects found. Please create a project first.' 
            });
            return;
        }

        if (!reconciliationData) {
            toast({ 
                variant: 'destructive', 
                title: 'No Reconciliation Data', 
                description: 'Please generate reconciliation data first by clicking "Generate Preview".' 
            });
            return;
        }

        setRunning(true);
        try {
            // Save reconciliation to database
            const reconciliationRecord = {
                user_id: user.id,
                project_code: projectToUse,
                statement_name: `Recon ${projectToUse} ${startDate} to ${endDate}`,
                period_start: startDate,
                period_end: endDate,
                total_deposits: reconciliationData.total_deposits,
                total_expenses: reconciliationData.total_expenses,
                net_balance: reconciliationData.net_balance,
                transaction_count: reconciliationData.transaction_count,
                status: 'completed',
                created_at: new Date().toISOString(),
                last_updated: new Date().toISOString()
            };

            // Try to insert into reconciliations table first
            let insertResult;
            try {
                const { data, error } = await supabase
                    .from('reconciliations')
                    .insert([reconciliationRecord])
                    .select();

                if (error) throw new Error(error.message);
                insertResult = data;
            } catch (reconciliationError) {
                console.warn('Reconciliations table insert failed, trying fin_reconciliations:', reconciliationError.message);
                
                // Try fin_reconciliations table as fallback
                const { data, error } = await supabase
                    .from('fin_reconciliations')
                    .insert([reconciliationRecord])
                    .select();

                if (error) throw new Error(error.message);
                insertResult = data;
            }

            toast({
                title: 'Reconciliation Completed',
                description: `Reconciliation saved successfully for ${projectToUse} (${startDate} to ${endDate})`,
            });
            
            console.log('Reconciliation saved:', insertResult);

        } catch (error) {
            console.error('Error saving reconciliation:', error);
            toast({
                variant: 'destructive',
                title: 'Error Saving Reconciliation',
                description: error.message,
            });
        } finally {
            setRunning(false);
        }
    };

    useEffect(() => {
        if (projects && projects.length > 0) {
            if (!selectedProject) {
                const projectCode = projects[0].code || projects[0].id || projects[0].name;
                setSelectedProject(projectCode);
            }
        }
    }, [projects, selectedProject]);

    // Additional effect to ensure project is selected
    useEffect(() => {
        if (projects && projects.length > 0 && !selectedProject) {
            const projectCode = projects[0].code || projects[0].id || projects[0].name;
            setSelectedProject(projectCode);
        }
    }, [projects]);
    
    const formatCurrency = (value) => {
        const project = projects.find(p => p.code === selectedProject);
        const currency = project?.currency || 'USD';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value || 0);
    };

    return (
        <>
            <Helmet>
                <title>Financial Reconciliation - DomusBuilder Hub</title>
                <meta name="description" content="Generate financial reconciliation reports for your projects." />
            </Helmet>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-4 sm:p-6 lg:p-8 space-y-6"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
                            <Scale className="mr-3 h-8 w-8 text-blue-600" />
                            Financial Reconciliation
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">Reconcile project finances for a specific period.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Generate Report</CardTitle>
                        <CardDescription>Select a project and date range to run the reconciliation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="space-y-2">
                                <label htmlFor="project-select" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Project
                                </label>
                                <Select value={selectedProject} onValueChange={setSelectedProject}>
                                    <SelectTrigger id="project-select" className="h-11 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
                                        <SelectValue placeholder="Choose a project" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {projects && projects.map((p) => {
                                            const projectValue = p.code || p.id || p.name;
                                            return (
                                                <SelectItem key={projectValue} value={projectValue} className="py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                                                        <div className="font-medium">{p.name}</div>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="start-date" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Start Date
                                </label>
                                <Input 
                                    id="start-date" 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="h-11 border-2 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="end-date" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    End Date
                                </label>
                                <Input 
                                    id="end-date" 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="h-11 border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <Button 
                                onClick={fetchReconciliationData} 
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? 'Generating...' : 'Generate Preview'}
                            </Button>
                            <Button 
                                onClick={runReconciliation} 
                                disabled={running || !reconciliationData} 
                                variant="secondary"
                            >
                                {running && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {running ? 'Running...' : 'Run Reconciliation'}
                            </Button>
                            {!selectedProject && projects && projects.length > 0 && (
                                <Button 
                                    onClick={() => {
                                        const projectCode = projects[0].code || projects[0].id || projects[0].name;
                                        setSelectedProject(projectCode);
                                    }} 
                                    variant="outline"
                                >
                                    Select First Project
                                </Button>
                            )}
                        </div>
                        
                        
                    </CardContent>
                </Card>

                {loading && (
                    <div className="flex justify-center items-center pt-10">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-lg">Calculating...</span>
                    </div>
                )}

                {reconciliationData && !loading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Reconciliation Preview for {selectedProject}</CardTitle>
                                <CardDescription>From {format(new Date(startDate), 'PPP')} to {format(new Date(endDate), 'PPP')}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                <span className="font-semibold text-green-800">Total Deposits</span>
                                            </div>
                                            <span className="font-bold text-xl text-green-600">{formatCurrency(reconciliationData.total_deposits)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                <span className="font-semibold text-red-800">Total Expenses</span>
                                            </div>
                                            <span className="font-bold text-xl text-red-600">{formatCurrency(reconciliationData.total_expenses)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                <span className="font-semibold text-blue-800">Net Balance</span>
                                            </div>
                                            <span className="font-bold text-xl text-blue-600">{formatCurrency(reconciliationData.net_balance)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                            <span className="font-semibold text-gray-800">Transaction Count</span>
                                        </div>
                                        <span className="font-bold text-xl text-gray-600">{reconciliationData.transaction_count} transactions</span>
                                    </div>

                                    {reconciliationData.transactions && reconciliationData.transactions.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                Transaction Details
                                            </h3>
                                            <div className="space-y-3">
                                                {reconciliationData.transactions.map((transaction, index) => (
                                                    <div key={index} className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900">{transaction.comment || 'Transaction'}</div>
                                                            <div className="text-sm text-gray-500 mt-1">{format(new Date(transaction.date), 'MMM dd, yyyy')}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            {transaction.amount_to_be_received > 0 && (
                                                                <span className="text-green-600 font-semibold text-lg">
                                                                    +{formatCurrency(transaction.amount_to_be_received)}
                                                                </span>
                                                            )}
                                                            {transaction.expense_amount > 0 && (
                                                                <span className="text-red-600 font-semibold text-lg">
                                                                    -{formatCurrency(transaction.expense_amount)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

            </motion.div>
        </>
    );
};

export default ReconciliationPage;