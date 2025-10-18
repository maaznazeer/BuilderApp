import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, SlidersHorizontal, BookCopy, Filter, X } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const GanttToolbar = ({ projects, selectedProject, onSelectProject, onAddTask, onSetBaseline, onUseTemplate, permissions, filters, onFiltersChange }) => {
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
                        {projects.map(p => {
                            const projectId = p.id || p.project_id;
                            return (
                                <SelectItem key={projectId} value={projectId}>{p.name}</SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {renderButtonWithTooltip(
                    onAddTask,
                    !selectedProject,
                    "Select a project first",
                    <><Plus className="mr-2 h-4 w-4" /> Add Task</>
                )}
                
                {/* {renderButtonWithTooltip(
                    onUseTemplate,
                    !selectedProject,
                    "Select a project first",
                    <><BookCopy className="mr-2 h-4 w-4" /> Use Template</>
                )} */}

                {/* <Button variant="outline" onClick={onSetBaseline} disabled={!selectedProject}>
                    Set Baseline
                </Button> */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="relative">
                            <Filter className="h-4 w-4" />
                            {(filters?.status?.length > 0 || filters?.milestone) && (
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                    {(filters?.status?.length || 0) + (filters?.milestone ? 1 : 0)}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">Filter Tasks</h4>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => onFiltersChange({ status: [], milestone: false })}
                                    className="text-xs"
                                >
                                    Clear All
                                </Button>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <div className="mt-2 space-y-2">
                                        {['Not Started', 'In Progress', 'Completed', 'Delayed'].map(status => (
                                            <div key={status} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`status-${status}`}
                                                    checked={filters?.status?.includes(status) || false}
                                                    onCheckedChange={(checked) => {
                                                        const currentStatus = filters?.status || [];
                                                        const newStatus = checked 
                                                            ? [...currentStatus, status]
                                                            : currentStatus.filter(s => s !== status);
                                                        onFiltersChange({ ...filters, status: newStatus });
                                                    }}
                                                />
                                                <Label htmlFor={`status-${status}`} className="text-sm">{status}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="milestone"
                                            checked={filters?.milestone || false}
                                            onCheckedChange={(checked) => onFiltersChange({ ...filters, milestone: checked })}
                                        />
                                        <Label htmlFor="milestone" className="text-sm">Milestones Only</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};

export default GanttToolbar;