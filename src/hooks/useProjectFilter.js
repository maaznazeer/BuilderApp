import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useProjectFilter = (data = [], filterKey = 'project_code') => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [filteredData, setFilteredData] = useState([]);

  const fetchProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, code')
        .order('name', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  }, []);

  // Filter data based on selected project
  useEffect(() => {
    if (selectedProject === 'all') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => {
        // Handle different filter key patterns
        if (filterKey === 'project_code') {
          return item.project_code === selectedProject;
        } else if (filterKey === 'project_id') {
          return item.project_id === selectedProject;
        } else if (filterKey === 'worker_projects') {
          // Special case for workers with project relationships
          return item.worker_projects?.some(wp => wp.project_code === selectedProject);
        } else {
          // Generic filter
          return item[filterKey] === selectedProject;
        }
      });
      setFilteredData(filtered);
    }
  }, [data, selectedProject, filterKey]);

  const handleProjectFilter = (projectCode) => {
    setSelectedProject(projectCode);
  };

  const clearFilter = () => {
    setSelectedProject('all');
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    selectedProject,
    filteredData,
    handleProjectFilter,
    clearFilter,
    isFiltered: selectedProject !== 'all'
  };
};
