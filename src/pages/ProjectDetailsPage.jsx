import React, { useEffect, useState } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { useParams, useNavigate, Routes, Route, Navigate, useLocation } from 'react-router-dom';
    import { useQuery } from 'react-query';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useProject } from '@/contexts/ProjectContext.jsx';
    import { Tabs, TabsList } from '@/components/ui/tabs';
    import { Skeleton } from '@/components/ui/skeleton';
    import { Button } from '@/components/ui/button';
    import { Edit, Trash2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    import OverviewTab from '@/components/dashboard/details/OverviewTab.jsx';
    import BudgetTab from '@/components/dashboard/details/BudgetTab.jsx';
    import SourcingPage from '@/pages/dashboard/SourcingPage.jsx';
    import MediaTab from '@/components/dashboard/site-monitoring/SiteMonitoringTab.jsx';
    import MilestonesTab from '@/components/dashboard/details/MilestonesTab.jsx';
    import CommunicationTab from '@/components/dashboard/details/CommunicationTab.jsx';
    import ContingencyTab from '@/components/dashboard/details/ContingencyTab.jsx';
    import GanttTab from '@/components/dashboard/details/GanttTab.jsx';
    import LoansTab from '@/components/dashboard/details/LoansTab.jsx';
    import TeamTab from '@/components/dashboard/details/TeamTab.jsx';
    import EditProjectDialog from '@/components/dashboard/details/EditProjectDialog';
    import { DeleteProjectDialog } from '@/components/settings/DeleteProjectDialog';
    import { TabsTrigger } from '@/components/ui/tabs';

    const fetchProjectById = async (projectId) => {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (error) {
            throw new Error(error.message);
        }
        return data;
    };

    const ProjectDetailsPage = () => {
        const { id } = useParams();
        const { toast } = useToast();
        const navigate = useNavigate();
        const location = useLocation();
        const { setSelectedProject, refreshProjects } = useProject();
        
        const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
        const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

        const { data: project, isLoading, error } = useQuery(
            ['project', id],
            () => fetchProjectById(id),
            {
                enabled: !!id,
                staleTime: 5 * 60 * 1000,
                onSuccess: (data) => {
                    setSelectedProject(data);
                }
            }
        );
        
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const currentTab = pathSegments.length > 3 ? pathSegments[3] : 'overview';

        const handleTabChange = (value) => {
            navigate(`/dashboard/projects/${id}/${value}`);
        };

        const handleProjectUpdated = () => {
            refreshProjects();
        };

        const handleDeleteSuccess = () => {
            toast({ title: "Project deleted successfully." });
            navigate('/dashboard/projects');
        };
        
        if (isLoading) {
            return (
                <div className="p-8 space-y-4">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-8 w-1/4" />
                    <div className="flex space-x-4 border-b">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                    <Skeleton className="h-64 w-full" />
                </div>
            );
        }

        if (error) {
            return <div className="p-8 text-red-500">Error: {error.message}</div>;
        }

        if (!project) {
            return <div className="p-8 text-center">Project not found or you do not have access.</div>;
        }

        return (
            <>
                <Helmet>
                    <title>{project.name} | Project Details</title>
                </Helmet>
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <div>
                           <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                           <p className="text-muted-foreground mt-1">Project Code: {project.code}</p>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                        </div>
                    </div>

                    <Tabs defaultValue={currentTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="budget">Budget</TabsTrigger>
                            <TabsTrigger value="sourcing">Sourcing</TabsTrigger>
                            {/* <TabsTrigger value="media">Media</TabsTrigger> */}
                            <TabsTrigger value="milestones">Milestones</TabsTrigger>
                            {/* <TabsTrigger value="communication">Comms</TabsTrigger> */}
                            {/* <TabsTrigger value="contingency">Contingency</TabsTrigger> */}
                            {/* <TabsTrigger value="gantt">Gantt</TabsTrigger> */}
                            <TabsTrigger value="loans">Loans</TabsTrigger>
                            <TabsTrigger value="team">Team</TabsTrigger>
                        </TabsList>
                        <div className="mt-4">
                            <Routes>
                                <Route path="overview" element={<OverviewTab project={project} onRefresh={handleProjectUpdated} />} />
                                <Route path="budget" element={<BudgetTab project={project} />} />
                                <Route path="sourcing" element={<SourcingPage />} />
                                <Route path="media" element={<MediaTab project={project} />} />
                                <Route path="milestones" element={<MilestonesTab project={project} />} />
                                <Route path="communication" element={<CommunicationTab project={project} />} />
                                <Route path="contingency" element={<ContingencyTab project={project} />} />
                                <Route path="gantt" element={<GanttTab project={project} />} />
                                <Route path="loans" element={<LoansTab project={project} />} />
                                <Route path="team" element={<TeamTab project={project} />} />
                                <Route index element={<Navigate to="overview" replace />} />
                            </Routes>
                        </div>
                    </Tabs>
                </div>
                 {isEditDialogOpen && (
                    <EditProjectDialog
                        isOpen={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                        project={project}
                        onProjectUpdated={handleProjectUpdated}
                    />
                )}
                {isDeleteDialogOpen && (
                    <DeleteProjectDialog
                        project={project}
                        open={isDeleteDialogOpen}
                        onOpenChange={setIsDeleteDialogOpen}
                        onSuccess={handleDeleteSuccess}
                    />
                )}
            </>
        );
    };

    export default ProjectDetailsPage;