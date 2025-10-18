import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Calendar, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AddWorkflowTemplateDialog = ({ isOpen, onClose, onSave, template = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Residential',
        estimated_duration: ''
    });
    const [phases, setPhases] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (template) {
                setFormData({
                    name: template.name,
                    description: template.description,
                    category: template.category,
                    estimated_duration: template.estimated_duration
                });
                setPhases(template.phases || []);
            } else {
                setFormData({
                    name: '',
                    description: '',
                    category: 'Residential',
                    estimated_duration: ''
                });
                setPhases([]);
            }
        }
    }, [isOpen, template]);

    const addPhase = () => {
        const newPhase = {
            id: Date.now(),
            name: '',
            description: '',
            order: phases.length + 1,
            estimated_duration: '',
            deliverables: '',
            responsible_role: '',
            dependencies: []
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

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Template name is required' });
            return;
        }

        if (phases.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'At least one phase is required' });
            return;
        }

        setLoading(true);
        try {
            const templateData = {
                name: formData.name,
                description: formData.description,
                category: formData.category,
                estimated_duration: formData.estimated_duration,
                phases: phases.map(phase => ({
                    name: phase.name,
                    description: phase.description,
                    order: phase.order,
                    estimated_duration: phase.estimated_duration,
                    deliverables: phase.deliverables,
                    responsible_role: phase.responsible_role,
                    dependencies: phase.dependencies
                }))
            };

            await onSave(templateData);
            handleClose();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error saving template', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            category: 'Residential',
            estimated_duration: ''
        });
        setPhases([]);
        onClose();
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
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {template ? 'Edit Workflow Template' : 'Create Workflow Template'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Template Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Template Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter template name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Residential">Residential</SelectItem>
                                            <SelectItem value="Commercial">Commercial</SelectItem>
                                            <SelectItem value="Industrial">Industrial</SelectItem>
                                            <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                            <SelectItem value="Renovation">Renovation</SelectItem>
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
                                    placeholder="Enter template description"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration">Estimated Duration</Label>
                                <Input
                                    id="duration"
                                    value={formData.estimated_duration}
                                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                                    placeholder="e.g., 90 days"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Phases */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Template Phases
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
                                                        <SelectItem value="Architect">Architect</SelectItem>
                                                        <SelectItem value="Structural Engineer">Structural Engineer</SelectItem>
                                                        <SelectItem value="MEP Engineer">MEP Engineer</SelectItem>
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
                        {loading ? 'Saving...' : (template ? 'Update Template' : 'Create Template')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddWorkflowTemplateDialog;
