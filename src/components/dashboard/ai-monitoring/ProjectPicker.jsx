import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const ProjectPicker = ({ projects, onSelect, isLoading, selectedProject }) => {
    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Select Project</CardTitle>
                <CardDescription>Choose a project to begin AI analysis.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-10 w-full" />
                ) : (
                    <Select onValueChange={onSelect} value={selectedProject || ""}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a project..." />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </CardContent>
        </Card>
    );
};

export default ProjectPicker;