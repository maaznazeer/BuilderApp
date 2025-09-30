import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { GripVertical, ChevronDown, Diamond, Plus, Clock, Play, Pause } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, differenceInDays, addDays } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { cn } from '@/lib/utils';
import { Resizable } from 're-resizable';

const ItemType = {
    TASK: 'task',
};

const GanttTaskGrid = ({ task, index, findTask, moveTask, onUpdateTask, onLogTime, onToggleTimer, activeTimer, gridWidth, permissions }) => {
    const originalIndex = findTask(task.task_id).index;
    const ref = useRef(null);
    const { toast } = useToast();

    const canEdit = permissions.canEditTasks;
    const canLogTime = permissions.canLogTime;
    const canUpdatePercent = permissions.canUpdateOwnPercentComplete || permissions.canEditTasks;

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemType.TASK,
        item: { id: task.task_id, originalIndex },
        canDrag: canEdit,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            const { id: droppedId, originalIndex } = item;
            const didDrop = monitor.didDrop();
            if (!didDrop) {
                moveTask(droppedId, originalIndex);
            }
        },
    });

    const [, drop] = useDrop({
        accept: ItemType.TASK,
        canDrop: () => canEdit,
        hover({ id: draggedId }) {
            if (draggedId !== task.task_id) {
                const { index: overIndex } = findTask(task.task_id);
                moveTask(draggedId, overIndex);
            }
        },
    });

    drag(drop(ref));
    
    const handleStatusChange = (newStatus) => {
      onUpdateTask(task.task_id, { status: newStatus });
    };
    
    const handlePercentChange = (e) => {
        let newPercent = parseInt(e.target.value, 10);
        if (isNaN(newPercent)) return;
        newPercent = Math.max(0, Math.min(100, newPercent));
        onUpdateTask(task.task_id, { percent_complete: newPercent });
    };

    const opacity = isDragging ? 0.3 : 1;
    const isTimerActiveForThisTask = activeTimer?.taskId === task.task_id;

    return (
        <div ref={preview} style={{ opacity, width: `${gridWidth}px` }} className="flex h-10 border-b border-gray-200 bg-white items-center group relative">
            <div ref={ref} className="flex items-center w-full px-2 h-full">
                <GripVertical className={cn("h-5 w-5 text-gray-400 mr-2 flex-shrink-0", canEdit ? "cursor-move" : "cursor-not-allowed")} />
                {task.is_milestone && <Diamond className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />}
                <span className="truncate flex-grow" title={task.task_name}>{task.task_name}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onToggleTimer(task.task_id)} disabled={!canLogTime}>
                        {isTimerActiveForThisTask ? <Pause className="h-4 w-4 text-red-500 animate-pulse" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="start">
                            <div className="grid gap-4">
                                <div className="space-y-2"><h4 className="font-medium leading-none">Task Details</h4><p className="text-sm text-muted-foreground">{task.task_name}</p></div>
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label>Status</Label>
                                        <Select value={task.status} onValueChange={handleStatusChange} disabled={!canEdit}>
                                            <SelectTrigger className="col-span-2 h-8"><SelectValue /></SelectTrigger>
                                            <SelectContent>{['Not Started', 'In Progress', 'Completed', 'Delayed'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4"><Label>Start</Label><span>{format(new Date(task.start_date), 'MMM d, yyyy')}</span></div>
                                    <div className="grid grid-cols-3 items-center gap-4"><Label>End</Label><span>{format(new Date(task.end_date), 'MMM d, yyyy')}</span></div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label>% Complete</Label>
                                        <Input type="number" defaultValue={task.percent_complete} onBlur={handlePercentChange} className="col-span-2 h-8" max={100} min={0} disabled={!canUpdatePercent} />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2 border-t">
                                    <Button size="sm" className="flex-1" onClick={() => onLogTime(task)} disabled={!canLogTime}><Clock className="mr-2 h-4 w-4" /> Log Time</Button>
                                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => toast({title: "Add subtask: Coming soon!"})} disabled={!canEdit}><Plus className="mr-2 h-4 w-4" /> Add Subtask</Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
};


const GanttTaskBar = ({ task, onUpdateTask, taskPosition, dayWidth, getStatusColor, timelineContainerRef, activeTimer, permissions }) => {
    const canEdit = permissions.canEditTasks;
    
    const handleDrag = (event, info) => {
        const dragAmount = info.offset.x;
        const daysChanged = Math.round(dragAmount / dayWidth);
        if (daysChanged === 0) return;

        const duration = differenceInDays(new Date(task.end_date), new Date(task.start_date));
        const newStartDate = addDays(new Date(task.start_date), daysChanged);
        const newEndDate = addDays(newStartDate, duration);

        onUpdateTask(task.task_id, {
            start_date: newStartDate.toISOString(),
            end_date: newEndDate.toISOString()
        });
    };

    if (!taskPosition) return null;

    const overdue = new Date() > new Date(task.end_date) && task.status !== 'Completed';
    const isTimerActiveForThisTask = activeTimer?.taskId === task.task_id;

    return (
        <motion.div
            className="absolute h-10 flex items-center"
            style={{ left: taskPosition.x, width: taskPosition.width, top: taskPosition.y }}
            drag={canEdit ? "x" : false}
            dragMomentum={false}
            onDragEnd={handleDrag}
            dragConstraints={timelineContainerRef}
            dragElastic={0}
        >
            <div className={cn(
                "h-6 w-full rounded flex items-center justify-between px-2 text-white text-xs relative overflow-hidden",
                canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
                getStatusColor(task.status),
                overdue && 'ring-2 ring-red-500 ring-offset-1'
            )}>
                 <div style={{ width: `${task.percent_complete}%`}} className="absolute left-0 top-0 h-full bg-black/25 rounded-l-md pointer-events-none"></div>
                 <span className="relative truncate font-semibold">{task.task_name}</span>
                 <div className="flex items-center gap-1">
                    {isTimerActiveForThisTask && <Clock className="h-3 w-3 animate-pulse" />}
                    <span className="relative">{task.percent_complete}%</span>
                 </div>
            </div>
            
            {canEdit && <Resizable
                className="absolute right-0 top-0 h-full w-2 cursor-ew-resize z-10"
                size={{ width: 8, height: '100%' }}
                onResizeStop={(e, dir, ref, d) => {
                    const daysChanged = Math.round(d.width / dayWidth);
                    if (daysChanged === 0) return;
                    const newEndDate = addDays(new Date(task.end_date), daysChanged);
                    onUpdateTask(task.task_id, { end_date: newEndDate.toISOString() });
                }}
                enable={{ right: true }}
                handleComponent={{ right: <div className="w-2 h-full bg-black/20 rounded-r-md hover:bg-black/40" /> }}
            />}
            {task.is_milestone && (
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-500 transform rotate-45" />
            )}
        </motion.div>
    );
};

const GanttTask = (props) => <GanttTaskGrid {...props} />;
GanttTask.Bar = GanttTaskBar;

export default GanttTask;