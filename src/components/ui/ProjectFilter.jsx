import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const ProjectFilter = ({ 
  projects = [], 
  selectedProject = 'all', 
  onProjectChange, 
  onClearFilter,
  showCount = true,
  filteredCount = 0,
  totalCount = 0,
  className = ""
}) => {
  const selectedProjectData = projects.find(p => p.code === selectedProject || p.id === selectedProject);
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedProject} onValueChange={onProjectChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.code || project.id}>
                {project.name} ({project.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedProject !== 'all' && (
        <Button variant="outline" size="sm" onClick={onClearFilter}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
      
      {selectedProject !== 'all' && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Filtered by: {selectedProjectData?.name || selectedProject}
          </Badge>
          {showCount && (
            <span className="text-sm text-muted-foreground">
              Showing {filteredCount} of {totalCount} items
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectFilter;
