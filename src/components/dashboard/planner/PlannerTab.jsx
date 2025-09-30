import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlannerTasks } from '@/hooks/usePlannerTasks.js';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { LayoutGrid, CalendarDays, ClipboardList, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KanbanBoard from '@/components/dashboard/planner/KanbanBoard.jsx';
import CalendarView from '@/components/dashboard/planner/CalendarView.jsx';

const EmptyState = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center h-full py-16"
    >
        <Card className="w-full max-w-lg text-center shadow-md">
            <CardHeader>
                <div className="mx-auto bg-gradient-to-br from-green-100 to-cyan-200 rounded-full h-20 w-20 flex items-center justify-center">
                    <ClipboardList className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold pt-4">Your Planner is Empty</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-6">Create tasks within your projects to see them here.</p>
                <Button disabled>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add a New Task
                </Button>
            </CardContent>
        </Card>
    </motion.div>
);

const PlannerTab = () => {
    const { data: tasks, isLoading, error } = usePlannerTasks();
    const [view, setView] = useState('kanban');

    if (error) {
        return <div className="text-red-500">Error loading tasks: {error.message}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Planner</h2>
                <Tabs value={view} onValueChange={setView} className="w-auto">
                    <TabsList>
                        <TabsTrigger value="kanban"><LayoutGrid className="w-4 h-4 mr-2" />Kanban</TabsTrigger>
                        <TabsTrigger value="calendar"><CalendarDays className="w-4 h-4 mr-2" />Calendar</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {isLoading ? (
                <Skeleton className="h-[600px] w-full" />
            ) : !tasks || tasks.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    {view === 'kanban' && <KanbanBoard tasks={tasks} />}
                    {view === 'calendar' && <CalendarView tasks={tasks} />}
                </>
            )}
        </motion.div>
    );
};

export default PlannerTab;