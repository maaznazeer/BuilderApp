import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProjectsTable } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { PlusCircle, Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.js';
import ProjectsTable from '@/components/dashboard/projects-table/ProjectsTable';
import ProjectsTableFilters from '@/components/dashboard/projects-table/ProjectsTableFilters';

const EmptyState = ({ onAddProjectClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center h-full py-16"
    >
        <Card className="w-full max-w-lg text-center shadow-md">
            <CardHeader>
                <div className="mx-auto bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full h-20 w-20 flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold pt-4">No projects found</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-6">It looks like you haven't created any projects yet.</p>
                <Button onClick={onAddProjectClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Project
                </Button>
            </CardContent>
        </Card>
    </motion.div>
);

const ProjectsTab = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { data: projects, isLoading } = useProjectsTable();

    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        client: 'all',
        dateRange: { from: null, to: null },
    });

    const filterOptions = useMemo(() => {
        if (!projects) return { clients: [], statuses: [] };
        const uniqueClients = [...new Set(projects.map(p => p.client_name).filter(Boolean))];
        const uniqueStatuses = [...new Set(projects.map(p => p.status).filter(Boolean))];
        return { clients: uniqueClients, statuses: uniqueStatuses };
    }, [projects]);

    const filteredProjects = useMemo(() => {
        if (!projects) return [];
        return projects.filter(project => {
            const { search, status, client, dateRange } = filters;
            const lowerCaseSearch = search.toLowerCase();
            
            const searchMatch = !search ||
                project.project_code.toLowerCase().includes(lowerCaseSearch) ||
                project.name.toLowerCase().includes(lowerCaseSearch);
            
            const statusMatch = status === 'all' || project.status === status;
            const clientMatch = client === 'all' || project.client_name === client;
            
            const dateMatch = !dateRange?.from || 
                (new Date(project.updated_at) >= dateRange.from && (!dateRange.to || new Date(project.updated_at) <= dateRange.to));

            return searchMatch && statusMatch && clientMatch && dateMatch;
        });
    }, [projects, filters]);
    
    const handleExport = () => {
        toast({
            title: "🚧 Feature not implemented",
            description: "Export functionality is not available yet, but you can request it!",
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
        >
            <ProjectsTableFilters
                filters={filters}
                setFilters={setFilters}
                clients={filterOptions.clients}
                statuses={filterOptions.statuses}
                onExport={handleExport}
            />
            
            {isLoading ? (
                <ProjectsTable isLoading={true} projects={[]} />
            ) : filteredProjects.length > 0 ? (
                <ProjectsTable projects={filteredProjects} isLoading={false} />
            ) : (
                <EmptyState onAddProjectClick={() => navigate('/projects/new')} />
            )}
        </motion.div>
    );
};

export default ProjectsTab;