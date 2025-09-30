import React from 'react';

    const DependencyLines = ({ tasks, dayWidth, rowHeight }) => {
        const taskMap = new Map(tasks.map((task, index) => [String(task.wbs), { ...task, index }]));

        const lines = tasks.flatMap((task, taskIndex) => {
            if (!task.predecessors) return [];
            const predWbsList = task.predecessors.split(',').map(p => p.trim()).filter(Boolean);

            return predWbsList.map(predWbs => {
                const predTaskData = taskMap.get(predWbs);
                if (!predTaskData) return null;

                const predTask = predTaskData;
                const predIndex = predTaskData.index;

                const isMilestone = predTask.type === 'Milestone' || predTask.duration_days === 0;

                const startX = (predTask.end_offset_days + 1) * dayWidth - (isMilestone ? dayWidth / 2 : 0);
                const startY = (predIndex * rowHeight) + (rowHeight / 2);

                const endX = task.start_offset_days * dayWidth;
                const endY = (taskIndex * rowHeight) + (rowHeight / 2);

                const halfX = startX + 12;

                const pathData = `M ${startX} ${startY} H ${halfX} V ${endY} H ${endX}`;

                return (
                    <g key={`${predTask.id}-${task.id}`}>
                        <path
                            d={pathData}
                            stroke="hsl(var(--primary))"
                            strokeWidth="1.5"
                            fill="none"
                            markerEnd="url(#arrowhead)"
                        />
                    </g>
                );
            }).filter(Boolean);
        });

        return (
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    <marker
                        id="arrowhead"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--primary))" />
                    </marker>
                </defs>
                <g>{lines}</g>
            </svg>
        );
    };

    export default DependencyLines;