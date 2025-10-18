import React, { useState, useMemo, useRef } from 'react';
import { format, differenceInDays, addDays } from 'date-fns';
import GanttTask from './GanttTask';
import { Resizable } from 're-resizable';
import { motion } from 'framer-motion';

const getStatusColor = (status) => {
    switch (status) {
        case 'Completed': return 'bg-green-500';
        case 'In Progress': return 'bg-blue-500';
        case 'Delayed': return 'bg-red-500';
        default: return 'bg-gray-400';
    }
};

const GanttHeader = ({ timeRange, gridWidth }) => {
    const months = [];
    let currentDate = new Date(timeRange.start);

    while (currentDate <= timeRange.end) {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const nextMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        const daysInMonth = differenceInDays(nextMonthStart > timeRange.end ? timeRange.end : nextMonthStart, monthStart);
        
        months.push({
            name: format(currentDate, 'MMMM yyyy'),
            days: daysInMonth > 0 ? daysInMonth : 1,
        });
        currentDate = nextMonthStart;
    }

    return (
        <div className="sticky top-0 z-20 flex bg-gray-100 border-b-2 border-gray-300 h-12">
            <div style={{ width: `${gridWidth}px` }} className="flex-shrink-0 p-2 border-r border-gray-200 flex items-center">
                <h3 className="font-semibold text-gray-700">Task Name</h3>
            </div>
            <div className="flex-grow flex">
                {months.map((month, i) => (
                    <div key={i} className="flex-shrink-0 text-center border-r border-gray-200 flex items-center justify-center" style={{ width: `${month.days * 30}px` }}>
                        <div className="p-2 text-sm font-medium text-gray-600">{month.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const GanttChart = ({ tasks, dependencies, onUpdateTask, onDeleteTask, findTask, moveTask, onLogTime, onToggleTimer, activeTimer, permissions }) => {
    const [gridWidth, setGridWidth] = useState(400);

    const timeRange = useMemo(() => {
        if (tasks.length === 0) {
            const today = new Date();
            return { start: addDays(today, -30), end: addDays(today, 30) };
        }
        const startDates = tasks.map(t => new Date(t.start_date));
        const endDates = tasks.map(t => new Date(t.end_date));
        const minDate = new Date(Math.min.apply(null, startDates));
        const maxDate = new Date(Math.max.apply(null, endDates));

        return {
            start: addDays(minDate, -7),
            end: addDays(maxDate, 14),
        };
    }, [tasks]);

    const totalDays = differenceInDays(timeRange.end, timeRange.start) + 1;
    const dayWidth = 30;
    
    const taskPositions = useMemo(() => {
        const positions = {};
        tasks.forEach((task, index) => {
            const startDate = new Date(task.start_date);
            const endDate = new Date(task.end_date);
            const startOffset = differenceInDays(startDate, timeRange.start);
            const duration = differenceInDays(endDate, startDate) + 1;
            
            positions[task.task_id] = {
                y: index * 40,
                x: startOffset * dayWidth,
                width: duration * dayWidth,
            };
        });
        return positions;
    }, [tasks, timeRange.start, dayWidth]);
    
    const timelineContainerRef = useRef(null);

    return (
        <div className="relative overflow-x-auto border rounded-lg bg-white" style={{ maxHeight: '70vh' }}>
            <GanttHeader timeRange={timeRange} gridWidth={gridWidth} />
            <div className="relative flex" style={{ height: `${tasks.length * 40}px` }}>
                <Resizable
                    as="div"
                    className="flex-shrink-0 border-r border-gray-200 bg-white z-10"
                    size={{ width: gridWidth, height: '100%' }}
                    onResizeStop={(e, direction, ref, d) => {
                        setGridWidth(gridWidth + d.width);
                    }}
                    minWidth={250}
                    maxWidth={800}
                    enable={{ right: true }}
                >
                    {tasks.map((task, index) => (
                       <GanttTask
                            key={task.task_id}
                            id={task.task_id}
                            task={task}
                            index={index}
                            findTask={findTask}
                            moveTask={moveTask}
                            onUpdateTask={onUpdateTask}
                            onDeleteTask={onDeleteTask}
                            gridWidth={gridWidth}
                            onLogTime={onLogTime}
                            onToggleTimer={onToggleTimer}
                            activeTimer={activeTimer}
                            permissions={permissions}
                       />
                    ))}
                </Resizable>
                <div ref={timelineContainerRef} className="relative flex-grow h-full" style={{ width: totalDays * dayWidth }}>
                     {/* Vertical grid lines */}
                    {Array.from({ length: totalDays }).map((_, i) => (
                        <div key={i} className="absolute top-0 bottom-0 border-l border-gray-200/70" style={{ left: `${i * dayWidth}px`, zIndex: 0 }}></div>
                    ))}
                     {/* Horizontal grid lines */}
                    {tasks.map((_, i) => (
                        <div key={i} className="absolute left-0 right-0 border-b border-gray-200/70" style={{ top: `${(i + 1) * 40}px`, zIndex: 0 }}></div>
                    ))}
                    {/* Task Bars */}
                    {tasks.map((task) => (
                        <GanttTask.Bar
                            key={task.task_id}
                            task={task}
                            onUpdateTask={onUpdateTask}
                            taskPosition={taskPositions[task.task_id]}
                            dayWidth={dayWidth}
                            getStatusColor={getStatusColor}
                            timelineContainerRef={timelineContainerRef}
                            activeTimer={activeTimer}
                            permissions={permissions}
                        />
                    ))}
                    {/* Dependencies */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                        <defs>
                            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5"
                                markerWidth="6" markerHeight="6"
                                orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
                            </marker>
                        </defs>
                        {dependencies.map(dep => {
                            const fromTaskPos = taskPositions[dep.predecessor_task_id];
                            const toTaskPos = taskPositions[dep.task_id];
                            if (!fromTaskPos || !toTaskPos) return null;

                            const x1 = fromTaskPos.x + fromTaskPos.width;
                            const y1 = fromTaskPos.y + 20; 
                            const x2 = toTaskPos.x - 8;
                            const y2 = toTaskPos.y + 20;
                            
                            const controlX = x1 + 20;
                            
                            return (
                                <motion.path
                                  key={dep.id}
                                  d={`M ${x1} ${y1} C ${controlX} ${y1}, ${x2 - 20} ${y2}, ${x2} ${y2}`}
                                  stroke="#4f46e5"
                                  strokeWidth="1.5"
                                  fill="none"
                                  markerEnd="url(#arrow)"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.5, ease: "easeInOut" }}
                                />
                            );
                        })}
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default GanttChart;