import React, { useState, useEffect } from 'react';
        import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
        import { Button } from "@/components/ui/button";
        import { Input } from "@/components/ui/input";
        import { Label } from "@/components/ui/label";
        import { Textarea } from "@/components/ui/textarea";
        import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
        import { Calendar } from "@/components/ui/calendar";
        import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
        import { CalendarPlus as CalendarIcon, Users, Package, DollarSign } from 'lucide-react';
        import { format } from 'date-fns';
        import { cn } from '@/lib/utils';
        import { supabase } from '@/lib/customSupabaseClient';
        import TaskResourceSelector from './TaskResourceSelector';
        import TaskMaterialSelector from './TaskMaterialSelector';

const AddTaskDialog = ({ isOpen, onClose, onSave, project }) => {
    const [taskName, setTaskName] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [notes, setNotes] = useState('');
    const [isMilestone, setIsMilestone] = useState(false);
    const [estimatedLaborCost, setEstimatedLaborCost] = useState(0);
    const [estimatedMaterialCost, setEstimatedMaterialCost] = useState(0);
    const [selectedResources, setSelectedResources] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        if (!isOpen) {
            setTaskName('');
            setStartDate(null);
            setEndDate(null);
            setNotes('');
            setIsMilestone(false);
            setEstimatedLaborCost(0);
            setEstimatedMaterialCost(0);
            setSelectedResources([]);
            setSelectedMaterials([]);
            setActiveTab('basic');
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!taskName || !startDate || !endDate) {
            alert("Please fill all required fields.");
            return;
        }

        try {
            // Create the task first
            const taskData = {
                task_name: taskName,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                notes,
                is_milestone: isMilestone,
                status: 'Not Started',
                percent_complete: 0,
                estimated_labor_cost: estimatedLaborCost,
                estimated_material_cost: estimatedMaterialCost,
                project_code: project?.id || project?.code
            };

            const { data: newTask, error: taskError } = await supabase
                .from('pm_tasks')
                .insert([taskData])
                .select()
                .single();

            if (taskError) throw taskError;

            // Create task assignments for resources
            if (selectedResources.length > 0) {
                const assignments = selectedResources.map(resource => ({
                    task_id: newTask.task_id,
                    resource_id: resource.resource_id,
                    allocation_percent: resource.allocation_percent || 100
                }));

                const { error: assignmentError } = await supabase
                    .from('task_assignments')
                    .insert(assignments);

                if (assignmentError) throw assignmentError;
            }

            // Create task materials
            if (selectedMaterials.length > 0) {
                const materials = selectedMaterials.map(material => ({
                    task_id: newTask.task_id,
                    material_id: material.material_id,
                    quantity_planned: material.quantity_planned,
                    unit: material.unit,
                    notes: material.notes
                }));

                const { error: materialError } = await supabase
                    .from('task_materials')
                    .insert(materials);

                if (materialError) throw materialError;
            }

            onSave(newTask);
        } catch (error) {
            alert(`Error creating task: ${error.message}`);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="resources">Resources</TabsTrigger>
                        <TabsTrigger value="materials">Materials</TabsTrigger>
                        <TabsTrigger value="costs">Costs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="taskName">Task Name *</Label>
                            <Input 
                                id="taskName" 
                                value={taskName} 
                                onChange={(e) => setTaskName(e.target.value)} 
                                placeholder="Enter task name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label>End Date *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea 
                                id="notes" 
                                value={notes} 
                                onChange={(e) => setNotes(e.target.value)} 
                                placeholder="Enter task notes or description"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="isMilestone" 
                                checked={isMilestone} 
                                onChange={(e) => setIsMilestone(e.target.checked)} 
                            />
                            <Label htmlFor="isMilestone">Mark as Milestone</Label>
                        </div>
                    </TabsContent>

                    <TabsContent value="resources" className="py-4">
                        <TaskResourceSelector
                            taskId={null}
                            onResourcesChange={setSelectedResources}
                            initialResources={selectedResources}
                        />
                    </TabsContent>

                    <TabsContent value="materials" className="py-4">
                        <TaskMaterialSelector
                            taskId={null}
                            onMaterialsChange={setSelectedMaterials}
                            initialMaterials={selectedMaterials}
                        />
                    </TabsContent>

                    <TabsContent value="costs" className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="estimatedLaborCost">Estimated Labor Cost</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="estimatedLaborCost"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={estimatedLaborCost}
                                        onChange={(e) => setEstimatedLaborCost(parseFloat(e.target.value) || 0)}
                                        className="pl-10"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estimatedMaterialCost">Estimated Material Cost</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="estimatedMaterialCost"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={estimatedMaterialCost}
                                        onChange={(e) => setEstimatedMaterialCost(parseFloat(e.target.value) || 0)}
                                        className="pl-10"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-md">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Total Estimated Cost:</span>
                                <span className="text-lg font-bold">
                                    ${(estimatedLaborCost + estimatedMaterialCost).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!taskName || !startDate || !endDate}>
                        Save Task
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddTaskDialog;