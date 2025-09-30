import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/contexts/DashboardContext.jsx';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const widgetNames = {
    kpiStrip: 'KPI Strip',
    insightsZone: 'Insights Zone',
    operationsZone: 'Operations Zone',
    strategicOverview: 'Strategic Overview',
};

const SortableItem = ({ id, name, visible, onToggle }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-4">
                <button {...attributes} {...listeners} className="cursor-grab touch-none p-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>
                <Label htmlFor={`switch-${id}`} className="font-medium text-lg">{name}</Label>
            </div>
            <div className="flex items-center gap-2">
                {visible ? <Eye className="h-5 w-5 text-success"/> : <EyeOff className="h-5 w-5 text-muted-foreground"/>}
                <Switch
                    id={`switch-${id}`}
                    checked={visible}
                    onCheckedChange={() => onToggle(id)}
                />
            </div>
        </div>
    );
};

const CustomizeDashboardDialog = ({ isOpen, onOpenChange }) => {
    const { layoutConfig, setLayoutConfig } = useDashboard();
    const [localLayout, setLocalLayout] = useState(layoutConfig);

    useEffect(() => {
        setLocalLayout(layoutConfig);
    }, [layoutConfig, isOpen]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleToggleVisibility = (id) => {
        setLocalLayout(prev =>
            prev.map(widget =>
                widget.id === id ? { ...widget, visible: !widget.visible } : widget
            )
        );
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setLocalLayout(items => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSaveChanges = () => {
        setLayoutConfig(localLayout);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Customize Dashboard</DialogTitle>
                    <DialogDescription>
                        Toggle visibility and reorder the widgets on your dashboard.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={localLayout.map(item => item.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {localLayout.map(widget => (
                                    <SortableItem
                                        key={widget.id}
                                        id={widget.id}
                                        name={widgetNames[widget.id]}
                                        visible={widget.visible}
                                        onToggle={handleToggleVisibility}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="button" onClick={handleSaveChanges}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CustomizeDashboardDialog;