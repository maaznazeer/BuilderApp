import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Calendar, User, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const AddConstructionProcessDialog = ({ isOpen, onClose, onSave, projects = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        project_id: '',
        template_id: '',
        estimated_duration: '',
        priority: 'Medium',
        status: 'Planning'
    });
    const [phases, setPhases] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen]);

    const fetchTemplates = async () => {
        try {
            const { data, error } = await supabase
                .from('construction_workflow')
                .select('*')
                .is('template_id', null)
                .order('step_name');
            
            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error fetching templates', description: error.message });
        }
    };

    const addPhase = () => {
        const newPhase = {
            id: Date.now(),
            name: '',
            description: '',
            order: phases.length + 1,
            estimated_duration: '',
            deliverables: '',
            responsible_role: '',
            status: 'Not Started'
        };
        setPhases([...phases, newPhase]);
    };

    const updatePhase = (phaseId, field, value) => {
        setPhases(phases.map(phase => 
            phase.id === phaseId ? { ...phase, [field]: value } : phase
        ));
    };

    const removePhase = (phaseId) => {
        setPhases(phases.filter(phase => phase.id !== phaseId));
    };

    const handleTemplateSelect = (templateId) => {
        if (templateId && templateId !== 'none') {
            const template = templates.find(t => t.id === templateId);
            if (template) {
                setFormData(prev => ({
                    ...prev,
                    template_id: templateId,
                    name: template.step_name,
                    description: template.description
                }));
                // Load template phases if available
                if (template.phases) {
                    setPhases(template.phases);
                }
            }
        } else {
            setFormData(prev => ({ ...prev, template_id: '' }));
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Process name is required' });
            return;
        }

        if (!formData.project_id) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a project' });
            return;
        }

        setLoading(true);
        try {
            const processData = {
                name: formData.name,
                description: formData.description,
                project_id: formData.project_id,
                estimated_duration: formData.estimated_duration,
                priority: formData.priority,
                status: formData.status,
                phases: phases.map(phase => ({
                    name: phase.name,
                    description: phase.description,
                    order: phase.order,
                    estimated_duration: phase.estimated_duration,
                    deliverables: phase.deliverables,
                    responsible_role: phase.responsible_role,
                    status: phase.status
                }))
            };

            await onSave(processData);
            handleClose();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error saving process', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            project_id: '',
            template_id: '',
            estimated_duration: '',
            priority: 'Medium',
            status: 'Planning'
        });
        setPhases([]);
        onClose();
    };

    const getStatusColor = (status) => {
        const colors = {
            'Not Started': 'bg-gray-100 text-gray-800',
            'In Progress': 'bg-blue-100 text-blue-800',
            'Completed': 'bg-green-100 text-green-800',
            'On Hold': 'bg-yellow-100 text-yellow-800',
            'Cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Create Construction Process</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Process Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter process name"
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
                                    placeholder="Enter process description"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="template">Template (Optional)</Label>
                                    <Select value={formData.template_id || 'none'} onValueChange={handleTemplateSelect}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Template</SelectItem>
                                            {templates.map(template => (
                                                <SelectItem key={template.id} value={template.id}>{template.step_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Estimated Duration</Label>
                                    <Input
                                        id="duration"
                                        value={formData.estimated_duration}
                                        onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                                        placeholder="e.g., 30 days"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Phases */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Process Phases
                                </CardTitle>
                                <Button onClick={addPhase} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Phase
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <AnimatePresence>
                                {phases.map((phase, index) => (
                                    <motion.div
                                        key={phase.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="border rounded-lg p-4 mb-4 bg-gray-50"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="h-4 w-4 text-gray-400" />
                                                <Badge variant="outline">Phase {index + 1}</Badge>
                                                <Badge className={getStatusColor(phase.status)}>
                                                    {phase.status}
                                                </Badge>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removePhase(phase.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Phase Name *</Label>
                                                <Input
                                                    value={phase.name}
                                                    onChange={(e) => updatePhase(phase.id, 'name', e.target.value)}
                                                    placeholder="Enter phase name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Responsible Role</Label>
                                                <Select value={phase.responsible_role} onValueChange={(value) => updatePhase(phase.id, 'responsible_role', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Project Manager">Project Manager</SelectItem>
                                                        <SelectItem value="Site Engineer">Site Engineer</SelectItem>
                                                        <SelectItem value="Foreman">Foreman</SelectItem>
                                                        <SelectItem value="Quality Inspector">Quality Inspector</SelectItem>
                                                        <SelectItem value="Safety Officer">Safety Officer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mt-4">
                                            <Label>Description</Label>
                                            <Textarea
                                                value={phase.description}
                                                onChange={(e) => updatePhase(phase.id, 'description', e.target.value)}
                                                placeholder="Enter phase description"
                                                rows={2}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div className="space-y-2">
                                                <Label>Estimated Duration</Label>
                                                <Input
                                                    value={phase.estimated_duration}
                                                    onChange={(e) => updatePhase(phase.id, 'estimated_duration', e.target.value)}
                                                    placeholder="e.g., 5 days"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Deliverables</Label>
                                                <Input
                                                    value={phase.deliverables}
                                                    onChange={(e) => updatePhase(phase.id, 'deliverables', e.target.value)}
                                                    placeholder="Enter deliverables"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {phases.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No phases added yet. Click "Add Phase" to get started.</p>
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
                        {loading ? 'Creating...' : 'Create Process'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddConstructionProcessDialog;
