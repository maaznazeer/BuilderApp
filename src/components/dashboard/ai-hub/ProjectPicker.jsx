import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const ProjectPicker = ({ id, projects, onSelect, isLoading, selectedProject }) => {
    return (
        <>
            {isLoading ? (
                <Skeleton className="h-10 w-full" />
            ) : (
                <Select id={id} onValueChange={onSelect} value={selectedProject || ""}>
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
        </>
    );
};

export default ProjectPicker;