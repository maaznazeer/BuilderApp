import React from 'react';
import { useDrop } from 'react-dnd';
import { cn } from '@/lib/utils';

const ItemType = 'TASK_CHIP';

const DroppableCell = ({ resourceId, onDrop, children, className }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemType,
        drop: (item) => onDrop(item.id, resourceId),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    }));

    const isActive = isOver && canDrop;

    return (
        <td
            ref={drop}
            className={cn(className, 
                'transition-colors duration-200',
                isActive ? 'bg-green-200' : '',
                canDrop && !isActive ? 'bg-blue-50' : ''
            )}
        >
            {children}
        </td>
    );
};

export default DroppableCell;