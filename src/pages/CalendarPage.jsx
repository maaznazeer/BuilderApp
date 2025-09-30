import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, PlusCircle, Square, CheckSquare } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const AddTaskDialog = ({ projects, onTaskAdded }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const handleSubmit = async () => {
    if (!title || !dueDate || !selectedProjectId) {
      toast({
        title: "Missing fields",
        description: "Please fill in the title, due date, and select a project.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from('tasks').insert({
      project_id: selectedProjectId,
      title,
      description,
      due_date: format(dueDate, 'yyyy-MM-dd'),
    });

    if (error) {
      toast({ title: "Error creating task", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Task created!", description: `Successfully added "${title}".` });
      onTaskAdded();
      setOpen(false);
      setTitle('');
      setDescription('');
      setDueDate(null);
      setSelectedProjectId('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">Project</Label>
            <Select onValueChange={setSelectedProjectId} value={selectedProjectId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="due-date" className="text-right">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const CalendarPage = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('projects').select('id, name');
    // Assuming you only want projects for the logged in user, you might need .eq('user_id', user.id)
    if (error) {
      toast({ title: "Error fetching projects", description: error.message, variant: "destructive" });
    } else {
      setProjects(data || []);
    }
  }, [user, toast]);

  const fetchEvents = useCallback(async () => {
    if (projects.length === 0 && selectedProjectId === 'all') {
        setEvents([]);
        setLoading(false);
        return;
    }
    setLoading(true);
    let tasksQuery = supabase.from('tasks').select('id, title, due_date, status, project_id, projects(name)');
    let workflowQuery = supabase.from('project_workflow_steps').select('id, status, project_id, workflow_step:construction_workflow(step_name), projects(name), completion_date').not('completion_date', 'is', null);

    if (selectedProjectId !== 'all') {
      tasksQuery = tasksQuery.eq('project_id', selectedProjectId);
      workflowQuery = workflowQuery.eq('project_id', selectedProjectId);
    }

    const [
      { data: tasks, error: tasksError },
      { data: workflowSteps, error: workflowError }
    ] = await Promise.all([tasksQuery, workflowQuery]);

    if (tasksError) toast({ title: "Error fetching tasks", description: tasksError.message, variant: "destructive" });
    if (workflowError) toast({ title: "Error fetching workflow steps", description: workflowError.message, variant: "destructive" });

    const taskEvents = (tasks || []).map(task => ({
      id: `task-${task.id}`,
      title: task.title,
      date: parseISO(task.due_date),
      type: 'task',
      status: task.status,
      project: task.projects?.name || 'Unknown Project',
    }));

    const workflowEvents = (workflowSteps || []).map(step => ({
        id: `workflow-${step.id}`,
        title: step.workflow_step.step_name,
        date: parseISO(step.completion_date),
        type: 'workflow',
        status: step.status,
        project: step.projects?.name || 'Unknown Project',
    }));

    setEvents([...taskEvents, ...workflowEvents]);
    setLoading(false);
  }, [selectedProjectId, toast, projects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchEvents();
  }, [selectedProjectId, fetchEvents]);

  const DayWithEvents = ({ date, displayMonth }) => {
    const dayEvents = events.filter(event => isSameDay(event.date, date));
    
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <span>{format(date, 'd')}</span>
        {dayEvents.length > 0 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-1">
            {dayEvents.slice(0, 3).map(e => (
                <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${e.type === 'task' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const eventsForSelectedDate = useMemo(() => {
      if (!selectedDate) return [];
      return events
        .filter(event => isSameDay(event.date, selectedDate))
        .sort((a,b) => a.date - b.date);
  }, [events, selectedDate]);
  
  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <title>Project Calendar - DomusBuilder Hub</title>
        <meta name="description" content="View all your project tasks and milestones in one calendar." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 pt-20">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Project Calendar</h1>
                        <p className="text-gray-500">Your central hub for all tasks and milestones.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                            <SelectTrigger className="w-full md:w-[220px]">
                                <SelectValue placeholder="Filter by project" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Projects</SelectItem>
                                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <AddTaskDialog projects={projects} onTaskAdded={fetchEvents} />
                        <Button variant="outline" asChild><Link to="/dashboard">Back to Dashboard</Link></Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  <div className="hidden lg:block lg:col-span-2 relative rounded-lg overflow-hidden shadow-sm">
                    <img  className="absolute inset-0 w-full h-full object-cover" alt="Architectural blueprint and tools" src="https://images.unsplash.com/photo-1418156427006-5f8c87e9f4f0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6">
                        <h2 className="text-2xl font-bold text-white">Stay on Schedule</h2>
                        <p className="text-white/80 mt-2">Visualize your project timeline, track milestones, and ensure every task is completed on time.</p>
                    </div>
                  </div>

                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 bg-white p-4 sm:p-2 rounded-lg shadow-sm border">
                          <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              className="w-full"
                              components={{ Day: DayWithEvents }}
                          />
                      </div>
                      <div className="mt-8 md:mt-0 md:col-span-1">
                          <h2 className="text-lg font-bold text-gray-800 mb-4">
                            {selectedDate ? `Events for ${format(selectedDate, 'PPP')}` : 'Select a date'}
                          </h2>
                          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                              {loading ? <p>Loading events...</p> : eventsForSelectedDate.length === 0 ? <p className="text-gray-500">No events for this date.</p> :
                              eventsForSelectedDate.map(event => (
                                  <div key={event.id} className="bg-white p-3 rounded-lg shadow-sm border flex items-start gap-3">
                                      <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${event.type === 'task' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                      <div>
                                          <p className="font-semibold text-sm">{event.title}</p>
                                          <p className="text-xs text-gray-500">{event.project}</p>
                                      </div>
                                  </div>
                              ))
                              }
                          </div>
                      </div>
                  </div>
                </div>
            </motion.div>
        </main>
      </div>
    </>
  );
};

export default CalendarPage;