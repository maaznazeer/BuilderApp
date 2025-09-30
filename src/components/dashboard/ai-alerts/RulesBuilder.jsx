import React, { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { BellPlus, Bot, Save, Trash2, Loader2, BellOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import RuleRow from './RuleRow';
import AddRulePopover from './AddRulePopover';

const fetchRules = async (projectId) => {
    if (!projectId) return [];
    const { data, error } = await supabase
        .from('ai_alert_rules')
        .select('*')
        .eq('project_id', projectId);
    if (error) throw new Error(error.message);
    return data;
};

const RulesBuilder = () => {
    const { selectedProject } = useProject();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [rules, setRules] = useState([]);

    const { data: initialRules, isLoading: isLoadingRules } = useQuery(
        ['alertRules', selectedProject?.id],
        () => fetchRules(selectedProject?.id),
        {
            enabled: !!selectedProject,
            onSuccess: (data) => setRules(data || []),
        }
    );

    const { mutate: saveRules, isLoading: isSaving } = useMutation(
        async (rulesToSave) => {
            const { data, error } = await supabase.functions.invoke('alert-rules', {
                body: {
                    project_id: selectedProject.id,
                    rules: rulesToSave
                }
            });
            if (error) throw new Error(error.message);
            return data;
        },
        {
            onSuccess: (data) => {
                queryClient.setQueryData(['alertRules', selectedProject.id], data.data);
                setRules(data.data);
                toast({ title: 'Success', description: 'Alert rules saved successfully.' });
            },
            onError: (error) => {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        }
    );

    const handleAddRule = (type) => {
        const newRule = {
            id: `new-${Date.now()}`,
            rule_type: type,
            parameters: {},
            is_active: true,
            notify_email: false,
            notify_whatsapp: false,
            project_id: selectedProject.id
        };
        setRules(prev => [...prev, newRule]);
    };

    const handleUpdateRule = (ruleId, updatedFields) => {
        setRules(prevRules =>
            prevRules.map(rule =>
                rule.id === ruleId ? { ...rule, ...updatedFields } : rule
            )
        );
    };

    const handleRemoveRule = (ruleId) => {
        setRules(prev => prev.filter(rule => rule.id !== ruleId));
    };

    const handleSave = () => {
        saveRules(rules.map(({ id, ...rest }) => ({ ...(id.toString().startsWith('new-') ? {} : { id }), ...rest })));
    };

    if (!selectedProject) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" />Alert Rules</CardTitle>
                    <CardDescription>Define custom triggers for AI alerts.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <BellOff className="w-10 h-10 mb-2" />
                    <p>Please select a project to manage alert rules.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" />Alert Rules Builder</CardTitle>
                <CardDescription>Define custom triggers for AI alerts on this project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoadingRules ? (
                     <div className="flex items-center justify-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <AnimatePresence>
                        {rules.length > 0 ? (
                            rules.map((rule) => (
                                <motion.div
                                    key={rule.id}
                                    layout
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <RuleRow
                                        rule={rule}
                                        onChange={handleUpdateRule}
                                        onRemove={handleRemoveRule}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-4">No rules defined yet.</div>
                        )}
                    </AnimatePresence>
                )}
                 <AddRulePopover onAddRule={handleAddRule}>
                    <Button variant="outline" className="w-full">
                        <BellPlus className="mr-2 h-4 w-4" /> Add Rule
                    </Button>
                </AddRulePopover>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleSave} disabled={isSaving || isLoadingRules || rules.length === 0} className="w-full">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Rules
                </Button>
            </CardFooter>
        </Card>
    );
};

export default RulesBuilder;