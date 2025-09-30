import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { PlusCircle, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Accordion } from "@/components/ui/accordion";
import { useOutletContext } from 'react-router-dom';
import WorkflowForm from '@/components/workflow/WorkflowForm';
import WorkflowPhaseView from '@/components/workflow/WorkflowPhaseView';
import { useWorkflow } from '@/hooks/useWorkflow.js';
import Papa from 'papaparse';

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-96">
    <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
  </div>
);

const ConstructionWorkflowPage = () => {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const outletContext = useOutletContext();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStep, setEditingStep] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    
    const { 
        workflow, 
        loading, 
        groupedWorkflow,
        addWorkflowStep,
        updateWorkflowStep,
        deleteWorkflowStep,
        fetchWorkflow
    } = useWorkflow(true); 

    const handleSave = async (formData, files) => {
        let result;
        if (editingStep) {
            result = await updateWorkflowStep(editingStep.id, formData, files);
        } else {
            result = await addWorkflowStep(formData, files);
        }

        if (result) {
            setIsFormOpen(false);
            setEditingStep(null);
        }
    };
    
    const handleEdit = (step) => {
        setEditingStep(step);
        setIsFormOpen(true);
    };

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (file) {
            setIsImporting(true);
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    // Here you would call a batch import function.
                    // For now, we'll just show a toast.
                    console.log("Parsed CSV data:", results.data);
                    toast({
                        title: "Import Successful (Simulated)",
                        description: `${results.data.length} rows were parsed. In a real scenario, this would be a batch database operation.`
                    });
                    await fetchWorkflow();
                    setIsImporting(false);
                },
                error: (error) => {
                    toast({
                        title: "Import Failed",
                        description: error.message,
                        variant: "destructive"
                    });
                    setIsImporting(false);
                }
            });
        }
    };

    return (
        <>
            <Helmet>
                <html lang={i18n.language} />
                <title>Construction Workflow Settings - DomusBuilder Hub</title>
                <meta name="description" content="Manage and customize the construction workflow templates." />
            </Helmet>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Default Workflow Template</h1>
                        <p className="text-gray-500 mt-1">Define and manage the standard workflow for all new projects.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" asChild>
                           <label htmlFor="csv-import">
                                <Upload className="mr-2 h-4 w-4" /> Import from CSV
                                <input type="file" id="csv-import" accept=".csv" className="hidden" onChange={handleFileImport} disabled={isImporting} />
                           </label>
                        </Button>
                        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setEditingStep(null)}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Workflow Step
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[625px]">
                                <DialogHeader>
                                    <DialogTitle>{editingStep ? 'Edit' : 'Add'} Workflow Step</DialogTitle>
                                    <DialogDescription>
                                        {editingStep ? 'Update the details for this workflow step.' : 'Create a new step for your construction workflow.'}
                                    </DialogDescription>
                                </DialogHeader>
                                <WorkflowForm
                                    workflowStep={editingStep}
                                    onSave={handleSave}
                                    onCancel={() => {
                                        setIsFormOpen(false);
                                        setEditingStep(null);
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                
                {loading || isImporting ? <LoadingFallback /> : (
                    <Accordion type="multiple" defaultValue={Object.keys(groupedWorkflow)} className="w-full bg-white rounded-lg shadow-sm border">
                        {Object.entries(groupedWorkflow).sort(([a], [b]) => parseInt(a.split('-')[0], 10) - parseInt(b.split('-')[0], 10)).map(([phaseKey, steps]) => (
                            <WorkflowPhaseView
                                key={phaseKey}
                                phaseKey={phaseKey}
                                steps={steps}
                                onEdit={handleEdit}
                                onDelete={deleteWorkflowStep}
                            />
                        ))}
                        {workflow.length === 0 && !loading && (
                            <div className="text-center py-16">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-800">No workflow steps found.</h3>
                                <p className="text-gray-500 mt-1">Get started by adding a new workflow step or importing from a CSV file.</p>
                            </div>
                        )}
                    </Accordion>
                )}
            </motion.div>
        </>
    );
};

export default ConstructionWorkflowPage;