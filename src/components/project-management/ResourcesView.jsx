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
    const [deletingResource, setDeletingResource] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

    const handleDeleteResource = (resource) => {
        setDeletingResource(resource);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteResource = async () => {
        if (!deletingResource) return;
        
        try {
            // First check if resource is being used in any task assignments
            const { data: taskAssignments, error: taskError } = await supabase
                .from('task_assignments')
                .select('id, task_id')
                .eq('resource_id', deletingResource.resource_id)
                .limit(1);

            if (taskError) throw taskError;

            if (taskAssignments && taskAssignments.length > 0) {
                toast({
                    variant: 'destructive',
                    title: 'Cannot Delete Resource',
                    description: 'This resource is currently assigned to tasks. Please remove it from all tasks before deleting.',
                });
                return;
            }

            // Check if resource is being used in any task materials (if resource_id exists in task_materials)
            const { data: taskMaterials, error: materialError } = await supabase
                .from('task_materials')
                .select('id, task_id')
                .eq('resource_id', deletingResource.resource_id)
                .limit(1);

            if (materialError) {
                // If the column doesn't exist, that's fine - just continue
                console.log('task_materials.resource_id column may not exist:', materialError.message);
            } else if (taskMaterials && taskMaterials.length > 0) {
                toast({
                    variant: 'destructive',
                    title: 'Cannot Delete Resource',
                    description: 'This resource is currently used in task materials. Please remove it from all materials before deleting.',
                });
                return;
            }

            // Check if resource has any calendar associations
            const { data: resourceCalendars, error: calendarError } = await supabase
                .from('resource_calendars')
                .select('id')
                .eq('resource_id', deletingResource.resource_id)
                .limit(1);

            if (calendarError) {
                console.log('Error checking resource calendars:', calendarError.message);
            } else if (resourceCalendars && resourceCalendars.length > 0) {
                toast({
                    variant: 'destructive',
                    title: 'Cannot Delete Resource',
                    description: 'This resource is associated with calendars. Please remove calendar associations before deleting.',
                });
                return;
            }

            // Delete the resource
            const { error } = await supabase
                .from('resources')
                .delete()
                .eq('resource_id', deletingResource.resource_id);

            if (error) {
                // Check if it's a foreign key constraint error
                if (error.message.includes('foreign key constraint') || error.message.includes('violates foreign key')) {
                    toast({
                        variant: 'destructive',
                        title: 'Cannot Delete Resource',
                        description: 'This resource is still being referenced by other records. Please remove all references before deleting.',
                    });
                    return;
                }
                throw error;
            }

            toast({
                title: 'Resource Deleted',
                description: `Resource "${deletingResource.resource_name}" has been deleted successfully.`,
            });

            // Clear selection if the deleted resource was selected
            if (selectedResource?.resource_id === deletingResource.resource_id) {
                setSelectedResource(null);
            }

            // Refresh the resources list
            await fetchResourcesAndCalendars();
            
            // Close dialog
            setIsDeleteDialogOpen(false);
            setDeletingResource(null);

        } catch (error) {
            console.error('Error deleting resource:', error);
            toast({
                variant: 'destructive',
                title: 'Error deleting resource',
                description: error.message,
            });
        }
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
                        onDeleteResource={handleDeleteResource}
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

            {/* Delete Confirmation Dialog */}
            {isDeleteDialogOpen && deletingResource && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete the resource <span className="font-semibold">"{deletingResource.resource_name}"</span>? 
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    setDeletingResource(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={confirmDeleteResource}
                            >
                                Delete Resource
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourcesView;