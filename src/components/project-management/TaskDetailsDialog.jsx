import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, DollarSign, FileText, CheckCircle, AlertCircle, Play, Pause, Users, Package } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/customSupabaseClient';

const TaskDetailsDialog = ({ isOpen, onClose, task, activeTimer, onToggleTimer, onLogTime, permissions }) => {
    console.log('TaskDetailsDialog rendered with:', { isOpen, task: task?.task_name });
    const [workerDetails, setWorkerDetails] = useState(null);
    const [loadingWorker, setLoadingWorker] = useState(false);
    const [taskResources, setTaskResources] = useState([]);
    const [taskMaterials, setTaskMaterials] = useState([]);
    const [loadingResources, setLoadingResources] = useState(false);
    const [loadingMaterials, setLoadingMaterials] = useState(false);

    useEffect(() => {
        if (task?.assigned_worker_code) {
            fetchWorkerDetails();
        }
    }, [task?.assigned_worker_code]);

    useEffect(() => {
        if (task?.task_id) {
            fetchTaskResources();
            fetchTaskMaterials();
        }
    }, [task?.task_id]);

    const fetchWorkerDetails = async () => {
        if (!task?.assigned_worker_code) return;
        
        setLoadingWorker(true);
        setWorkerDetails(null); // Reset previous data
        try {
            const { data, error } = await supabase
                .from('workers')
                .select('worker_code, first_name, surname, trade, daily_rate')
                .eq('worker_code', task.assigned_worker_code)
                .single();

            if (error) {
                console.error('Error fetching worker details:', error);
                if (error.code === 'PGRST116') {
                    console.log('Worker not found with code:', task.assigned_worker_code);
                }
                throw error;
            }
            setWorkerDetails(data);
        } catch (error) {
            console.error('Error fetching worker details:', error);
            // Keep workerDetails as null to show the error message
        } finally {
            setLoadingWorker(false);
        }
    };

    const fetchTaskResources = async () => {
        if (!task?.task_id) return;
        
        setLoadingResources(true);
        try {
            const { data, error } = await supabase
                .from('task_assignments')
                .select(`
                    *,
                    resources (
                        resource_id,
                        resource_name,
                        type,
                        hourly_rate
                    )
                `)
                .eq('task_id', task.task_id);

            if (error) throw error;
            setTaskResources(data || []);
        } catch (error) {
            console.error('Error fetching task resources:', error);
            setTaskResources([]);
        } finally {
            setLoadingResources(false);
        }
    };

    const fetchTaskMaterials = async () => {
        if (!task?.task_id) return;
        
        setLoadingMaterials(true);
        try {
            console.log('Fetching materials for task:', task.task_id);
            const { data, error } = await supabase
                .from('task_materials')
                .select(`
                    *,
                    materials (
                        id,
                        name,
                        unit_cost,
                        quantity,
                        supplier_id
                    )
                `)
                .eq('task_id', task.task_id);

            if (error) {
                console.error('Supabase error fetching task materials:', error);
                throw error;
            }
            
            console.log('Task materials data:', data);
            setTaskMaterials(data || []);
        } catch (error) {
            console.error('Error fetching task materials:', error);
            setTaskMaterials([]);
        } finally {
            setLoadingMaterials(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Not Started': 'bg-gray-100 text-gray-800',
            'In Progress': 'bg-blue-100 text-blue-800',
            'Completed': 'bg-green-100 text-green-800',
            'Delayed': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle className="w-4 h-4" />;
            case 'Delayed': return <AlertCircle className="w-4 h-4" />;
            case 'In Progress': return <Play className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const isTimerActive = activeTimer?.taskId === task?.task_id;

    if (!task) {
        console.log('TaskDetailsDialog: No task provided, returning null');
        return null;
    }
    
    console.log('TaskDetailsDialog: Rendering dialog with task:', task.task_name, 'isOpen:', isOpen);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {task.is_milestone && <div className="w-2 h-2 bg-amber-500 rounded-full" />}
                        {task.task_name}
                    </DialogTitle>
                </DialogHeader>
                
                {/* Simple test content */}
                <div className="p-4">
                    <h3>Task Details</h3>
                    <p>Task: {task.task_name}</p>
                    <p>Status: {task.status}</p>
                    <p>Progress: {task.percent_complete}%</p>
                    <Button onClick={onClose}>Close</Button>
                </div>
                
                <div className="space-y-6">
                    {/* Task Status and Progress */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <div className={`p-2 rounded-full ${getStatusColor(task.status)}`}>
                                    {getStatusIcon(task.status)}
                                </div>
                                Task Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Status:</span>
                                <Badge className={getStatusColor(task.status)}>
                                    {task.status}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Progress:</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                            style={{ width: `${task.percent_complete}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{task.percent_complete}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Task Timeline */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Start Date:</span>
                                <span className="text-sm">{format(new Date(task.start_date), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">End Date:</span>
                                <span className="text-sm">{format(new Date(task.end_date), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Duration:</span>
                                <span className="text-sm">
                                    {Math.ceil((new Date(task.end_date) - new Date(task.start_date)) / (1000 * 60 * 60 * 24))} days
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assigned Worker */}
                    {task.assigned_worker_code ? (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Assigned Worker
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingWorker ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <span className="text-sm">Loading worker details...</span>
                                    </div>
                                ) : workerDetails ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Name:</span>
                                            <span className="text-sm">{workerDetails.first_name} {workerDetails.surname}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Worker Code:</span>
                                            <span className="text-sm font-mono">{workerDetails.worker_code}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Trade:</span>
                                            <span className="text-sm">{workerDetails.trade}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Daily Rate:</span>
                                            <span className="text-sm font-medium">{formatCurrency(workerDetails.daily_rate)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">
                                            Worker details not found for code: <span className="font-mono">{task.assigned_worker_code}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            This worker may have been deleted or the worker code is invalid.
                                        </div>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={fetchWorkerDetails}
                                            className="text-xs"
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Assigned Worker
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground">
                                    No worker assigned to this task
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Task Costs */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Cost Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Estimated Labor Cost:</span>
                                <span className="text-sm font-medium">{formatCurrency(task.estimated_labor_cost)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Estimated Material Cost:</span>
                                <span className="text-sm font-medium">{formatCurrency(task.estimated_material_cost)}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between font-semibold">
                                <span>Total Estimated Cost:</span>
                                <span className="text-lg">{formatCurrency((task.estimated_labor_cost || 0) + (task.estimated_material_cost || 0))}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Task Resources */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Assigned Resources
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingResources ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-sm">Loading resources...</span>
                                </div>
                            ) : taskResources.length > 0 ? (
                                <div className="space-y-3">
                                    {taskResources.map((assignment, index) => (
                                        <div key={assignment.id || index} className="p-3 border rounded-md">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{assignment.resources?.resource_name}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {assignment.resources?.type}
                                                    </Badge>
                                                </div>
                                                <span className="text-sm font-medium">
                                                    {assignment.allocation_percent}%
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Hourly Rate: {formatCurrency(assignment.resources?.hourly_rate || 0)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    No resources assigned to this task
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Task Materials */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Required Materials
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Debug info */}
                            <div className="text-xs text-gray-500 mb-2">
                                Debug: {taskMaterials.length} materials found
                            </div>
                            
                            {loadingMaterials ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-sm">Loading materials...</span>
                                </div>
                            ) : taskMaterials.length > 0 ? (
                                <div className="space-y-3">
                                    {console.log('Rendering materials:', taskMaterials)}
                                    {taskMaterials.map((material, index) => {
                                        console.log('Material item:', material);
                                        return (
                                            <div key={material.id || index} className="p-3 border rounded-md">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{material.materials?.name || 'Unknown Material'}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {material.unit || 'unit'}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {material.quantity_planned} {material.unit}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Unit Cost: {formatCurrency(material.materials?.unit_cost || 0)} | 
                                                    Total Cost: {formatCurrency((material.quantity_planned || 0) * (material.materials?.unit_cost || 0))}
                                                </div>
                                                {material.notes && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Notes: {material.notes}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    No materials assigned to this task
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Task Notes */}
                    {task.notes && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.notes}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                        {permissions.canLogTime && (
                            <Button 
                                onClick={() => onLogTime(task)} 
                                className="flex-1"
                                variant="outline"
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                Log Time
                            </Button>
                        )}
                        {permissions.canLogTime && (
                            <Button 
                                onClick={() => onToggleTimer(task.task_id)} 
                                className="flex-1"
                                variant={isTimerActive ? "destructive" : "default"}
                            >
                                {isTimerActive ? (
                                    <>
                                        <Pause className="mr-2 h-4 w-4" />
                                        Stop Timer
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Start Timer
                                    </>
                                )}
                            </Button>
                        )}
                        <Button onClick={onClose} variant="outline">
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TaskDetailsDialog;
