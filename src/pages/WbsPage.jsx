import React, { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { useWBSData } from '@/hooks/useWBSData';
import { useWbsScheduler } from '@/hooks/useWbsScheduler';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import WbsToolbar from '@/components/wbs/WbsToolbar';
import AddTaskDialog from '@/components/wbs/AddTaskDialog';
import WbsTree from '@/components/wbs/WbsTree';
import TimeGrid from '@/components/wbs/TimeGrid';
import WbsFilters from '@/components/wbs/WbsFilters';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft, GanttChartSquare } from "lucide-react";
import { useMediaQuery } from '@/hooks/useMediaQuery';
import Papa from 'papaparse';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const WbsPage = () => {
  const { id: projectCode } = useParams();
  const { toast } = useToast();

  const [baseStartDate, setBaseStartDate] = useState(new Date());
  const [timescaleWeeks, setTimescaleWeeks] = useState(16);
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [tz, setTz] = useState('Europe/Warsaw');
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [filters, setFilters] = useState({
      phases: [],
      status: null, // can be 'Not Started', 'In Progress', 'Done'
      priorities: [],
  });

  const { data: initialTasks, isLoading, isError, error: dataError, refetch } = useWBSData(projectCode, filters);
  const { tasks, setTasks, updateAndSaveTask, scheduleAllTasks } = useWbsScheduler(projectCode, initialTasks, autoSchedule, refetch);

  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [mobileView, setMobileView] = useState('tree'); // 'tree' or 'gantt'

  const availableOptions = useMemo(() => {
    const allPhases = new Set(initialTasks?.map(t => t.phase).filter(Boolean) || []);
    const allPriorities = new Set(initialTasks?.map(t => t.priority).filter(Boolean) || []);
    return {
        phases: [...allPhases],
        priorities: [...allPriorities],
        statuses: ['Not Started', 'In Progress', 'Done']
    };
  }, [initialTasks]);

  const clearFilters = () => {
    setFilters({ phases: [], status: null, priorities: [] });
  };
  
  const handleAddTask = async (newTask) => {
    const { data, error } = await supabase.from('wbs_tasks').insert(newTask).select();
    if (error) {
      toast({
        title: 'Error adding task',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Task added successfully!',
      });
      if (autoSchedule) {
        scheduleAllTasks();
      } else {
        refetch();
      }
    }
  };

  const maxWbs = tasks?.reduce((max, task) => {
      if (!task.wbs) return max;
      const currentNum = parseInt(task.wbs.split('.').pop() || '0', 10);
      const maxNum = parseInt(max.split('.').pop() || '0', 10);
      return currentNum > maxNum ? task.wbs : max;
  }, '0');


  if (isError) {
    return <div className="p-8 text-red-500">Error loading WBS data: {dataError.message}</div>;
  }

  const treePanel = (
    <ScrollArea className="h-full">
        <WbsTree tasks={tasks || []} selectedTaskId={selectedTaskId} setSelectedTaskId={setSelectedTaskId} />
    </ScrollArea>
  );

  const ganttPanel = (
    <ScrollArea className="h-full w-full">
        <TimeGrid 
            tasks={tasks}
            baseStartDate={baseStartDate}
            timescaleWeeks={timescaleWeeks}
            isLoading={isLoading}
            onUpdateTask={updateAndSaveTask}
            autoSchedule={autoSchedule}
            isMobile={isMobile}
        />
        <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );

  return (
    <>
      <Helmet>
        <title>WBS - {projectCode}</title>
        <meta name="description" content={`Work Breakdown Structure for project ${projectCode}`} />
      </Helmet>
      <div className="h-full flex flex-col">
        <WbsToolbar
          projectCode={projectCode}
          baseStartDate={baseStartDate}
          setBaseStartDate={setBaseStartDate}
          timescaleWeeks={timescaleWeeks}
          setTimescaleWeeks={setTimescaleWeeks}
          autoSchedule={autoSchedule}
          setAutoSchedule={setAutoSchedule}
          tz={tz}
          setTz={setTz}
          onAddTask={() => setIsAddTaskDialogOpen(true)}
          onRecalculate={scheduleAllTasks}
        />
        <WbsFilters 
            filters={filters}
            setFilters={setFilters}
            availableOptions={availableOptions}
            onClear={clearFilters}
            tasksToExport={tasks}
            projectCode={projectCode}
        />
        
        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden relative">
          {isMobile ? (
            <div className="flex flex-col h-full w-full">
                <div className="p-2 border-b">
                     <div className="flex justify-center">
                        <div className="p-1 bg-muted rounded-full flex gap-1">
                            <Button size="sm" variant={mobileView === 'tree' ? 'outline' : 'ghost'} className={cn("rounded-full shadow-none", mobileView === 'tree' && 'bg-background shadow-sm')} onClick={() => setMobileView('tree')}>
                                <PanelLeft className="mr-2 h-4 w-4" />
                                Task List
                            </Button>
                            <Button size="sm" variant={mobileView === 'gantt' ? 'outline' : 'ghost'} className={cn("rounded-full shadow-none", mobileView === 'gantt' && 'bg-background shadow-sm')} onClick={() => setMobileView('gantt')}>
                                <GanttChartSquare className="mr-2 h-4 w-4" />
                                Gantt Chart
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-grow relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mobileView}
                            initial={{ opacity: 0, x: mobileView === 'tree' ? -50 : 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: mobileView === 'tree' ? 50 : -50 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0"
                        >
                            {mobileView === 'tree' ? treePanel : ganttPanel}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
          ) : (
            <ResizablePanelGroup direction="horizontal" className="flex-grow">
              <ResizablePanel defaultSize={30} minSize={20}>
                {treePanel}
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={70}>
                {ganttPanel}
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </div>
      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onClose={() => setIsAddTaskDialogOpen(false)}
        onAddTask={handleAddTask}
        projectCode={projectCode}
        maxWbs={maxWbs}
      />
    </>
  );
};

export default WbsPage;