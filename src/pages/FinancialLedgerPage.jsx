import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { FinancialLedgerTable } from '@/components/financial-ledger/FinancialLedgerTable';
import { AddLedgerEntryDialog } from '@/components/financial-ledger/AddLedgerEntryDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ProjectFilter from '@/components/ui/ProjectFilter';
import { useProjectFilter } from '@/hooks/useProjectFilter';

const FinancialLedgerPage = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { toast } = useToast();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    
    const {
        projects,
        selectedProject,
        filteredData: filteredEntries,
        handleProjectFilter,
        clearFilter,
        isFiltered
    } = useProjectFilter(entries, 'project_code');

    const fetchLedgerEntries = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        
        try {
            const { data, error } = await supabase
                .from('financial_ledger')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (error) throw error;
            
            setEntries(data || []);
        } catch (err) {
            setError(err.message);
            toast({
                variant: 'destructive',
                title: 'Error fetching ledger data',
                description: err.message,
            });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchLedgerEntries();
    }, [fetchLedgerEntries]);
    
    const handleEntryAdded = () => {
        fetchLedgerEntries();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };
    
    return (
        <>
            <Helmet>
                <html lang={i18n.language} />
                <title>{t('Financial Ledger')} - DomusBuilder Hub</title>
                <meta name="description" content={t('Track all financial transactions for your projects.')} />
            </Helmet>
            <div className="p-4 sm:p-6 lg:p-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    <motion.div variants={itemVariants}>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Financial Ledger</h1>
                        <p className="mt-2 text-lg text-gray-600">
                            A comprehensive record of all your project-related financial transactions.
                        </p>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>All Transactions</CardTitle>
                                        <CardDescription>View, add, and manage all deposits and expenses.</CardDescription>
                                    </div>
                                    <ProjectFilter
                                        projects={projects}
                                        selectedProject={selectedProject}
                                        onProjectChange={handleProjectFilter}
                                        onClearFilter={clearFilter}
                                        filteredCount={filteredEntries.length}
                                        totalCount={entries.length}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ) : error ? (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                ) : (
                                    <FinancialLedgerTable entries={filteredEntries} onAddEntry={() => setIsAddDialogOpen(true)} />
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
                <AddLedgerEntryDialog 
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                    onEntryAdded={handleEntryAdded}
                />
            </div>
        </>
    );
};

export default FinancialLedgerPage;