import React, { useMemo, useState, useCallback } from 'react';
import { addDays, differenceInDays, format, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import TaskBar from '@/components/wbs/TaskBar';
import DependencyLines from '@/components/wbs/DependencyLines';
import DependencyPanel from '@/components/wbs/DependencyPanel';
import EditTaskDialog from '@/components/wbs/EditTaskDialog';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

const TimeGrid = ({ baseStartDate, timescaleWeeks, tasks, isLoading, onUpdateTask, autoSchedule, isMobile }) => {
  const today = startOfDay(new Date());
  const [selectedTaskForDeps, setSelectedTaskForDeps] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const dayWidth = 35;
  const rowHeight = isMobile ? 44 : 36;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { weeks, totalDays, totalWidth } = useMemo(() => {
    const weeks = [];
    const totalDays = timescaleWeeks * 7;
    for (let i = 0; i < timescaleWeeks; i++) {
      weeks.push({
        label: `W${i + 1}`,
        startDate: addDays(baseStartDate, i * 7),
      });
    }
    const totalWidthValue = totalDays * dayWidth;
    return { weeks, totalDays, totalWidth: `${totalWidthValue}px` };
  }, [baseStartDate, timescaleWeeks]);

  const todayOffset = useMemo(() => {
    return differenceInDays(today, baseStartDate);
  }, [today, baseStartDate]);

  const { flatTaskList, height } = useMemo(() => {
    if (!tasks || tasks.length === 0) return { flatTaskList: [], height: 100 };

    const taskMap = new Map(tasks.map(task => [task.wbs, { ...task, children: [] }]));
    const roots = [];

    const sortedTasks = [...tasks].sort((a, b) => a.wbs.localeCompare(b.wbs, undefined, { numeric: true }));

    sortedTasks.forEach(task => {
      const node = taskMap.get(task.wbs);
      if (!node) return;
      const parentWbs = task.wbs.substring(0, task.wbs.lastIndexOf('.'));
      if (parentWbs && taskMap.has(parentWbs)) {
        const parentNode = taskMap.get(parentWbs);
        if (parentNode) {
            parentNode.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    const flatList = [];
    const traverse = (nodes) => {
      nodes.forEach(node => {
        flatList.push({ ...node, allTasks: tasks });
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(roots);

    return { flatTaskList: flatList, height: flatList.length * rowHeight + 40 };
  }, [tasks, rowHeight]);

  const handleDragEnd = useCallback((event) => {
    const { active, delta } = event;
    if (!active || delta.x === 0) return;

    const { type, originalTask } = active.data.current;
    const daysDragged = Math.round(delta.x / dayWidth);

    if (type === 'move') {
      const newStartOffset = originalTask.start_offset_days + daysDragged;
      const newEndOffset = originalTask.end_offset_days + daysDragged;
      onUpdateTask(originalTask.id, { start_offset_days: newStartOffset, end_offset_days: newEndOffset });
    } else if (type === 'resize') {
      const newDuration = Math.max(1, (originalTask.duration_days || 1) + daysDragged);
      const newEndOffset = originalTask.start_offset_days + newDuration - 1;
      onUpdateTask(originalTask.id, { duration_days: newDuration, end_offset_days: newEndOffset });
    }
  }, [dayWidth, onUpdateTask]);

  const getTaskPosition = (index) => ({
    top: `${index * rowHeight}px`,
  });

  const handleClosePanel = () => {
    setSelectedTaskForDeps(null);
  };

  const handleDoubleClick = (task) => {
    setEditingTask(task);
  };

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="relative" style={{ minWidth: totalWidth, minHeight: `${height}px` }}>
          <div className="sticky top-0 z-20 bg-background border-b">
            <div className="flex">
              {weeks.map((week, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 text-center border-r last:border-r-0"
                  style={{ width: `${7 * dayWidth}px` }}
                >
                  <div className="py-1 text-xs font-semibold text-muted-foreground">
                    {week.label}
                  </div>
                  <div className="py-1 text-xs text-muted-foreground border-t">
                    {format(week.startDate, 'MMM d')}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-full">
            <div className="absolute inset-0 flex z-0">
              {Array.from({ length: totalDays }).map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className={cn(
                    "h-full border-r",
                    (dayIndex + 1) % 7 === 0 ? "border-muted-foreground/20" : "border-muted/10",
                  )}
                  style={{ minWidth: `${dayWidth}px` }}
                />
              ))}
            </div>
            {todayOffset >= 0 && todayOffset < totalDays && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500/70 z-10"
                style={{ left: `${(todayOffset * dayWidth) + (dayWidth / 2)}px` }}
              >
                <div className="absolute -top-1 -translate-x-1/2 left-1/2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <div className="absolute -bottom-1 -translate-x-1/2 left-1/2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </div>
            )}
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-30">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <>
                <div className="absolute inset-0 z-10">
                  <DependencyLines tasks={flatTaskList} dayWidth={dayWidth} rowHeight={rowHeight} />
                </div>
                <div className="absolute inset-0 z-20">
                  {flatTaskList.map((task, index) => (
                    <TaskBar
                      key={task.id}
                      task={task}
                      baseStartDate={baseStartDate}
                      dayWidth={dayWidth}
                      style={getTaskPosition(index)}
                      onDependenciesClick={setSelectedTaskForDeps}
                      onDoubleClick={handleDoubleClick}
                      isMobile={isMobile}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          {selectedTaskForDeps && (
            <DependencyPanel
              task={selectedTaskForDeps}
              allTasks={tasks}
              onClose={handleClosePanel}
              updateAndSaveTask={onUpdateTask}
            />
          )}
        </div>
      </DndContext>
      {editingTask && (
        <EditTaskDialog
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          task={editingTask}
          onUpdateTask={onUpdateTask}
        />
      )}
    </>
  );
};

export default TimeGrid;