import React, { useState, useEffect, useCallback, useMemo } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from "@/components/ui/use-toast";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Button } from '@/components/ui/button';
    import { ChevronLeft, ChevronRight, EyeOff } from 'lucide-react';
    import { addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, format, differenceInDays, isSameDay } from 'date-fns';
    import DraggableTask from './DraggableTask';
    import DroppableCell from './DroppableCell';
    import { Skeleton } from '@/components/ui/skeleton';
    import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
    import { useProjectManagementPermissions } from '@/hooks/useProjectManagementPermissions';
    import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
    
    const getWorkloadColor = (percentage) => {
        if (percentage > 100) return 'bg-red-200 border-red-400';
        if (percentage > 80) return 'bg-amber-200 border-amber-400';
        if (percentage > 0) return 'bg-blue-100 border-blue-300';
        return 'bg-gray-50';
    };
    
    const WorkloadView = ({ projects, selectedProject, setSelectedProject }) => {
        const [resources, setResources] = useState([]);
        const [tasks, setTasks] = useState([]);
        const [assignments, setAssignments] = useState([]);
        const [loading, setLoading] = useState(true);
        const [currentDate, setCurrentDate] = useState(new Date());
    
        const { toast } = useToast();
        const permissions = useProjectManagementPermissions();
        const { profile } = useAuth();
    
        const fetchData = useCallback(async () => {
            if (!selectedProject || !permissions.canEditAssignments) {
                setResources([]); setTasks([]); setAssignments([]); setLoading(false); return;
            }
    
            setLoading(true);
            
            const { data: projectTasks, error: tasksError } = await supabase.from('pm_tasks').select('*').eq('project_code', selectedProject);
            if (tasksError) toast({ variant: 'destructive', title: 'Error fetching tasks' });
            else setTasks(projectTasks || []);
    
            const { data: taskAssignments, error: assignmentsError } = await supabase.from('task_assignments').select(`*, pm_tasks!inner(project_code)`).eq('pm_tasks.project_code', selectedProject);
            if (assignmentsError) toast({ variant: 'destructive', title: 'Error fetching assignments' });
            else setAssignments(taskAssignments || []);
    
            let resourcesQuery = supabase.from('resources').select(`*, resource_calendars (*)`).eq('active', true);
            const { data: projectResources, error: resourcesError } = await resourcesQuery;
            if (resourcesError) toast({ variant: 'destructive', title: 'Error fetching resources' });
            else setResources(projectResources || []);
    
            setLoading(false);
    
        }, [selectedProject, toast, permissions.canEditAssignments]);
    
        useEffect(() => {
            fetchData();
        }, [selectedProject, fetchData]);
    
        const weekInterval = { start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) };
        const weekDays = eachDayOfInterval(weekInterval);
    
        const workloadData = useMemo(() => {
            const data = {};
            resources.forEach(res => {
                data[res.resource_id] = {};
                weekDays.forEach(day => { data[res.resource_id][format(day, 'yyyy-MM-dd')] = { allocatedHours: 0, tasks: [] }; });
            });
    
            assignments.forEach(assign => {
                const task = tasks.find(t => t.task_id === assign.task_id);
                if (!task || task.status === 'Completed' || !task.start_date || !task.end_date) return;
                
                const taskDays = eachDayOfInterval({ start: new Date(task.start_date), end: new Date(task.end_date) });
                const taskDuration = differenceInDays(new Date(task.end_date), new Date(task.start_date)) + 1;
                if (taskDuration <= 0) return;
    
                const dailyHours = ((task.duration_days || taskDuration) * 8) / taskDuration;
    
                taskDays.forEach(day => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    if (data[assign.resource_id]?.[dayStr]) {
                        data[assign.resource_id][dayStr].allocatedHours += dailyHours * (assign.allocation_percent / 100);
                        if (!data[assign.resource_id][dayStr].tasks.find(t => t.task_id === task.task_id)) {
                            data[assign.resource_id][dayStr].tasks.push(task);
                        }
                    }
                });
            });
            return data;
        }, [resources, assignments, tasks, weekDays]);
        
        const handleDrop = async (taskId, resourceId) => {
            if (!permissions.canEditAssignments) {
                toast({ variant: 'destructive', title: 'Permission Denied', description: "You don't have permission to re-assign tasks." });
                return;
            }
    
            const oldAssignment = assignments.find(a => a.task_id === taskId);
            if (oldAssignment && oldAssignment.resource_id === resourceId) return;
    
            if (oldAssignment) {
                const { error } = await supabase.from('task_assignments').update({ resource_id: resourceId }).eq('id', oldAssignment.id);
                if (error) { toast({ variant: "destructive", title: "Failed to re-assign task", description: error.message }); }
                else { toast({ title: "Task re-assigned!" }); fetchData(); }
            } else {
                 const { error } = await supabase.from('task_assignments').insert({ task_id: taskId, resource_id: resourceId, allocation_percent: 100 });
                  if (error) { toast({ variant: "destructive", title: "Failed to assign task", description: error.message }); }
                  else { toast({ title: "Task assigned!" }); fetchData(); }
            }
        };
    
         if (!permissions.canEditAssignments) {
            return (
                <Card className="flex flex-col items-center justify-center text-center p-8 h-96">
                    <EyeOff className="h-12 w-12 text-muted-foreground mb-4" />
                    <CardHeader><CardTitle>Permission Denied</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">You do not have permission to view workload information.</p></CardContent>
                </Card>
            );
        }
    
        return (
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border">
                    <Select value={selectedProject || ''} onValueChange={setSelectedProject} disabled={projects.length === 0}>
                        <SelectTrigger className="w-[200px] bg-white"><SelectValue placeholder="Select a project" /></SelectTrigger>
                        <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 7))}><ChevronLeft className="h-4 w-4" /></Button>
                        <span className="text-sm font-medium">{format(weekInterval.start, 'MMM d')} - {format(weekInterval.end, 'MMM d, yyyy')}</span>
                        <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </div>
    
                {loading ? (
                    <div className="p-4 bg-white rounded-lg border shadow-sm"><Skeleton className="h-12 w-full mb-2" /><Skeleton className="h-16 w-full mb-1" /><Skeleton className="h-16 w-full mb-1" /><Skeleton className="h-16 w-full" /></div>
                ) : !selectedProject ? (
                     <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed">
                        <h3 className="text-lg font-semibold text-gray-800">No Project Selected</h3>
                        <p className="text-gray-500 mt-2">Please select a project to view its workload.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg border shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider z-10 w-48">Resource</th>
                                    {weekDays.map(day => (<th key={day.toISOString()} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{format(day, 'EEE')} <br /> {format(day, 'd')}</th>))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {resources.map(resource => {
                                    const calendar = resource.resource_calendars;
                                    const capacity = calendar?.daily_hours || 8;
                                    const workDays = calendar?.work_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                                    
                                    return (
                                        <tr key={resource.resource_id}>
                                            <td className="sticky left-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-48 z-10">{resource.resource_name}</td>
                                            {weekDays.map(day => {
                                                const dayStr = format(day, 'yyyy-MM-dd'); const dayName = format(day, 'Eee');
                                                const isWorkDay = workDays.includes(dayName); const dayData = workloadData[resource.resource_id]?.[dayStr];
                                                const dayCapacity = isWorkDay ? capacity : 0;
                                                const percentage = dayCapacity > 0 ? (dayData.allocatedHours / dayCapacity) * 100 : (dayData.allocatedHours > 0 ? 999 : 0);
                                                
                                                return (
                                                    <DroppableCell key={dayStr} resourceId={resource.resource_id} onDrop={handleDrop} className={`p-2 border-l ${isWorkDay ? getWorkloadColor(percentage) : 'bg-gray-200'} min-w-[120px]`}>
                                                        <div className="text-xs font-bold mb-1 text-center">{Math.round(dayData.allocatedHours)}h / {dayCapacity}h ({Math.round(percentage)}%)</div>
                                                        <div className="space-y-1">{dayData?.tasks?.map(task => (<DraggableTask key={task.task_id} task={task} />))}</div>
                                                    </DroppableCell>
                                                );
                                            })}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };
    
    export default WorkloadView;