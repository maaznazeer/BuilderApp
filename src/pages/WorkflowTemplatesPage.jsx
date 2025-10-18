import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, MoreHorizontal, FileText, Calendar, Users, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AddWorkflowTemplateDialog from '@/components/construction-management/AddWorkflowTemplateDialog';

const WorkflowTemplatesPage = () => {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('construction_workflow')
                .select('*')
                .is('template_id', null)
                .order('id', { ascending: false });
            
            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            toast({ title: 'Error fetching templates', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleAddTemplate = async (templateData) => {
        try {
            const { data, error } = await supabase
                .from('construction_workflow')
                .insert([{
                    step_name: templateData.name,
                    phase: templateData.category,
                    phase_order: 1,
                    step_order: 1,
                    status: 'Template',
                    estimated_duration: templateData.estimated_duration,
                    template_id: null
                }])
                .select()
                .single();

            if (error) throw error;
            
            setTemplates(prev => [data, ...prev]);
            toast({ title: 'Template created successfully!' });
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const handleEditTemplate = async (templateData) => {
        try {
            const { data, error } = await supabase
                .from('workflow_templates')
                .update({
                    name: templateData.name,
                    description: templateData.description,
                    category: templateData.category,
                    phases: templateData.phases,
                    estimated_duration: templateData.estimated_duration
                })
                .eq('id', editingTemplate.id)
                .select()
                .single();

            if (error) throw error;
            
            setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? data : t));
            setEditingTemplate(null);
            toast({ title: 'Template updated successfully!' });
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            try {
                const { error } = await supabase
                    .from('workflow_templates')
                    .delete()
                    .eq('id', templateId);

                if (error) throw error;
                
                setTemplates(prev => prev.filter(t => t.id !== templateId));
                toast({ title: 'Template deleted successfully!' });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error deleting template', description: error.message });
            }
        }
    };

    const handleDuplicateTemplate = async (template) => {
        try {
            const { data, error } = await supabase
                .from('workflow_templates')
                .insert([{
                    name: `${template.name} (Copy)`,
                    description: template.description,
                    category: template.category,
                    phases: template.phases,
                    estimated_duration: template.estimated_duration,
                    created_by: user.id
                }])
                .select()
                .single();

            if (error) throw error;
            
            setTemplates(prev => [data, ...prev]);
            toast({ title: 'Template duplicated successfully!' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error duplicating template', description: error.message });
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Residential': 'bg-blue-100 text-blue-800',
            'Commercial': 'bg-green-100 text-green-800',
            'Industrial': 'bg-purple-100 text-purple-800',
            'Infrastructure': 'bg-orange-100 text-orange-800',
            'Renovation': 'bg-pink-100 text-pink-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Helmet>
                <html lang={i18n.language} />
                <title>Workflow Templates - DomusBuilder Hub</title>
                <meta name="description" content="Manage workflow templates for construction processes." />
            </Helmet>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-3xl font-bold">Workflow Templates</CardTitle>
                                <p className="text-gray-500 mt-1">Create and manage reusable workflow templates for your construction processes</p>
                            </div>
                            <Button onClick={() => setIsAddTemplateOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Template
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-blue-600"></div>
                                <span className="ml-2 text-gray-600">Loading templates...</span>
                            </div>
                        ) : templates.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {templates.map((template) => (
                                    <Card key={template.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-xl mb-2">{template.step_name}</h3>
                                                    <Badge className={getCategoryColor(template.phase)}>
                                                        {template.phase}
                                                    </Badge>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setEditingTemplate(template)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-red-600"
                                                            onClick={() => handleDeleteTemplate(template.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            
                                            {template.description && (
                                                <p className="text-gray-600 mb-4 line-clamp-3">{template.description}</p>
                                            )}
                                            
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{template.estimated_duration}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <FileText className="h-4 w-4" />
                                                    <span>{template.phases?.length || 0} phases</span>
                                                </div>
                                                
                                                {template.phases && template.phases.length > 0 && (
                                                    <div className="mt-3">
                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Phases:</h4>
                                                        <div className="space-y-1">
                                                            {template.phases.slice(0, 3).map((phase, index) => (
                                                                <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                    <span>{phase.name}</span>
                                                                </div>
                                                            ))}
                                                            {template.phases.length > 3 && (
                                                                <div className="text-xs text-gray-500">
                                                                    +{template.phases.length - 3} more phases
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FileText className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-medium text-gray-800 mb-2">No Workflow Templates</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    Create your first workflow template to standardize construction processes across projects.
                                </p>
                                <Button onClick={() => setIsAddTemplateOpen(true)} size="lg">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Create First Template
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add/Edit Template Dialog */}
                <AddWorkflowTemplateDialog
                    isOpen={isAddTemplateOpen || !!editingTemplate}
                    onClose={() => {
                        setIsAddTemplateOpen(false);
                        setEditingTemplate(null);
                    }}
                    onSave={editingTemplate ? handleEditTemplate : handleAddTemplate}
                    template={editingTemplate}
                />
            </motion.div>
        </>
    );
};

export default WorkflowTemplatesPage;