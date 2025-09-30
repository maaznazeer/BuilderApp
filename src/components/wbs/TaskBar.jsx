import React from 'react';
import { addDays, format } from 'date-fns';
import { useDraggable } from '@dnd-kit/core';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Link2 } from 'lucide-react';

const statusConfig = {
  "Not Started": {
    barClass: "bg-gray-400/80 border-gray-500",
    progressClass: "bg-gray-500"
  },
  "In Progress": {
    barClass: "bg-primary/80 border-primary-dark",
    progressClass: "bg-primary"
  },
  "Done": {
    barClass: "bg-green-500/80 border-green-600",
    progressClass: "bg-green-600"
  },
  "Completed": {
    barClass: "bg-green-500/80 border-green-600",
    progressClass: "bg-green-600"
  },
  "Delayed": {
    barClass: "bg-red-500/80 border-red-600",
    progressClass: "bg-red-600"
  },
  "On Hold": {
    barClass: "bg-yellow-500/80 border-yellow-600",
    progressClass: "bg-yellow-600"
  },
  "Summary": {
    barClass: "bg-gray-800 h-2.5 top-[11px] rounded-full border-none",
  }
};

const TaskBar = ({ task, baseStartDate, dayWidth, style, onDependenciesClick, onDoubleClick, isMobile }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `${task.id}-move`,
        data: { type: 'move', originalTask: task },
    });

    const { attributes: resizeAttributes, listeners: resizeListeners, setNodeRef: setResizeNodeRef } = useDraggable({
        id: `${task.id}-resize`,
        data: { type: 'resize', originalTask: task },
    });

    const draggableStyle = transform ? {
        transform: `translate3d(${transform.x}px, 0, 0)`,
    } : undefined;

  const barHeight = isMobile ? '36px' : '24px';
  const tapTargetSize = isMobile ? '44px' : undefined;

  if (task.type === 'Summary') {
    let minOffset = Infinity;
    let maxOffset = -Infinity;

    const findMinMax = (summaryTask, allTasks) => {
        const childrenWBS = allTasks.filter(t => t.wbs.startsWith(summaryTask.wbs + '.') && t.wbs.split('.').length > summaryTask.wbs.split('.').length);
        
        childrenWBS.forEach(child => {
            if (child.type !== 'Summary') {
                minOffset = Math.min(minOffset, child.start_offset_days);
                maxOffset = Math.max(maxOffset, child.end_offset_days);
            }
        });
    };

    findMinMax(task, task.allTasks || []);

    if (minOffset === Infinity || !isFinite(minOffset)) return null;

    const left = minOffset * dayWidth;
    const width = (maxOffset - minOffset + 1) * dayWidth;
    
    return (
       <div
        style={{ ...style, left: `${left}px`, width: `${width}px`, height: barHeight }}
        className={cn("absolute top-0", statusConfig.Summary.barClass)}
      />
    );
  }

  const isMilestone = task.type === 'Milestone' || task.duration_days === 0;
  const start = addDays(baseStartDate, task.start_offset_days);
  const end = addDays(baseStartDate, task.end_offset_days);
  
  const left = task.start_offset_days * dayWidth;
  const width = isMilestone ? dayWidth : (task.duration_days || 1) * dayWidth;

  const config = statusConfig[task.status] || statusConfig["Not Started"];

  const barContent = (
    <div
      ref={setNodeRef}
      style={{ ...style, ...draggableStyle, left: `${left}px`, width: `${width}px`, height: tapTargetSize || barHeight }}
      className={cn("absolute flex items-center group cursor-move transition-all duration-300", isDragging && 'z-50 shadow-lg')}
      {...listeners}
      {...attributes}
      onDoubleClick={() => onDoubleClick(task)}
    >
      <div
          style={{ height: barHeight }}
          className={cn("w-full flex items-center",
            isMilestone ? 'h-6 w-6 transform rotate-45 -translate-y-px' : 'rounded-md border',
            config.barClass
          )}
      >
        {isMilestone ? (
            <div className="w-full h-full bg-background transform" />
        ) : (
            <>
            <div className="absolute left-0 -translate-x-full pr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); onDependenciesClick(task); }}>
                <Link2 className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
            <div className="relative w-full h-full overflow-hidden rounded-sm">
                <div className={cn("h-full", config.progressClass)} style={{ width: `${task.percent_complete || 0}%` }} />
            </div>
            <div
                ref={setResizeNodeRef}
                {...resizeListeners}
                {...resizeAttributes}
                className="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
            />
            </>
        )}
      </div>
    </div>
  );

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{barContent}</TooltipTrigger>
        <TooltipContent>
          <div className="p-1">
            <p className="font-bold">{task.name}</p>
            {task.phase && <p className="text-sm text-muted-foreground">Phase: {task.phase}</p>}
            <p className="text-sm text-muted-foreground">
              {format(start, 'MMM d')} - {format(end, 'MMM d')}
            </p>
            <p className="text-sm text-muted-foreground">Duration: {task.duration_days} days</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TaskBar;