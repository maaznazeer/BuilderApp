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
        if (!selectedProject || !startDate || !endDate || !user) {
            return;
        }

        setLoading(true);
        setReconciliationData(null);

        const { data, error } = await supabase.rpc('rpc_financial_reconciliation', {
            p_project_code: selectedProject,
            p_start: startDate,
            p_end: endDate,
            p_user_id: user.id
        });

        if (error) {
            toast({ variant: 'destructive', title: 'Error fetching reconciliation data', description: error.message });
        } else if (data && data.length > 0) {
            setReconciliationData(data[0]);
        } else {
            setReconciliationData(null);
            toast({ title: 'No Data', description: 'No reconciliation data found for the selected criteria.' });
        }
        setLoading(false);
    }, [selectedProject, startDate, endDate, user, toast]);

    const runReconciliation = async () => {
        if (!selectedProject || !startDate || !endDate) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a project and date range.' });
            return;
        }
        setRunning(true);
        try {
            const statementName = `Recon ${selectedProject} ${startDate} to ${endDate}`;
            const { data, error } = await supabase.rpc('run_reconciliation', {
                p_project_code: selectedProject,
                p_statement_name: statementName,
                p_period_start: startDate,
                p_period_end: endDate
            });

            if (error) {
                throw error;
            }

            toast({
                title: 'Reconciliation Started',
                description: `Reconciliation process has been initiated with ID: ${data}`,
            });
            
            // Optionally, you can fetch the list of reconciliations again here
            // to show the new 'running' one in a list.

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error Starting Reconciliation',
                description: error.message,
            });
        } finally {
            setRunning(false);
        }
    };

    useEffect(() => {
        if (projects && projects.length > 0 && !selectedProject) {
            setSelectedProject(projects[0].code);
        }
    }, [projects, selectedProject]);
    
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label htmlFor="project-select" className="text-sm font-medium text-gray-700">Project</label>
                                <Select value={selectedProject} onValueChange={setSelectedProject}>
                                    <SelectTrigger id="project-select">
                                        <SelectValue placeholder="Select a project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects && projects.map((p) => (
                                            <SelectItem key={p.code} value={p.code}>
                                                {p.name} ({p.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="start-date" className="text-sm font-medium text-gray-700">Start Date</label>
                                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="end-date" className="text-sm font-medium text-gray-700">End Date</label>
                                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <Button onClick={fetchReconciliationData} disabled={loading || !selectedProject}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? 'Generating...' : 'Generate Preview'}
                            </Button>
                            <Button onClick={runReconciliation} disabled={running || !selectedProject} variant="secondary">
                                {running && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {running ? 'Running...' : 'Run Reconciliation'}
                            </Button>
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
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="font-semibold">Opening Balance</span>
                                        <span className="font-bold text-lg">{formatCurrency(reconciliationData.opening_balance)}</span>
                                    </div>
                                    <div className="pl-4 space-y-2">
                                        <div className="flex justify-between items-center p-3 border-b">
                                            <span className="text-gray-600">Total Deposits (before period)</span>
                                            <span className="text-green-600">{formatCurrency(reconciliationData.deposits_before)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 border-b">
                                            <span className="text-gray-600">Total Expenses (before period)</span>
                                            <span className="text-red-600">({formatCurrency(reconciliationData.expenses_before)})</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span className="font-semibold">Movement in Period</span>
                                    </div>
                                    <div className="pl-4 space-y-2">
                                        <div className="flex justify-between items-center p-3 border-b">
                                            <span className="text-gray-600">Deposits in Period</span>
                                            <span className="text-green-600">{formatCurrency(reconciliationData.deposits_period)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 border-b">
                                            <span className="text-gray-600">Expenses in Period</span>
                                            <span className="text-red-600">({formatCurrency(reconciliationData.expenses_period)})</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                                        <span className="font-semibold text-xl">Closing Balance</span>
                                        <span className="font-bold text-xl">{formatCurrency(reconciliationData.closing_balance)}</span>
                                    </div>
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