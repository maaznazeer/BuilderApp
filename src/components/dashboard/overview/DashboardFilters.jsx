import React from 'react';
import { useQuery } from 'react-query';
import { useDashboard } from '@/contexts/DashboardContext';
import { supabase } from '@/lib/customSupabaseClient';
import HBox from '@/components/dashboard/overview/HBox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import NumberInput from '@/components/ui/number-input';
import Chips from '@/components/ui/chips';
import { Switch } from '@/components/ui/switch';

const fetchProjects = async () => {
    const { data, error } = await supabase.rpc('get_user_projects');
    if (error) {
        throw new Error(error.message);
    }
    return (data || []).map(p => ({ label: p.project_name, value: p.id }));
};

const DashboardFilters = () => {
    const { 
        scope, setScope, 
        selectedProjectId, setSelectedProjectId, 
        windowDays, setWindowDays,
        statusFilter, setStatusFilter,
        onlyMine, setOnlyMine
    } = useDashboard();
    
    const { data: projectsOptions, isLoading: isLoadingProjects } = useQuery('projects_options', fetchProjects);

    const scopeOptions = [
        { label: "Workspace", value: "global" },
        { label: "Project", value: "project" }
    ];

    const statusFilterOptions = [
      {label: "All", value: "all"},
      {label: "Unassigned", value: "unassigned"},
      {label: "In Progress", value: "inprogress"},
      {label: "Completed", value: "completed"}
    ];

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <HBox gap={8}>
                <div>
                    <Label htmlFor="scope_select" className="text-sm font-medium text-muted-foreground">Scope</Label>
                    <Select id="scope_select" value={scope} onValueChange={setScope}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select scope" />
                        </SelectTrigger>
                        <SelectContent>
                            {scopeOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="project_select" className="text-sm font-medium text-muted-foreground">Project</Label>
                    <Select
                        id="project_select"
                        value={selectedProjectId || ''}
                        onValueChange={setSelectedProjectId}
                        disabled={scope !== 'project' || isLoadingProjects}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                            {projectsOptions?.map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="window_days" className="text-sm font-medium text-muted-foreground">Window (days)</Label>
                    <NumberInput
                        id="window_days"
                        min={1}
                        max={30}
                        value={windowDays}
                        onValueChange={(value) => setWindowDays(value)}
                    />
                </div>
            </HBox>
            <HBox gap={4}>
                <div>
                    <Chips
                        id="status_filter"
                        options={statusFilterOptions}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="only_mine"
                        checked={onlyMine}
                        onCheckedChange={setOnlyMine}
                    />
                    <Label htmlFor="only_mine">Only my tasks</Label>
                </div>
            </HBox>
        </div>
    );
};

export default DashboardFilters;