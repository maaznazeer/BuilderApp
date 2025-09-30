import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, SlidersHorizontal, BookCopy } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const GanttToolbar = ({ projects, selectedProject, onSelectProject, onAddTask, onSetBaseline, onUseTemplate, permissions }) => {
    const { toast } = useToast();

    const renderButtonWithTooltip = (onClick, disabled, disabledTooltip, children) => {
        if (disabled) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span tabIndex="0">
                                <Button onClick={onClick} disabled={disabled} className="pointer-events-none">
                                    {children}
                                </Button>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{disabledTooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }
        return <Button onClick={onClick}>{children}</Button>;
    };

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center gap-4">
                <Select value={selectedProject || ''} onValueChange={onSelectProject}>
                    <SelectTrigger className="w-[200px] bg-white">
                        <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                        {projects.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {renderButtonWithTooltip(
                    onAddTask,
                    !selectedProject || !permissions.canEditTasks,
                    !selectedProject ? "Select a project first" : "Permission required",
                    <><Plus className="mr-2 h-4 w-4" /> Add Task</>
                )}
                
                {renderButtonWithTooltip(
                    onUseTemplate,
                    !selectedProject || !permissions.canEditTasks,
                    !selectedProject ? "Select a project first" : "Permission required",
                    <><BookCopy className="mr-2 h-4 w-4" /> Use Template</>
                )}

                <Button variant="outline" onClick={onSetBaseline} disabled={!selectedProject || !permissions.canEditTasks}>
                    Set Baseline
                </Button>
                <Button variant="outline" size="icon" onClick={() => toast({ title: "Filter options coming soon!"})}>
                    <SlidersHorizontal className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default GanttToolbar;