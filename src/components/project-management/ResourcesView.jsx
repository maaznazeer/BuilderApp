import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import AddResourceDialog from './AddResourceDialog';
import ResourcesList from './ResourcesList';
import ResourceDetailPanel from './ResourceDetailPanel';
import { useProjectManagementPermissions } from '@/hooks/useProjectManagementPermissions';

const ResourcesView = () => {
    const [resources, setResources] = useState([]);
    const [calendars, setCalendars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [editingResource, setEditingResource] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const permissions = useProjectManagementPermissions();

    const fetchResourcesAndCalendars = useCallback(async () => {
        setLoading(true);
        const { data: resourcesData, error: resourcesError } = await supabase
            .from('resources')
            .select('*, resource_calendars(calendar_id, name)');

        if (resourcesError) {
            toast({ variant: 'destructive', title: 'Error fetching resources', description: resourcesError.message });
        } else {
            setResources(resourcesData || []);
            if (!selectedResource && resourcesData && resourcesData.length > 0) {
              setSelectedResource(resourcesData[0]);
            }
        }

        const { data: calendarsData, error: calendarsError } = await supabase
            .from('resource_calendars')
            .select('*');

        if (calendarsError) {
            toast({ variant: 'destructive', title: 'Error fetching calendars', description: calendarsError.message });
        } else {
            setCalendars(calendarsData || []);
        }

        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchResourcesAndCalendars();
    }, [fetchResourcesAndCalendars]);

    const handleAddOrUpdateResource = async (resourceData, resourceId) => {
        let error, data;
        if (resourceId) {
            // Update
            ({ data, error } = await supabase.from('resources').update(resourceData).eq('resource_id', resourceId).select('*, resource_calendars(calendar_id, name)').single());
        } else {
            // Create
            ({ data, error } = await supabase.from('resources').insert(resourceData).select('*, resource_calendars(calendar_id, name)').single());
        }

        if (error) {
            toast({ variant: "destructive", title: "Failed to save resource", description: error.message });
        } else {
            toast({ title: `Resource ${resourceId ? 'updated' : 'added'} successfully!` });
            setIsAddResourceOpen(false);
            setEditingResource(null);
            await fetchResourcesAndCalendars();
            if(selectedResource?.resource_id === data.resource_id || !resourceId) {
              setSelectedResource(data);
            }
        }
    };

    const handleEditResource = (resource) => {
        setEditingResource(resource);
        setIsAddResourceOpen(true);
    };

    const handleAddNew = () => {
        setEditingResource(null);
        setIsAddResourceOpen(true);
    };

    const filteredResources = resources.filter(resource =>
        resource.resource_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search resources..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleAddNew} disabled={!permissions.canEditAssignments}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Resource
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-[65vh]">
                <div className="lg:col-span-1 xl:col-span-1">
                    <ResourcesList
                        resources={filteredResources}
                        loading={loading}
                        onSelectResource={setSelectedResource}
                        selectedResourceId={selectedResource?.resource_id}
                        onEditResource={handleEditResource}
                        canEdit={permissions.canEditAssignments}
                    />
                </div>
                <div className="lg:col-span-2 xl:col-span-3">
                    <ResourceDetailPanel resource={selectedResource} />
                </div>
            </div>
            <AddResourceDialog
                isOpen={isAddResourceOpen}
                onClose={() => {setIsAddResourceOpen(false); setEditingResource(null);}}
                onSave={handleAddOrUpdateResource}
                resource={editingResource}
                calendars={calendars}
            />
        </div>
    );
};

export default ResourcesView;