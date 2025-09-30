import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
    import { useProjects } from '@/hooks/useProjects.js';
    import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
    import { useQueryClient } from 'react-query';

    const ProjectContext = createContext();

    export const ProjectProvider = ({ children }) => {
        const { user, loading: authLoading } = useAuth();
        const { data, error, loading, refetch } = useProjects(user?.id);
        const queryClient = useQueryClient();

        const [projects, setProjects] = useState([]);
        const [selectedProject, setSelectedProject] = useState(null);

        const handleSetSelectedProject = useCallback((project) => {
            setSelectedProject(project);
            if (project) {
                localStorage.setItem('selectedProjectId', project.id);
            } else {
                localStorage.removeItem('selectedProjectId');
            }
        }, []);

        const addAndSelectProject = useCallback(async (newProject) => {
            await refetch();
            handleSetSelectedProject(newProject);
        }, [handleSetSelectedProject, refetch]);


        useEffect(() => {
            if (data) {
                setProjects(data);
                const storedProjectId = localStorage.getItem('selectedProjectId');
                const projectFromState = selectedProject ? data.find(p => p.id === selectedProject.id) : null;
                
                if (projectFromState) {
                    setSelectedProject(projectFromState);
                } else if (storedProjectId) {
                    const projectFromStorage = data.find(p => p.id === storedProjectId);
                    if (projectFromStorage) {
                        setSelectedProject(projectFromStorage);
                    } else if (data.length > 0) {
                        setSelectedProject(data[0]);
                        localStorage.setItem('selectedProjectId', data[0].id);
                    } else {
                         setSelectedProject(null);
                        localStorage.removeItem('selectedProjectId');
                    }
                } else if (data.length > 0) {
                    setSelectedProject(data[0]);
                    localStorage.setItem('selectedProjectId', data[0].id);
                } else {
                    setSelectedProject(null);
                }
            } else if (!loading) {
                setProjects([]);
                setSelectedProject(null);
            }
        }, [data, loading, selectedProject]);

        const value = {
            projects,
            selectedProject,
            setSelectedProject: handleSetSelectedProject,
            loading: authLoading || loading,
            error,
            refreshProjects: refetch,
            addAndSelectProject
        };

        return (
            <ProjectContext.Provider value={value}>
                {children}
            </ProjectContext.Provider>
        );
    };

    export const useProject = () => {
        const context = useContext(ProjectContext);
        if (context === undefined) {
            throw new Error('useProject must be used within a ProjectProvider');
        }
        return context;
    };