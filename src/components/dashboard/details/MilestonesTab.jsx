import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Button, buttonVariants } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import {
      Accordion,
      AccordionContent,
      AccordionItem,
      AccordionTrigger,
    } from '@/components/ui/accordion';
    import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
    } from '@/components/ui/table';
    import { Progress } from '@/components/ui/progress';
    import { Badge } from '@/components/ui/badge';
    import { Checkbox } from '@/components/ui/checkbox';
    import { format, parseISO, isPast } from 'date-fns';
    import {
      PlusCircle, Edit, Trash2, Loader2, Flag, Target, AlertCircle, RefreshCw
    } from 'lucide-react';
    import { cn } from '@/lib/utils';
    import AddEditMilestoneDialog from '@/components/dashboard/details/milestones/AddEditMilestoneDialog';
    import AddEditTaskDialog from '@/components/dashboard/details/milestones/AddEditTaskDialog';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

    const MilestonesTab = ({ project }) => {
        const { toast } = useToast();
        const [milestones, setMilestones] = useState([]);
        const [tasks, setTasks] = useState([]);
        const [collaborators, setCollaborators] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
        const [milestoneToEdit, setMilestoneToEdit] = useState(null);
        const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
        const [taskToEdit, setTaskToEdit] = useState(null);
        const [activeMilestoneForTask, setActiveMilestoneForTask] = useState(null);

        const fetchData = useCallback(async () => {
            if (!project?.id) return;
            setLoading(true);
            setError(null);

            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), 10000);

            try {
                const { data: milestonesData, error: milestonesError } = await supabase
                    .from('milestones')
                    .select('*')
                    .eq('project_id', project.id)
                    .order('due_date')
                    .abortSignal(abortController.signal);

                if (milestonesError) throw milestonesError;
                setMilestones(milestonesData || []);

                const milestoneIds = (milestonesData || []).map(m => m.id);
                
                if (milestoneIds.length > 0) {
                    const [tasksRes, collaboratorsRes] = await Promise.all([
                        supabase.from('tasks').select('*, assigned_to_profile:profiles(full_name)').in('milestone_id', milestoneIds).abortSignal(abortController.signal),
                        supabase.from('collaborators').select('id, profiles(id, full_name)').eq('project_id', project.id).abortSignal(abortController.signal)
                    ]);

                    if (tasksRes.error) throw tasksRes.error;
                    if (collaboratorsRes.error) throw collaboratorsRes.error;
                    
                    setTasks(tasksRes.data || []);
                    setCollaborators(collaboratorsRes.data || []);
                } else {
                    setTasks([]);
                    setCollaborators([]);
                }

            } catch (err) {
                clearTimeout(timeoutId);
                console.error("Error fetching data:", err);
                const errorMessage = err.name === 'AbortError' ? 'Request timed out. Please try again.' : err.message;
                setError(errorMessage);
                toast({ variant: 'destructive', title: 'Error fetching data', description: errorMessage });
            } finally {
                clearTimeout(timeoutId);
                setLoading(false);
            }
        }, [project?.id, toast]);
        
        useEffect(() => {
            fetchData();
        }, [project?.id]);

        const handleToggleTask = async (task) => {
            const { error } = await supabase.from('tasks').update({ completed: !task.completed }).eq('id', task.id);
            if (error) {
                toast({ variant: 'destructive', title: 'Error updating task', description: error.message });
            } else {
                toast({ title: 'Task status updated!' });
                fetchData();
            }
        };
        
        const handleDeleteMilestone = async (milestoneId) => {
            const { error } = await supabase.from('milestones').delete().eq('id', milestoneId);
            if (error) toast({ variant: 'destructive', title: 'Error deleting milestone', description: error.message });
            else { toast({ title: 'Milestone deleted' }); fetchData(); }
        };

        const handleDeleteTask = async (taskId) => {
            const { error } = await supabase.from('tasks').delete().eq('id', taskId);
            if (error) toast({ variant: 'destructive', title: 'Error deleting task', description: error.message });
            else { toast({ title: 'Task deleted' }); fetchData(); }
        };
        
        const handleAddMilestone = () => { setMilestoneToEdit(null); setIsMilestoneDialogOpen(true); };
        const handleEditMilestone = (m) => { setMilestoneToEdit(m); setIsMilestoneDialogOpen(true); };
        const handleAddTask = (milestoneId) => { setTaskToEdit(null); setActiveMilestoneForTask(milestoneId); setIsTaskDialogOpen(true); };
        const handleEditTask = (t) => { setTaskToEdit(t); setActiveMilestoneForTask(t.milestone_id); setIsTaskDialogOpen(true); };
        
        const getStatusProps = (status, dueDateStr) => {
            const dueDate = dueDateStr ? parseISO(dueDateStr) : null;
            const overdue = dueDate && status !== 'Completed' && isPast(dueDate);
            
            if (overdue) return { variant: "destructive", label: "Overdue" };
            
            switch (status) {
                case 'Completed': return { variant: "success", label: "Completed" };
                case 'Active': return { variant: "default", label: "Active", className: 'bg-blue-500 hover:bg-blue-600' };
                case 'Delayed': return { variant: "warning", label: "Delayed" };
                case 'Planned': return { variant: "secondary", label: "Planned" };
                default: return { variant: "outline", label: status };
            }
        };

        if (loading) {
            return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
        }
        
        if (error) {
            return (
                <div className="text-center p-8">
                    <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                    <h3 className="mt-4 text-lg font-semibold text-destructive">Failed to Load Data</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                    <Button onClick={fetchData} className="mt-4">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                    </Button>
                </div>
            );
        }

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Milestones & Tasks</CardTitle>
                            <CardDescription>Track your project's key objectives and their corresponding tasks.</CardDescription>
                        </div>
                        <Button onClick={handleAddMilestone}><PlusCircle className="mr-2 h-4 w-4" /> Add Milestone</Button>
                    </CardHeader>
                    <CardContent>
                        {milestones.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                               <Flag className="mx-auto h-12 w-12 text-gray-400" />
                               <h3 className="mt-2 text-lg font-medium text-gray-900">No Milestones Yet</h3>
                               <p className="mt-1 text-sm text-gray-500">Get started by creating your first project milestone.</p>
                               <Button onClick={handleAddMilestone} className="mt-4">Create Milestone</Button>
                            </div>
                        ) : (
                            <Accordion type="single" collapsible defaultValue={`item-${milestones[0].id}`} className="w-full">
                                {milestones.map(milestone => {
                                    const milestoneTasks = tasks.filter(t => t.milestone_id === milestone.id);
                                    const { variant, label, className } = getStatusProps(milestone.status, milestone.due_date);

                                    return (
                                    <AccordionItem key={milestone.id} value={`item-${milestone.id}`}>
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center justify-between w-full pr-4">
                                                <div className="flex items-center gap-4">
                                                    <Target className="h-6 w-6 text-primary" />
                                                    <div className="text-left">
                                                        <p className="font-bold text-lg">{milestone.title}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Due: {milestone.due_date ? format(parseISO(milestone.due_date), 'MMM d, yyyy') : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-48 text-left">
                                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                                            <span>Progress</span>
                                                            <span>{milestone.progress || 0}%</span>
                                                        </div>
                                                        <Progress value={milestone.progress || 0} indicatorClassName={milestone.progress === 100 ? 'bg-green-500' : ''} />
                                                    </div>
                                                    <Badge variant={variant} className={cn("w-24 justify-center", className)}>{label}</Badge>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditMilestone(milestone) }}><Edit className="h-4 w-4" /></Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" onClick={e => e.stopPropagation()}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the milestone and all its associated tasks. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteMilestone(milestone.id)} className={cn(buttonVariants({ variant: 'destructive' }))}>Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-2 bg-gray-50/50 rounded-b-md">
                                            <div className="flex justify-end mb-2">
                                                <Button size="sm" onClick={() => handleAddTask(milestone.id)}><PlusCircle className="mr-2 h-4 w-4" /> Add Task</Button>
                                            </div>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[50px]"></TableHead>
                                                        <TableHead>Task</TableHead>
                                                        <TableHead>Assigned To</TableHead>
                                                        <TableHead>Due Date</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {milestoneTasks.length > 0 ? milestoneTasks.map(task => {
                                                        const overdue = task.due_date && !task.completed && isPast(parseISO(task.due_date));
                                                        return (
                                                            <TableRow key={task.id} className={cn(task.completed && 'bg-green-50 text-muted-foreground line-through')}>
                                                                <TableCell><Checkbox checked={task.completed} onCheckedChange={() => handleToggleTask(task)} /></TableCell>
                                                                <TableCell className="font-medium">{task.title}</TableCell>
                                                                <TableCell>{task.assigned_to_profile?.full_name || <span className="text-muted-foreground italic">Unassigned</span>}</TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                    {task.due_date ? format(parseISO(task.due_date), 'MMM d, yyyy') : 'N/A'}
                                                                    {overdue && <AlertCircle className="h-4 w-4 text-destructive" title="Overdue" />}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)}><Edit className="h-4 w-4" /></Button>
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this task. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                <AlertDialogAction onClick={() => handleDeleteTask(task.id)} className={cn(buttonVariants({ variant: 'destructive' }))}>Delete</AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    }) : (
                                                        <TableRow><TableCell colSpan={5} className="text-center h-24">No tasks for this milestone yet.</TableCell></TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                                })}
                            </Accordion>
                        )}
                    </CardContent>
                </Card>

                <AddEditMilestoneDialog
                    isOpen={isMilestoneDialogOpen}
                    onOpenChange={setIsMilestoneDialogOpen}
                    onSave={fetchData}
                    milestone={milestoneToEdit}
                    projectId={project.id}
                />
                <AddEditTaskDialog
                    isOpen={isTaskDialogOpen}
                    onOpenChange={setIsTaskDialogOpen}
                    onSave={fetchData}
                    task={taskToEdit}
                    milestoneId={activeMilestoneForTask}
                    milestones={milestones}
                    projectId={project.id}
                    collaborators={collaborators}
                />
            </motion.div>
        );
    };

    export default MilestonesTab;