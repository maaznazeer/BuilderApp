import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const ProjectFilters = () => {
    const { projects, selectedProject, setSelectedProject, loading } = useProject();

    if (loading) {
        return <Skeleton className="h-10 w-full md:w-64" />;
    }

    const handleProjectChange = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            setSelectedProject(project);
        }
    };
    
    return (
        <div className="flex items-center space-x-4">
             <Select
                value={selectedProject?.id || ''}
                onValueChange={handleProjectChange}
                disabled={projects.length === 0}
            >
                <SelectTrigger className="w-full md:w-64 bg-background">
                    <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                    {projects.length > 0 ? (
                        projects.map(project => (
                            <SelectItem key={project.id} value={project.id}>
                                {project.name}
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="no-projects" disabled>No projects found</SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
};

export default ProjectFilters;