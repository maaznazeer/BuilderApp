import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from 'react-query';

const KanbanColumn = ({ id, title, tasks }) => {
    const { setNodeRef } = useSortable({ id });
    return (
        <div ref={setNodeRef} className="flex-1 min-w-[300px] bg-gray-100/50 rounded-xl p-4">
            <h3 className="font-semibold mb-4 text-gray-700 capitalize">{title} ({tasks.length})</h3>
            <SortableContext items={tasks.map(t => t.id)}>
                <div className="space-y-3 h-full">
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
};

const TaskCard = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                    <p className="font-semibold text-sm mb-2">{task.title}</p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <Badge variant="outline" className="font-mono">{task.project_code}</Badge>
                        {task.due_date && <span>Due: {format(new Date(task.due_date), 'MMM dd')}</span>}
                    </div>
                    {task.assignee_name && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={task.assignee_avatar_url} />
                                <AvatarFallback>{task.assignee_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{task.assignee_name}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const KanbanBoard = ({ tasks: initialTasks }) => {
    const [taskState, setTaskState] = useState({
        'Backlog': [], 'In Progress': [], 'Blocked': [], 'Done': []
    });
    const { toast } = useToast();
    const queryClient = useQueryClient();

    useEffect(() => {
        const columns = { 'Backlog': [], 'In Progress': [], 'Blocked': [], 'Done': [] };
        if(initialTasks) {
            initialTasks.forEach(task => {
                if (columns[task.status]) {
                    columns[task.status].push(task);
                } else {
                    columns['Backlog'].push(task);
                }
            });
        }
        setTaskState(columns);
    }, [initialTasks]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const findColumnForTask = (taskId) => Object.keys(taskState).find(key => taskState[key].some(t => t.id === taskId));

    const handleDragEnd = useCallback(async (event) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeColumn = findColumnForTask(activeId);
        let overColumn = findColumnForTask(overId);

        if (!overColumn) {
           overColumn = columns.find(c => c === overId);
        }
        
        if (!activeColumn || !overColumn || activeId === overId) return;

        if (activeColumn !== overColumn) {
            const activeItems = Array.from(taskState[activeColumn]);
            const overItems = Array.from(taskState[overColumn]);
            const activeIndex = activeItems.findIndex(t => t.id === activeId);
            const [movedItem] = activeItems.splice(activeIndex, 1);
            movedItem.status = overColumn;

            const overIndex = overItems.findIndex(t => t.id === overId);
            
            if (overIndex !== -1) {
                overItems.splice(overIndex, 0, movedItem);
            } else {
                 overItems.push(movedItem);
            }

            setTaskState(prev => ({
                ...prev,
                [activeColumn]: activeItems,
                [overColumn]: overItems,
            }));
            
            const { error } = await supabase
                .from('planner_tasks')
                .update({ status: overColumn, completed: overColumn === 'Done' })
                .eq('id', activeId);
            
            if (error) {
                toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
            } else {
                toast({ title: 'Task updated!', description: `Moved to ${overColumn}.` });
            }
            await queryClient.invalidateQueries('plannerTasks');
        } else {
            const items = taskState[activeColumn];
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            if (oldIndex !== newIndex) {
                 setTaskState(prev => ({
                    ...prev,
                    [activeColumn]: arrayMove(items, oldIndex, newIndex)
                }));
            }
        }
    }, [taskState, queryClient, toast]);

    const columns = ['Backlog', 'In Progress', 'Blocked', 'Done'];

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-4">
                {columns.map(col => (
                     <SortableContext key={col} items={[]}>
                        <KanbanColumn id={col} title={col} tasks={taskState[col] || []} />
                     </SortableContext>
                ))}
            </div>
        </DndContext>
    );
};

export default KanbanBoard;