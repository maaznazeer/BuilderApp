import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, MoreHorizontal, Bot, Play, Pause, Settings, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AddAutomationDialog from '@/components/construction-management/AddAutomationDialog';

const AutomationsPage = () => {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuth();
    const [automations, setAutomations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddAutomationOpen, setIsAddAutomationOpen] = useState(false);
    const [editingAutomation, setEditingAutomation] = useState(null);

    const fetchAutomations = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('construction_workflow')
                .select('*')
                .not('automation_trigger', 'is', null)
                .order('id', { ascending: false });
            
            if (error) throw error;
            setAutomations(data || []);
        } catch (error) {
            toast({ title: 'Error fetching automations', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchAutomations();
    }, [fetchAutomations]);

    const handleAddAutomation = async (automationData) => {
        try {
            const { data, error } = await supabase
                .from('automations')
                .insert([{
                    name: automationData.name,
                    description: automationData.description,
                    trigger_type: automationData.trigger_type,
                    trigger_conditions: automationData.trigger_conditions,
                    actions: automationData.actions,
                    is_active: automationData.is_active,
                    project_id: automationData.project_id,
                    created_by: user.id
                }])
                .select()
                .single();

            if (error) throw error;
            
            setAutomations(prev => [data, ...prev]);
            toast({ title: 'Automation created successfully!' });
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const handleEditAutomation = async (automationData) => {
        try {
            const { data, error } = await supabase
                .from('automations')
                .update({
                    name: automationData.name,
                    description: automationData.description,
                    trigger_type: automationData.trigger_type,
                    trigger_conditions: automationData.trigger_conditions,
                    actions: automationData.actions,
                    is_active: automationData.is_active,
                    project_id: automationData.project_id
                })
                .eq('id', editingAutomation.id)
                .select()
                .single();

            if (error) throw error;
            
            setAutomations(prev => prev.map(a => a.id === editingAutomation.id ? data : a));
            setEditingAutomation(null);
            toast({ title: 'Automation updated successfully!' });
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const handleDeleteAutomation = async (automationId) => {
        if (window.confirm('Are you sure you want to delete this automation?')) {
            try {
                const { error } = await supabase
                    .from('automations')
                    .delete()
                    .eq('id', automationId);

                if (error) throw error;
                
                setAutomations(prev => prev.filter(a => a.id !== automationId));
                toast({ title: 'Automation deleted successfully!' });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error deleting automation', description: error.message });
            }
        }
    };

    const handleToggleAutomation = async (automationId, isActive) => {
        try {
            const { error } = await supabase
                .from('automations')
                .update({ is_active: isActive })
                .eq('id', automationId);

            if (error) throw error;
            
            setAutomations(prev => prev.map(a => 
                a.id === automationId ? { ...a, is_active: isActive } : a
            ));
            toast({ title: `Automation ${isActive ? 'enabled' : 'disabled'} successfully!` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error updating automation', description: error.message });
        }
    };

    const getTriggerIcon = (triggerType) => {
        const icons = {
            'Time-based': Clock,
            'Event-based': Zap,
            'Condition-based': Settings
        };
        return icons[triggerType] || Bot;
    };

    const getTriggerColor = (triggerType) => {
        const colors = {
            'Time-based': 'bg-blue-100 text-blue-800',
            'Event-based': 'bg-green-100 text-green-800',
            'Condition-based': 'bg-purple-100 text-purple-800'
        };
        return colors[triggerType] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Helmet>
                <html lang={i18n.language} />
                <title>Automations - DomusBuilder Hub</title>
                <meta name="description" content="Manage automated workflows for construction processes." />
            </Helmet>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-3xl font-bold">Automations</CardTitle>
                                <p className="text-gray-500 mt-1">Create automated workflows to streamline your construction processes</p>
                            </div>
                            <Button onClick={() => setIsAddAutomationOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Automation
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-blue-600"></div>
                                <span className="ml-2 text-gray-600">Loading automations...</span>
                            </div>
                        ) : automations.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {automations.map((automation) => {
                                    const TriggerIcon = getTriggerIcon(automation.trigger_type);
                                    return (
                                        <Card key={automation.id} className="hover:shadow-lg transition-all duration-200">
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <TriggerIcon className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-lg">{automation.step_name}</h3>
                                                            <p className="text-sm text-gray-600">Automation</p>
                                                        </div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => setEditingAutomation(automation)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                className="text-red-600"
                                                                onClick={() => handleDeleteAutomation(automation.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                                
                                                {automation.description && (
                                                    <p className="text-gray-600 mb-4 line-clamp-2">{automation.description}</p>
                                                )}
                                                
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Badge className={getTriggerColor(automation.trigger_type)}>
                                                            {automation.trigger_type}
                                                        </Badge>
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={automation.is_active}
                                                                onCheckedChange={(checked) => handleToggleAutomation(automation.id, checked)}
                                                            />
                                                            <span className="text-sm text-gray-500">
                                                                {automation.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-sm text-gray-500">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4" />
                                                            <span>Last run: {automation.last_run ? new Date(automation.last_run).toLocaleDateString() : 'Never'}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {automation.trigger_conditions && (
                                                        <div className="mt-3">
                                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Trigger Conditions:</h4>
                                                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                                                {JSON.stringify(automation.trigger_conditions, null, 2)}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {automation.actions && (
                                                        <div className="mt-3">
                                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Actions:</h4>
                                                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                                                {JSON.stringify(automation.actions, null, 2)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Bot className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-medium text-gray-800 mb-2">No Automations</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    Create your first automation to streamline repetitive construction processes.
                                </p>
                                <Button onClick={() => setIsAddAutomationOpen(true)} size="lg">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Create First Automation
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add/Edit Automation Dialog */}
                <AddAutomationDialog
                    isOpen={isAddAutomationOpen || !!editingAutomation}
                    onClose={() => {
                        setIsAddAutomationOpen(false);
                        setEditingAutomation(null);
                    }}
                    onSave={editingAutomation ? handleEditAutomation : handleAddAutomation}
                    automation={editingAutomation}
                />
            </motion.div>
        </>
    );
};

export default AutomationsPage;