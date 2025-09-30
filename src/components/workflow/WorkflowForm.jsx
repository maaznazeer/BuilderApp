import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogFooter } from '@/components/ui/dialog';
import { useDropzone } from 'react-dropzone';
import { Paperclip, X } from 'lucide-react';

const moduleOptions = [
    'Architecture Planner', 'Budget Tracker', 'Expense Tracker', 
    'Material Inventory', 'Delivery Planner', 'Milestone Timeline',
    'Gantt Planner', 'Remote Monitoring', 'Weekly Logs',
    'Forms & Checklists', 'Documents', 'Reporting'
];

const WorkflowForm = ({ workflowStep, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
        workflowStep || {
            phase_order: 1,
            phase: '',
            step_order: 1,
            step_name: '',
            key_actions_requirements: '',
            required_deliverables: '',
            linked_modules: [],
            auto_reminder: false,
            approval_required: 'None',
        }
    );
    const [files, setFiles] = useState([]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: acceptedFiles => {
            setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
        }
    });

    const removeFile = (fileToRemove) => {
        setFiles(files.filter(file => file !== fileToRemove));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name.includes('order') ? parseInt(value, 10) || 0 : value),
        }));
    };
    
    const handleSelectChange = (name, value) => {
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (value) => {
        setFormData(prev => {
            const currentModules = prev.linked_modules || [];
            const newModules = currentModules.includes(value)
                ? currentModules.filter(m => m !== value)
                : [...currentModules, value];
            return {...prev, linked_modules: newModules};
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, files);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="phase_order">Phase Order</Label>
                    <Input id="phase_order" name="phase_order" type="number" value={formData.phase_order} onChange={handleChange} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phase">Phase Name</Label>
                    <Input id="phase" name="phase" value={formData.phase} onChange={handleChange} required />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="step_order">Step Order</Label>
                    <Input id="step_order" name="step_order" type="number" value={formData.step_order} onChange={handleChange} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="step_name">Step Name</Label>
                    <Input id="step_name" name="step_name" value={formData.step_name} onChange={handleChange} required />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="key_actions_requirements">Key Actions / Requirements</Label>
                <Textarea id="key_actions_requirements" name="key_actions_requirements" value={formData.key_actions_requirements || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="required_deliverables">Required Deliverables</Label>
                <Textarea id="required_deliverables" name="required_deliverables" value={formData.required_deliverables || ''} onChange={handleChange} />
            </div>

            <div className="space-y-2">
                <Label>Upload Deliverables</Label>
                <div {...getRootProps({className: 'flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50'})}>
                    <input {...getInputProps()} />
                    <p className="text-gray-500">Drag 'n' drop files here, or click to select files</p>
                </div>
                {files.length > 0 && (
                    <aside className="mt-2 space-y-2">
                        {files.map(file => (
                            <div key={file.path} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                                <div className="flex items-center space-x-2">
                                    <Paperclip className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm text-gray-800">{file.path} - {(file.size / 1024).toFixed(2)} KB</span>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(file)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </aside>
                )}
            </div>

            <div className="space-y-2">
                <Label>Linked Modules</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select modules to link..." />
                    </SelectTrigger>
                    <SelectContent>
                        {moduleOptions.map(module => (
                            <div key={module} className="flex items-center space-x-2 p-2">
                                <Checkbox 
                                    id={`module-${module}`} 
                                    checked={formData.linked_modules?.includes(module)}
                                    onCheckedChange={() => handleMultiSelectChange(module)}
                                />
                                <Label htmlFor={`module-${module}`} className="font-normal">{module}</Label>
                            </div>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div className="flex items-center space-x-2 pt-6">
                    <Checkbox id="auto_reminder" name="auto_reminder" checked={formData.auto_reminder} onCheckedChange={(checked) => handleSelectChange('auto_reminder', checked)} />
                    <Label htmlFor="auto_reminder" className="font-normal">Enable Auto Reminder</Label>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="approval_required">Approval Required</Label>
                    <Select name="approval_required" value={formData.approval_required} onValueChange={(value) => handleSelectChange('approval_required', value)}>
                        <SelectTrigger id="approval_required">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="None">None</SelectItem>
                            <SelectItem value="Owner">Owner</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Architect">Architect</SelectItem>
                            <SelectItem value="Engineer">Engineer</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Step</Button>
            </DialogFooter>
        </form>
    );
};

export default WorkflowForm;