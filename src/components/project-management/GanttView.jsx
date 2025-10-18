import React, { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from "@/components/ui/use-toast";
    import GanttToolbar from '@/components/project-management/GanttToolbar';
    import GanttChart from '@/components/project-management/GanttChart';
    import AddTaskDialog from '@/components/project-management/AddTaskDialog';
    import LogTimeDialog from '@/components/project-management/LogTimeDialog';
    import { DndProvider } from 'react-dnd';
    import { HTML5Backend } from 'react-dnd-html5-backend';
    import { addDays } from 'date-fns';
    import { Button } from '@/components/ui/button';
    import { BookCopy } from 'lucide-react';
    import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
    import { useProjectManagementPermissions } from '@/hooks/useProjectManagementPermissions';
    
    const GanttView = ({ projects, setProjects, selectedProject, setSelectedProject, refreshProjects }) => {
        const [tasks, setTasks] = useState([]);
        const [dependencies, setDependencies] = useState([]);
        const [loading, setLoading] = useState(true);
        const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
        const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);
        const [taskToLog, setTaskToLog] = useState(null);
    const [activeTimer, setActiveTimer] = useState(null); // { taskId, startTime }
    const [filters, setFilters] = useState({ status: [], milestone: false });
    const { toast } = useToast();
    const { profile } = useAuth();
    const permissions = useProjectManagementPermissions();
    
        const fetchTasksAndDependencies = useCallback(async () => {
            if (!selectedProject || !profile) {
                setTasks([]);
                setDependencies([]);
                setLoading(false);
                return;
            }
            
    
            setLoading(true);
    
            let tasksQuery = supabase
                .from('pm_tasks')
                .select(`*, task_assignments(resource_id)`)
                .eq('project_code', selectedProject)
                .order('start_date', { ascending: true });
    
            if (!permissions.canReadEverything) {
                const { data: resourceData } = await supabase.from('resources').select('resource_id').eq('user_id', profile.id);
                const assignedResourceIds = resourceData ? resourceData.map(r => r.resource_id) : [];

                if (assignedResourceIds.length > 0) {
                     const { data: assignedTasks, error: assignedError } = await supabase.from('task_assignments').select('task_id').in('resource_id', assignedResourceIds);
                     if (assignedError) {
                        toast({ variant: 'destructive', title: 'Error fetching assigned tasks' });
                        setTasks([]);
                     } else {
                        const taskIds = assignedTasks.map(t => t.task_id);
                        tasksQuery = tasksQuery.in('task_id', taskIds);
                     }
                } else {
                    setTasks([]);
                    setDependencies([]);
                    setLoading(false);
                    return;
                }
            }
            
            const { data: tasksData, error: tasksError } = await tasksQuery;
    
            if (tasksError) {
                toast({ variant: 'destructive', title: 'Error fetching tasks', description: tasksError.message });
                setTasks([]);
            } else {
                setTasks(tasksData || []);
            }
    
            const taskIds = tasksData ? tasksData.map(t => t.task_id) : [];
    
            if (taskIds.length > 0) {
                const { data: depsData, error: depsError } = await supabase
                    .from('task_dependencies')
                    .select('*')
                    .in('task_id', taskIds);
    
                if (depsError) {
                    toast({ variant: 'destructive', title: 'Error fetching dependencies', description: depsError.message });
                    setDependencies([]);
                } else {
                    setDependencies(depsData || []);
                }
            } else {
                setDependencies([]);
            }
    
    
            setLoading(false);
        }, [selectedProject, toast, profile, permissions.canReadEverything]);
    
        useEffect(() => {
            fetchTasksAndDependencies();
        }, [selectedProject, fetchTasksAndDependencies]);

        // Filter tasks based on current filters
        const filteredTasks = tasks.filter(task => {
            // Status filter
            if (filters.status.length > 0 && !filters.status.includes(task.status)) {
                return false;
            }
            
            // Milestone filter
            if (filters.milestone && !task.is_milestone) {
                return false;
            }
            
            return true;
        });
    
        const handleAddTask = async (newTask) => {
            // The task has already been created by AddTaskDialog, so we just need to update the local state
            try {
                setTasks([...tasks, newTask]);
                toast({ title: "Task added successfully!" });
                setIsAddTaskOpen(false);
            } catch (error) {
                toast({ variant: "destructive", title: "Failed to add task", description: error.message });
            }
        };
    
        const handleUpdateTask = async (taskId, updates) => {
            const { data, error } = await supabase.from('pm_tasks').update(updates).eq('task_id', taskId).select().single();
            if (error) {
                toast({ variant: "destructive", title: "Failed to update task", description: error.message });
            } else {
                setTasks(tasks.map(t => t.task_id === taskId ? data : t));
            }
        };

        const handleDeleteTask = async (taskId) => {
            const { error } = await supabase.from('pm_tasks').delete().eq('task_id', taskId);
            if (error) {
                throw new Error(error.message);
            } else {
                setTasks(tasks.filter(t => t.task_id !== taskId));
            }
        };
        
        const moveTask = (id, atIndex) => {
            const { task, index } = findTask(id);
            const newTasks = [...tasks];
            newTasks.splice(index, 1);
            newTasks.splice(atIndex, 0, task);
            setTasks(newTasks);
        };
    
        const findTask = (id) => {
            const task = tasks.filter((t) => t.task_id === id)[0];
            return {
                task,
                index: tasks.indexOf(task),
            };
        };
    
        const handleOpenLogTime = (task) => {
            setTaskToLog(task);
            setIsLogTimeOpen(true);
        };
    
        const handleLogTime = async (logData) => {
            const { error } = await supabase.from('time_logs').insert(logData);
            if (error) {
                toast({ variant: "destructive", title: "Failed to log time", description: error.message });
            } else {
                toast({ title: "Time logged successfully!" });
                setIsLogTimeOpen(false);
                setTaskToLog(null);
            }
        };
    
        const handleToggleTimer = async (taskId) => {
            if (activeTimer && activeTimer.taskId === taskId) {
                setActiveTimer(null);
                toast({ title: "Timer stopped", description: `Log your time for ${tasks.find(t => t.task_id === taskId)?.task_name}.` });
    
            } else if (activeTimer && activeTimer.taskId !== taskId) {
                toast({ variant: "destructive", title: "Another timer is active", description: "Please stop the current timer before starting a new one." });
            } else {
                setActiveTimer({ taskId, startTime: new Date().toISOString() });
                toast({ title: "Timer started!", description: `Timing for ${tasks.find(t => t.task_id === taskId)?.task_name}.` });
            }
        };
    
        const handleUseTemplate = async () => {
            if (!selectedProject) {
                toast({ title: 'No project selected', variant: 'destructive' });
                return;
            }
    
            if (tasks.length > 0 && !window.confirm('This project already has tasks. Are you sure you want to add tasks from the template? This may create duplicates.')) {
                return;
            }
    
            setLoading(true);
    
            const { data: templateTasks, error: templateError } = await supabase
                .from('project_template_tasks')
                .select('*')
                .eq('template_id', 'a1b2c3d4-e5f6-7890-1234-567890abcdef')
                .order('sort_order');
    
            if (templateError) {
                setLoading(false);
                toast({ title: 'Error fetching template', description: templateError.message, variant: 'destructive' });
                return;
            }
            
            const wbsCodeToIdMap = {};
            const newTasksPayload = [];
            let projectStartDate = new Date();
    
            for (const tt of templateTasks) {
                const newTaskId = crypto.randomUUID();
                wbsCodeToIdMap[tt.wbs_code] = newTaskId;
                const startDate = projectStartDate;
                const endDate = addDays(startDate, tt.duration_days);
    
                newTasksPayload.push({
                    task_id: newTaskId,
                    project_code: selectedProject,
                    task_name: tt.task_name,
                    is_milestone: tt.is_milestone,
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    duration_days: tt.duration_days,
                    notes: `Role: ${tt.assigned_role}`,
                    status: 'Not Started',
                    percent_complete: 0,
                    parent_task_id: tt.parent_wbs_code ? wbsCodeToIdMap[tt.parent_wbs_code] : null,
                });
            }
            
            for (let i = 0; i < newTasksPayload.length; i++) {
                const task = newTasksPayload[i];
                const templateTask = templateTasks.find(t => wbsCodeToIdMap[t.wbs_code] === task.task_id);
    
                if (templateTask && templateTask.dependencies) {
                    const depWbsCodes = templateTask.dependencies.split(',').map(s => s.trim());
                    let maxEndDate = new Date(task.start_date);
                    depWbsCodes.forEach(depWbs => {
                        const predecessorTemplateTask = templateTasks.find(t => t.wbs_code === depWbs);
                        if (predecessorTemplateTask) {
                            const predecessorId = wbsCodeToIdMap[predecessorTemplateTask.wbs_code];
                            const predecessorTask = newTasksPayload.find(p => p.task_id === predecessorId);
                            if (predecessorTask) {
                               const predEndDate = new Date(predecessorTask.end_date);
                               if(predEndDate > maxEndDate) maxEndDate = predEndDate;
                            }
                        }
                    });
                    task.start_date = addDays(maxEndDate, 1).toISOString();
                    task.end_date = addDays(new Date(task.start_date), task.duration_days).toISOString();
                }
            }
    
            const { error: insertTasksError } = await supabase.from('pm_tasks').insert(newTasksPayload);
    
            if (insertTasksError) {
                setLoading(false);
                toast({ title: 'Error creating tasks from template', description: insertTasksError.message, variant: 'destructive' });
                return;
            }
    
            const newDependenciesPayload = [];
            for (const tt of templateTasks) {
                if (tt.dependencies) {
                    const predecessorWbsCodes = tt.dependencies.split(',').map(s => s.trim());
                    predecessorWbsCodes.forEach(pWbsCode => {
                        if (wbsCodeToIdMap[tt.wbs_code] && wbsCodeToIdMap[pWbsCode]) {
                            newDependenciesPayload.push({
                                task_id: wbsCodeToIdMap[tt.wbs_code],
                                predecessor_task_id: wbsCodeToIdMap[pWbsCode],
                                type: 'FS'
                            });
                        }
                    });
                }
            }
            if (newDependenciesPayload.length > 0) {
                const { error: insertDepsError } = await supabase.from('task_dependencies').insert(newDependenciesPayload);
                if (insertDepsError) {
                    toast({ title: 'Warning: Tasks created, but failed to link dependencies.', description: insertDepsError.message, variant: 'default' });
                }
            }
            
            toast({ title: 'Homebuilding template applied successfully!' });
            await fetchTasksAndDependencies();
            setLoading(false);
        };
    
        return (
            <DndProvider backend={HTML5Backend}>
                <div className="space-y-4">
                    <GanttToolbar
                        projects={projects}
                        selectedProject={selectedProject}
                        onSelectProject={setSelectedProject}
                        onAddTask={() => setIsAddTaskOpen(true)}
                        onSetBaseline={() => toast({ title: "Set Baseline: Coming soon!" })}
                        onUseTemplate={handleUseTemplate}
                        permissions={permissions}
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        {loading ? (
                            <div className="flex items-center justify-center h-96">
                                <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-blue-600"></div>
                                <p className="ml-2 text-gray-600">Loading tasks...</p>
                            </div>
                        ) : projects.length === 0 ? (
                           <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed">
                                <h3 className="text-lg font-semibold text-gray-800">No Projects Found</h3>
                                <p className="text-gray-500 mt-2">Please create a project first to manage its tasks.</p>
                            </div>
                        ) : !selectedProject ? (
                            <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed">
                                <h3 className="text-lg font-semibold text-gray-800">Please Select a Project</h3>
                                <p className="text-gray-500 mt-2">Choose a project from the dropdown above to view its Gantt chart.</p>
                            </div>
                        ) : filteredTasks.length > 0 ? (
                           <GanttChart 
                                tasks={filteredTasks} 
                                dependencies={dependencies} 
                                onUpdateTask={handleUpdateTask}
                                onDeleteTask={handleDeleteTask}
                                findTask={findTask}
                                moveTask={moveTask}
                                onLogTime={handleOpenLogTime}
                                onToggleTimer={handleToggleTimer}
                                activeTimer={activeTimer}
                                permissions={permissions}
                            />
                        ) : (
                            <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed">
                                <h3 className="text-lg font-semibold text-gray-800">This project is empty.</h3>
                                {permissions.canEditTasks ? (
                                    <>
                                        <p className="text-gray-500 mt-2">Add Tasks by clicking the "Add Task" button above.</p>
                                        {/* <Button className="mt-4" onClick={handleUseTemplate}><BookCopy className="mr-2 h-4 w-4"/> Apply Homebuilding Template</Button> */}
                                    </>
                                ) : (
                                    <p className="text-gray-500 mt-2">No tasks have been assigned to you for this project yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <AddTaskDialog
                    isOpen={isAddTaskOpen}
                    onClose={() => setIsAddTaskOpen(false)}
                    onSave={handleAddTask}
                    project={{ id: selectedProject }}
                />
                <LogTimeDialog
                    isOpen={isLogTimeOpen}
                    onClose={() => setIsLogTimeOpen(false)}
                    onSave={handleLogTime}
                    task={taskToLog}
                />
            </DndProvider>
        );
    };
    
    export default GanttView;