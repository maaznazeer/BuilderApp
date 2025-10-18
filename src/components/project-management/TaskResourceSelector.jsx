import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Users, Clock, DollarSign } from 'lucide-react';

const TaskResourceSelector = ({ taskId, onResourcesChange, initialResources = [] }) => {
    const [resources, setResources] = useState([]);
    const [selectedResources, setSelectedResources] = useState(initialResources);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchResources = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .eq('active', true)
                .order('resource_name');

            if (error) throw error;
            setResources(data || []);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error fetching resources',
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const filteredResources = resources.filter(resource =>
        resource.resource_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleResource = (resource) => {
        const existingIndex = selectedResources.findIndex(sr => sr.resource_id === resource.resource_id);
        
        if (existingIndex >= 0) {
            // Remove resource
            const updatedResources = selectedResources.filter(sr => sr.resource_id !== resource.resource_id);
            setSelectedResources(updatedResources);
            onResourcesChange(updatedResources);
        } else {
            // Add resource
            const newResource = {
                resource_id: resource.resource_id,
                resource_name: resource.resource_name,
                type: resource.type,
                hourly_rate: resource.hourly_rate,
                allocation_percent: 100,
                notes: ''
            };

            const updatedResources = [...selectedResources, newResource];
            setSelectedResources(updatedResources);
            onResourcesChange(updatedResources);
        }
    };

    const updateResource = (resourceId, field, value) => {
        const updatedResources = selectedResources.map(sr => 
            sr.resource_id === resourceId 
                ? { ...sr, [field]: value }
                : sr
        );
        setSelectedResources(updatedResources);
        onResourcesChange(updatedResources);
    };

    const removeResource = (resourceId) => {
        const updatedResources = selectedResources.filter(sr => sr.resource_id !== resourceId);
        setSelectedResources(updatedResources);
        onResourcesChange(updatedResources);
    };

    const getResourceTypeColor = (type) => {
        switch (type) {
            case 'Person': return 'bg-blue-100 text-blue-800';
            case 'Equipment': return 'bg-green-100 text-green-800';
            case 'Vehicle': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-sm font-medium">Assigned Resources</Label>
                <p className="text-xs text-muted-foreground">
                    Select resources to assign to this task and set allocation percentages.
                </p>
            </div>

            {/* Search Resources */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Available Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Input
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    
                    <ScrollArea className="h-48">
                        <div className="space-y-2">
                            {filteredResources.map(resource => {
                                const isSelected = selectedResources.some(sr => sr.resource_id === resource.resource_id);
                                return (
                                    <div
                                        key={resource.resource_id}
                                        className={`flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 ${
                                            isSelected ? 'bg-blue-50 border-blue-200' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleResource(resource)}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{resource.resource_name}</span>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`text-xs ${getResourceTypeColor(resource.type)}`}
                                                    >
                                                        {resource.type}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Rate: ${resource.hourly_rate || 0}/hour
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Selected Resources */}
            {selectedResources.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Selected Resources ({selectedResources.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {selectedResources.map((resource, index) => (
                            <div key={resource.resource_id} className="p-3 border rounded-md">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{resource.resource_name}</span>
                                            <Badge 
                                                variant="outline" 
                                                className={`text-xs ${getResourceTypeColor(resource.type)}`}
                                            >
                                                {resource.type}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Rate: ${resource.hourly_rate || 0}/hour
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeResource(resource.resource_id)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor={`allocation-${index}`} className="text-xs">
                                            Allocation %
                                        </Label>
                                        <Input
                                            id={`allocation-${index}`}
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={resource.allocation_percent}
                                            onChange={(e) => updateResource(
                                                resource.resource_id, 
                                                'allocation_percent', 
                                                parseInt(e.target.value) || 0
                                            )}
                                            className="text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor={`rate-${index}`} className="text-xs">
                                            Hourly Rate
                                        </Label>
                                        <Input
                                            id={`rate-${index}`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={resource.hourly_rate}
                                            onChange={(e) => updateResource(
                                                resource.resource_id, 
                                                'hourly_rate', 
                                                parseFloat(e.target.value) || 0
                                            )}
                                            className="text-xs"
                                        />
                                    </div>
                                </div>
                                
                                <div className="mt-2">
                                    <Label htmlFor={`notes-${index}`} className="text-xs">
                                        Notes (Optional)
                                    </Label>
                                    <Input
                                        id={`notes-${index}`}
                                        placeholder="Additional notes..."
                                        value={resource.notes}
                                        onChange={(e) => updateResource(
                                            resource.resource_id, 
                                            'notes', 
                                            e.target.value
                                        )}
                                        className="text-xs"
                                    />
                                </div>
                                
                                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Allocation: {resource.allocation_percent}%
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        Rate: ${resource.hourly_rate || 0}/hr
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TaskResourceSelector;
