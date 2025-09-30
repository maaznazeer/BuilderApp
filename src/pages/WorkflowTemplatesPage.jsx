import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-96">
    <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
  </div>
);

const TemplateForm = ({ onSave, onCancel, template }) => {
    const [templateName, setTemplateName] = useState(template?.template_name || '');
    const { toast } = useToast();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!templateName.trim()) {
            toast({ variant: 'destructive', title: 'Template name is required' });
            return;
        }
        onSave({ id: template?.id, template_name: templateName });
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>{template ? 'Edit' : 'Create'} Workflow Template</DialogTitle>
                <DialogDescription>
                    {template ? 'Rename your workflow template.' : 'Give your new workflow template a name.'}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="template_name">Template Name</Label>
                <Input id="template_name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g., Residential Home Build" />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Template</Button>
            </DialogFooter>
        </form>
    );
};

const WorkflowTemplatesPage = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('workflow_templates');
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    const fetchTemplates = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('workflow_templates')
            .select('*')
            .order('template_name');

        if (error) {
            toast({ title: "Error fetching templates", description: error.message, variant: "destructive" });
        } else {
            setTemplates(data);
        }
        setLoading(false);
    }, [toast, user]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleSaveTemplate = async (formData) => {
        const { id, ...updateData } = formData;

        const dataToUpsert = {
            ...updateData,
            user_id: user.id
        };
        
        const query = id
            ? supabase.from('workflow_templates').update(dataToUpsert).eq('id', id)
            : supabase.from('workflow_templates').insert(dataToUpsert);

        const { data, error } = await query.select();

        if (error) {
            toast({ title: "Error saving template", description: error.message, variant: "destructive" });
        } else {
            toast({ title: `Template ${id ? 'updated' : 'created'} successfully!` });
            setIsFormOpen(false);
            setEditingTemplate(null);
            fetchTemplates();
        }
    };
    
    const handleDeleteTemplate = async (templateId) => {
        if (!window.confirm("Are you sure you want to delete this template? This will also delete all associated steps.")) return;

        const { error } = await supabase.from('workflow_templates').delete().eq('id', templateId);
        
        if (error) {
            toast({ title: "Error deleting template", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Template deleted successfully!" });
            fetchTemplates();
        }
    };

    return (
        <>
            <Helmet>
                <title>Workflow Templates - DomusBuilder Hub</title>
                <meta name="description" content="Manage and customize construction workflow templates." />
            </Helmet>
            <div className="min-h-screen bg-gray-50 pt-20">
                <DashboardHeader onProjectAdded={fetchTemplates} />
                <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Workflow Templates</h1>
                                <p className="text-gray-500 mt-1">Create and manage reusable workflow templates for different project types.</p>
                            </div>
                            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => setEditingTemplate(null)}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Template
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <TemplateForm
                                        template={editingTemplate}
                                        onSave={handleSaveTemplate}
                                        onCancel={() => {
                                            setIsFormOpen(false);
                                            setEditingTemplate(null);
                                        }}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>

                        {loading ? <LoadingFallback /> : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {templates.map(template => (
                                    <div key={template.id} className="bg-white rounded-lg shadow-sm border p-6 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800">{template.template_name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                A template for {template.template_name.toLowerCase()} projects.
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-4">
                                            <Button variant="outline" size="sm" onClick={() => { setEditingTemplate(template); setIsFormOpen(true); }}>
                                                <Edit className="h-3 w-3 mr-1.5"/> Rename
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                                                <Trash2 className="h-3 w-3 mr-1.5"/> Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {templates.length === 0 && !loading && (
                                    <div className="text-center py-16 col-span-full">
                                        <h3 className="text-lg font-medium text-gray-800">No templates found.</h3>
                                        <p className="text-gray-500 mt-1">Get started by creating a new workflow template.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default WorkflowTemplatesPage;