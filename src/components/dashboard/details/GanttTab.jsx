import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { BookCopy, Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useProjectManagementPermissions } from '@/hooks/useProjectManagementPermissions';
import GanttToolbar from '@/components/project-management/GanttToolbar';
import GanttChart from '@/components/project-management/GanttChart';
import AddTaskDialog from '@/components/project-management/AddTaskDialog';
import LogTimeDialog from '@/components/project-management/LogTimeDialog';
import TaskDetailsDialog from '@/components/project-management/TaskDetailsDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlan } from '@/hooks/usePlan.js';
import { useNavigate } from 'react-router-dom';

const GanttTab = ({ project }) => {
    const [tasks, setTasks] = useState([]);
    const [dependencies, setDependencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);
    const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
    const [taskToLog, setTaskToLog] = useState(null);
    const [taskToView, setTaskToView] = useState(null);
    const [activeTimer, setActiveTimer] = useState(null);
    
    // Debug state changes
    useEffect(() => {
        console.log('GanttTab state changed - isTaskDetailsOpen:', isTaskDetailsOpen, 'taskToView:', taskToView?.task_name);
    }, [isTaskDetailsOpen, taskToView]);
    
    const { toast } = useToast();
    const { profile } = useAuth();
    const navigate = useNavigate();
    const { hasFeature } = usePlan();
    const permissions = useProjectManagementPermissions();
    const isGanttEnabled = hasFeature('gantt');

    const fetchTasksAndDependencies = useCallback(async () => {
        if (!project?.id || !profile || !isGanttEnabled) {
            setTasks([]);
            setDependencies([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const { data: milestonesData, error: milestonesError } = await supabase
            .from('milestones')
            .select('*')
            .eq('project_id', project.id);

        if (milestonesError) {
            toast({ variant: 'destructive', title: 'Error fetching milestones', description: milestonesError.message });
        }

        const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('*, assigned_to_profile:profiles(full_name, avatar_url)')
            .eq('project_id', project.id);

        if (tasksError) {
            toast({ variant: 'destructive', title: 'Error fetching tasks', description: tasksError.message });
        }

        const formattedData = [];
        if (milestonesData) {
            milestonesData.forEach(m => {
                formattedData.push({
                    task_id: m.id,
                    task_name: m.title,
                    start_date: m.created_at,
                    end_date: m.due_date || addDays(new Date(m.created_at), 1).toISOString(),
                    is_milestone: true,
                    percent_complete: m.progress,
                    status: m.status,
                    project_code: m.project_id,
                });
            });
        }

        if (tasksData) {
            tasksData.forEach(t => {
                formattedData.push({
                    task_id: t.id,
                    task_name: t.title,
                    start_date: t.created_at,
                    end_date: t.due_date || addDays(new Date(t.created_at), 1).toISOString(),
                    is_milestone: false,
                    percent_complete: t.completed ? 100 : 0,
                    status: t.completed ? 'Completed' : 'In Progress',
                    project_code: t.project_id,
                    parent_task_id: t.milestone_id,
                    assignee: t.assigned_to_profile,
                });
            });
        }
        
        formattedData.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        setTasks(formattedData);
        
        setDependencies([]);
        setLoading(false);
    }, [project?.id, toast, profile, isGanttEnabled]);

    useEffect(() => {
        fetchTasksAndDependencies();
    }, [fetchTasksAndDependencies]);

    const handleAddTask = async (taskData) => {
        const { data, error } = await supabase.from('tasks').insert([{ ...taskData, project_id: project.id }]).select().single();
        if (error) {
            toast({ variant: "destructive", title: "Failed to add task", description: error.message });
        } else {
            fetchTasksAndDependencies();
            toast({ title: "Task added successfully!" });
            setIsAddTaskOpen(false);
        }
    };

    const handleUpdateTask = async (taskId, updates) => {
        const taskToUpdate = tasks.find(t => t.task_id === taskId);
        if (!taskToUpdate) return;

        let dbTable = taskToUpdate.is_milestone ? 'milestones' : 'tasks';
        let payload = {};
        
        if (taskToUpdate.is_milestone) {
            if (updates.status) payload.status = updates.status;
            if (updates.end_date) payload.due_date = updates.end_date;
        } else {
            if (updates.completed !== undefined) payload.completed = updates.completed;
            if (updates.end_date) payload.due_date = updates.end_date;
        }

        if (Object.keys(payload).length === 0) return;

        const { error } = await supabase.from(dbTable).update(payload).eq('id', taskId);
        if (error) {
            toast({ variant: "destructive", title: "Failed to update task", description: error.message });
        } else {
            fetchTasksAndDependencies();
        }
    };

    const findTask = useCallback(
        (id) => {
            const task = tasks.filter((t) => t.task_id === id)[0];
            return {
                task,
                index: tasks.indexOf(task),
            };
        },
        [tasks],
    );

    const moveTask = useCallback(
        (id, atIndex) => {
            const { task, index } = findTask(id);
            const newTasks = [...tasks];
            newTasks.splice(index, 1);
            newTasks.splice(atIndex, 0, task);
            setTasks(newTasks);
        },
        [findTask, tasks, setTasks],
    );

    const handleLogTime = (task) => {
        setTaskToLog(task);
        setIsLogTimeOpen(true);
    };

    const handleSaveTimeLog = async (logData) => {
        const { error } = await supabase.from('time_logs').insert([logData]);
        if (error) {
            toast({ variant: "destructive", title: "Failed to log time", description: error.message });
        } else {
            toast({ title: "Time logged successfully!" });
            setIsLogTimeOpen(false);
        }
    };

    const handleToggleTimer = (taskId) => {
        setActiveTimer(prev => (prev?.taskId === taskId ? null : { taskId, startTime: Date.now() }));
    };

    const handleViewDetails = (task) => {
        console.log('handleViewDetails called with task:', task);
        console.log('Setting taskToView to:', task);
        console.log('Setting isTaskDetailsOpen to true');
        setTaskToView(task);
        setIsTaskDetailsOpen(true);
        console.log('State should be updated now');
        
        // Force a re-render to test
        setTimeout(() => {
            console.log('After timeout - isTaskDetailsOpen should be true');
        }, 100);
    };
    
    console.log('GanttTab handleViewDetails function:', handleViewDetails);
    console.log('typeof handleViewDetails:', typeof handleViewDetails);

    if (!isGanttEnabled) {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[500px]">
                <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                <CardHeader>
                    <CardTitle className="text-2xl">Interactive Gantt Chart is a Premium Feature</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground max-w-md mt-2 mb-6">
                        Upgrade your plan to visually plan, schedule, and track your project tasks with our powerful Gantt chart tool.
                    </p>
                    <Button onClick={() => navigate('/pricing')}>View Upgrade Options</Button>
                </CardContent>
            </Card>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="space-y-4">
                <GanttToolbar
                    projects={[{id: project.id, name: project.name}]}
                    selectedProject={project.id}
                    onSelectProject={() => {}}
                    onAddTask={() => setIsAddTaskOpen(true)}
                    onSetBaseline={() => toast({ title: "Set Baseline: Coming soon!" })}
                    onUseTemplate={() => toast({ title: "Use Template: Coming soon!" })}
                    permissions={permissions}
                />
                <Card className="p-0 overflow-hidden">
                    {console.log('GanttTab passing to GanttChart:', { onViewDetails: handleViewDetails, typeof: typeof handleViewDetails })}
                    <GanttChart
                        tasks={tasks}
                        dependencies={dependencies}
                        onUpdateTask={handleUpdateTask}
                        findTask={findTask}
                        moveTask={moveTask}
                        onLogTime={handleLogTime}
                        onToggleTimer={handleToggleTimer}
                        onViewDetails={handleViewDetails}
                        activeTimer={activeTimer}
                        permissions={permissions}
                    />
                </Card>
            </div>
            <AddTaskDialog
                isOpen={isAddTaskOpen}
                onClose={() => setIsAddTaskOpen(false)}
                onSave={handleAddTask}
                project={project}
            />
            <LogTimeDialog
                isOpen={isLogTimeOpen}
                onClose={() => setIsLogTimeOpen(false)}
                onSave={handleSaveTimeLog}
                task={taskToLog}
            />
            {/* Debug info */}
            <div style={{ position: 'fixed', top: 0, left: 0, background: 'red', color: 'white', padding: '10px', zIndex: 9999 }}>
                Debug: isTaskDetailsOpen={isTaskDetailsOpen.toString()}, taskToView={taskToView?.task_name || 'null'}
            </div>
            
            {/* Simple test dialog */}
            {isTaskDetailsOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '500px',
                        width: '90%'
                    }}>
                        <h2>Task Details</h2>
                        <p>Task: {taskToView?.task_name}</p>
                        <p>Status: {taskToView?.status}</p>
                        <p>Progress: {taskToView?.percent_complete}%</p>
                        <button onClick={() => setIsTaskDetailsOpen(false)}>Close</button>
                    </div>
                </div>
            )}
            
            <TaskDetailsDialog
                isOpen={isTaskDetailsOpen}
                onClose={() => setIsTaskDetailsOpen(false)}
                task={taskToView}
                activeTimer={activeTimer}
                onToggleTimer={handleToggleTimer}
                onLogTime={handleLogTime}
                permissions={permissions}
            />
        </DndProvider>
    );
};

export default GanttTab;