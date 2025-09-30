import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, User, Truck, Building, Box, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const ResourceIcon = ({ type }) => {
    const icons = {
        Person: <User className="h-4 w-4" />,
        Equipment: <Truck className="h-4 w-4" />,
        Facility: <Building className="h-4 w-4" />,
        Material: <Box className="h-4 w-4" />,
        Budget: <DollarSign className="h-4 w-4" />,
    };
    return icons[type] || <User className="h-4 w-4" />;
};

const ResourcesList = ({ resources, loading, onSelectResource, selectedResourceId, onEditResource, canEdit }) => {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>All Resources</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-0">
                <ScrollArea className="h-full">
                    <div className="p-4">
                        {loading ? (
                            <div className="text-center text-muted-foreground">Loading...</div>
                        ) : resources.length === 0 ? (
                            <p className="text-muted-foreground text-center">No resources found.</p>
                        ) : (
                            <ul className="space-y-2">
                                {resources.map(resource => (
                                    <li
                                        key={resource.resource_id}
                                        className={cn(
                                            "p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors",
                                            selectedResourceId === resource.resource_id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                        )}
                                        onClick={() => onSelectResource(resource)}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                                                <ResourceIcon type={resource.type} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-semibold truncate">{resource.resource_name}</p>
                                                <p className="text-sm text-muted-foreground">{resource.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Badge variant={resource.active ? 'default' : 'secondary'}>
                                                {resource.active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            {canEdit && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onEditResource(resource); }}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default ResourcesList;