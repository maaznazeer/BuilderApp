import React from 'react';
import { useDrag } from 'react-dnd';

const ItemType = 'TASK_CHIP';

const getStatusColor = (status) => {
    switch (status) {
        case 'Completed': return 'border-green-500 bg-green-100';
        case 'In Progress': return 'border-blue-500 bg-blue-100';
        case 'Delayed': return 'border-red-500 bg-red-100';
        default: return 'border-gray-400 bg-gray-100';
    }
};

const DraggableTask = ({ task }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemType,
        item: { id: task.task_id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            className={`p-1.5 text-xs rounded-md border ${getStatusColor(task.status)} cursor-move ${isDragging ? 'opacity-50' : 'opacity-100'}`}
            title={task.task_name}
        >
            <p className="font-semibold truncate">{task.task_name}</p>
        </div>
    );
};

export default DraggableTask;