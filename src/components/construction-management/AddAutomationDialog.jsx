import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Bot, Clock, Zap, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const AddAutomationDialog = ({ isOpen, onClose, onSave, automation = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        trigger_type: 'Event-based',
        is_active: true,
        project_id: ''
    });
    const [triggerConditions, setTriggerConditions] = useState([]);
    const [actions, setActions] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            fetchProjects();
            if (automation) {
                setFormData({
                    name: automation.name,
                    description: automation.description,
                    trigger_type: automation.trigger_type,
                    is_active: automation.is_active,
                    project_id: automation.project_id
                });
                setTriggerConditions(automation.trigger_conditions || []);
                setActions(automation.actions || []);
            } else {
                setFormData({
                    name: '',
                    description: '',
                    trigger_type: 'Event-based',
                    is_active: true,
                    project_id: ''
                });
                setTriggerConditions([]);
                setActions([]);
            }
        }
    }, [isOpen, automation]);

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('id, name')
                .order('name');
            
            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error fetching projects', description: error.message });
        }
    };

    const addTriggerCondition = () => {
        const newCondition = {
            id: Date.now(),
            field: '',
            operator: 'equals',
            value: ''
        };
        setTriggerConditions([...triggerConditions, newCondition]);
    };

    const updateTriggerCondition = (conditionId, field, value) => {
        setTriggerConditions(triggerConditions.map(condition => 
            condition.id === conditionId ? { ...condition, [field]: value } : condition
        ));
    };

    const removeTriggerCondition = (conditionId) => {
        setTriggerConditions(triggerConditions.filter(condition => condition.id !== conditionId));
    };

    const addAction = () => {
        const newAction = {
            id: Date.now(),
            type: 'notification',
            target: '',
            message: ''
        };
        setActions([...actions, newAction]);
    };

    const updateAction = (actionId, field, value) => {
        setActions(actions.map(action => 
            action.id === actionId ? { ...action, [field]: value } : action
        ));
    };

    const removeAction = (actionId) => {
        setActions(actions.filter(action => action.id !== actionId));
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Automation name is required' });
            return;
        }

        if (!formData.project_id) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a project' });
            return;
        }

        if (triggerConditions.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'At least one trigger condition is required' });
            return;
        }

        if (actions.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'At least one action is required' });
            return;
        }

        setLoading(true);
        try {
            const automationData = {
                name: formData.name,
                description: formData.description,
                trigger_type: formData.trigger_type,
                trigger_conditions: triggerConditions.map(condition => ({
                    field: condition.field,
                    operator: condition.operator,
                    value: condition.value
                })),
                actions: actions.map(action => ({
                    type: action.type,
                    target: action.target,
                    message: action.message
                })),
                is_active: formData.is_active,
                project_id: formData.project_id
            };

            await onSave(automationData);
            handleClose();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error saving automation', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            trigger_type: 'Event-based',
            is_active: true,
            project_id: ''
        });
        setTriggerConditions([]);
        setActions([]);
        onClose();
    };

    const getTriggerIcon = (triggerType) => {
        const icons = {
            'Time-based': Clock,
            'Event-based': Zap,
            'Condition-based': Settings
        };
        return icons[triggerType] || Bot;
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {automation ? 'Edit Automation' : 'Create Automation'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="h-5 w-5" />
                                Automation Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Automation Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter automation name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="project">Project *</Label>
                                    <Select value={formData.project_id} onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects.map(project => (
                                                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter automation description"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="trigger">Trigger Type *</Label>
                                    <Select value={formData.trigger_type} onValueChange={(value) => setFormData(prev => ({ ...prev, trigger_type: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Event-based">Event-based</SelectItem>
                                            <SelectItem value="Time-based">Time-based</SelectItem>
                                            <SelectItem value="Condition-based">Condition-based</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                    />
                                    <Label>Active</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trigger Conditions */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    {React.createElement(getTriggerIcon(formData.trigger_type), { className: "h-5 w-5" })}
                                    Trigger Conditions
                                </CardTitle>
                                <Button onClick={addTriggerCondition} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Condition
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <AnimatePresence>
                                {triggerConditions.map((condition, index) => (
                                    <motion.div
                                        key={condition.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="border rounded-lg p-4 mb-4 bg-gray-50"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <Badge variant="outline">Condition {index + 1}</Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeTriggerCondition(condition.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Field</Label>
                                                <Input
                                                    value={condition.field}
                                                    onChange={(e) => updateTriggerCondition(condition.id, 'field', e.target.value)}
                                                    placeholder="e.g., status, priority"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Operator</Label>
                                                <Select value={condition.operator} onValueChange={(value) => updateTriggerCondition(condition.id, 'operator', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="equals">Equals</SelectItem>
                                                        <SelectItem value="not_equals">Not Equals</SelectItem>
                                                        <SelectItem value="contains">Contains</SelectItem>
                                                        <SelectItem value="greater_than">Greater Than</SelectItem>
                                                        <SelectItem value="less_than">Less Than</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Value</Label>
                                                <Input
                                                    value={condition.value}
                                                    onChange={(e) => updateTriggerCondition(condition.id, 'value', e.target.value)}
                                                    placeholder="Enter value"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {triggerConditions.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No trigger conditions added yet. Click "Add Condition" to get started.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5" />
                                    Actions
                                </CardTitle>
                                <Button onClick={addAction} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Action
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <AnimatePresence>
                                {actions.map((action, index) => (
                                    <motion.div
                                        key={action.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="border rounded-lg p-4 mb-4 bg-gray-50"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <Badge variant="outline">Action {index + 1}</Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeAction(action.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Action Type</Label>
                                                <Select value={action.type} onValueChange={(value) => updateAction(action.id, 'type', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="notification">Send Notification</SelectItem>
                                                        <SelectItem value="email">Send Email</SelectItem>
                                                        <SelectItem value="update_status">Update Status</SelectItem>
                                                        <SelectItem value="create_task">Create Task</SelectItem>
                                                        <SelectItem value="webhook">Webhook</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Target</Label>
                                                <Input
                                                    value={action.target}
                                                    onChange={(e) => updateAction(action.id, 'target', e.target.value)}
                                                    placeholder="e.g., email, user, webhook URL"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 mt-4">
                                            <Label>Message/Details</Label>
                                            <Textarea
                                                value={action.message}
                                                onChange={(e) => updateAction(action.id, 'message', e.target.value)}
                                                placeholder="Enter action details"
                                                rows={2}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {actions.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No actions added yet. Click "Add Action" to get started.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : (automation ? 'Update Automation' : 'Create Automation')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddAutomationDialog;
