import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, CheckCircle, Circle, Paperclip, Upload, PlusCircle, Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOutletContext } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AddConstructionProcessDialog from '@/components/construction-management/AddConstructionProcessDialog';

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
    </div>
);

const ConstructionProcessPage = () => {
    const outletContext = useOutletContext();
    const onProjectAdded = outletContext?.onProjectAdded;
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const { user, profile } = useAuth();
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [workflowSteps, setWorkflowSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openPhases, setOpenPhases] = useState({});
    const [isAddProcessOpen, setIsAddProcessOpen] = useState(false);
    const [constructionProcesses, setConstructionProcesses] = useState([]);
    const [processesLoading, setProcessesLoading] = useState(false);

    const userRole = profile?.app_role;

    const fetchProjects = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('projects')
            .select('id, name')
            .order('created_at', { ascending: false });
        
        if (error) {
            toast({ title: t('errors.fetch_projects_title'), description: error.message, variant: "destructive" });
        } else {
            setProjects(data);
            if (data.length > 0 && !selectedProject) {
                setSelectedProject(data[0].id);
            } else if (data.length > 0 && selectedProject && !data.find(p => p.id === selectedProject)) {
                setSelectedProject(data[0].id);
            } else if (data.length === 0) {
                setSelectedProject(null);
            }
        }
    }, [toast, user, t, selectedProject]);

    useEffect(() => {
        if (user) {
            fetchProjects();
        }
    }, [user, fetchProjects, onProjectAdded]);

    const fetchProjectWorkflow = useCallback(async () => {
        if (!selectedProject) {
             setWorkflowSteps([]);
             setLoading(false);
             return;
        }
        setLoading(true);

        const { data, error } = await supabase
            .rpc('get_project_workflow_details', { p_project_id: selectedProject });

        if (error) {
            toast({ title: "Error fetching project workflow", description: error.message, variant: "destructive" });
            setWorkflowSteps([]);
        } else {
            setWorkflowSteps(data || []);
        }
        setLoading(false);
    }, [selectedProject, toast]);

    useEffect(() => {
        fetchProjectWorkflow();
    }, [selectedProject, fetchProjectWorkflow]);

    const fetchConstructionProcesses = useCallback(async () => {
        setProcessesLoading(true);
        try {
            const { data, error } = await supabase
                .from('construction_workflow')
                .select('*')
                .order('id', { ascending: false });
            
            if (error) throw error;
            setConstructionProcesses(data || []);
        } catch (error) {
            toast({ title: 'Error fetching processes', description: error.message, variant: 'destructive' });
        } finally {
            setProcessesLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchConstructionProcesses();
    }, [fetchConstructionProcesses]);

    const handleAddProcess = async (processData) => {
        try {
            const { data, error } = await supabase
                .from('construction_workflow')
                .insert([{
                    step_name: processData.name,
                    project_id: processData.project_id,
                    phase: processData.phases?.[0]?.name || 'Planning',
                    phase_order: 1,
                    step_order: 1,
                    status: processData.status || 'Not Started',
                    estimated_duration: processData.estimated_duration
                }])
                .select()
                .single();

            if (error) throw error;
            
            setConstructionProcesses(prev => [data, ...prev]);
            toast({ title: 'Process created successfully!' });
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const handleDeleteProcess = async (processId) => {
        if (window.confirm('Are you sure you want to delete this construction process?')) {
            try {
                const { error } = await supabase
                    .from('construction_workflow')
                    .delete()
                    .eq('id', processId);

                if (error) throw error;
                
                setConstructionProcesses(prev => prev.filter(p => p.id !== processId));
                toast({ title: 'Process deleted successfully!' });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error deleting process', description: error.message });
            }
        }
    };
    
    const { groupedWorkflow, overallProgress } = useMemo(() => {
        const grouped = workflowSteps.reduce((acc, step) => {
            const phaseKey = `${step.phase_order}-${step.phase}`;
            (acc[phaseKey] = acc[phaseKey] || []).push(step);
            return acc;
        }, {});

        const totalSteps = workflowSteps.length;
        const completedSteps = workflowSteps.filter(s => s.status === 'Completed').length;
        const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
        
        return { groupedWorkflow: grouped, overallProgress: progress };
    }, [workflowSteps]);


    const togglePhase = (phaseKey) => {
        setOpenPhases(prev => ({ ...prev, [phaseKey]: !prev[phaseKey] }));
    };

    useEffect(() => {
        const initialOpenState = Object.keys(groupedWorkflow).reduce((acc, phaseKey) => {
            acc[phaseKey] = true;
            return acc;
        }, {});
        setOpenPhases(initialOpenState);
    }, [groupedWorkflow]);

    const handleStatusChange = async (projectStepId, newStatus) => {
        const updatePayload = {
          status: newStatus,
          updated_at: new Date().toISOString(),
        };

        if (newStatus === 'Completed') {
            updatePayload.completion_date = new Date().toISOString();
        }
        if (newStatus === 'Pending Approval') {
            updatePayload.approval_requested_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('project_workflow_steps')
            .update(updatePayload)
            .eq('id', projectStepId);

        if (error) {
            toast({ title: "Error updating status", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Status updated successfully!" });
            fetchProjectWorkflow();
        }
    };
    
    return (
        <>
            <Helmet>
                <html lang={i18n.language} />
                <title>Construction Process - DomusBuilder Hub</title>
                <meta name="description" content="Track and manage the construction process for your projects." />
            </Helmet>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {/* Construction Processes Management */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold">Construction Processes</CardTitle>
                                <p className="text-gray-500 mt-1">Manage your construction processes and workflows</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-64">
                                    <Label htmlFor="process-project-select">Filter by Project</Label>
                                    <Select value={selectedProject || 'all'} onValueChange={(value) => setSelectedProject(value === 'all' ? null : value)}>
                                        <SelectTrigger id="process-project-select">
                                            <SelectValue placeholder="All Projects" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Projects</SelectItem>
                                            {projects.map(project => (
                                                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={() => setIsAddProcessOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Process
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {processesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-blue-600"></div>
                                <span className="ml-2 text-gray-600">Loading processes...</span>
                            </div>
                        ) : constructionProcesses.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {constructionProcesses
                                    .filter(process => !selectedProject || process.project_id === selectedProject)
                                    .map((process) => (
                                    <Card key={process.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{process.step_name}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {projects.find(p => p.id === process.project_id)?.name || 'Unknown Project'}
                                                </p>
                                            </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-red-600"
                                                            onClick={() => handleDeleteProcess(process.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline">{process.phase}</Badge>
                                                    <Badge variant={process.status === 'Completed' ? 'default' : process.status === 'In Progress' ? 'secondary' : 'outline'}>
                                                        {process.status}
                                                    </Badge>
                                                </div>
                                                
                                                {process.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-2">{process.description}</p>
                                                )}
                                                
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>Phase {process.phase_order}</span>
                                                    <span>{process.estimated_duration}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <PlusCircle className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">No Construction Processes</h3>
                                <p className="text-gray-500 mb-4">Get started by creating your first construction process.</p>
                                <Button onClick={() => setIsAddProcessOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Process
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Project Workflow */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold">Project Workflow</CardTitle>
                                <p className="text-gray-500 mt-1">Track and manage workflow steps for your selected project</p>
                            </div>
                            <div className="w-64">
                                <Label htmlFor="workflow-project-select">Select Project</Label>
                                <Select onValueChange={(value) => setSelectedProject(value === 'all' ? null : value)} value={selectedProject || 'all'} disabled={projects.length === 0}>
                                    <SelectTrigger id="workflow-project-select">
                                        <SelectValue placeholder="Select a project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Projects</SelectItem>
                                        {projects.map(project => (
                                            <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {selectedProject && (
                            <div className="mt-6">
                                <Label>Overall Progress</Label>
                                <Progress value={overallProgress} className="mt-1" />
                            </div>
                        )}
                    </CardHeader>
                </Card>

                {loading ? <LoadingFallback /> : !selectedProject ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                        <h3 className="text-lg font-medium text-gray-800">No Projects Found</h3>
                        <p className="text-gray-500 mt-1">Please add a project to get started.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border">
                        {Object.entries(groupedWorkflow).sort(([a], [b]) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0])).map(([phaseKey, steps]) => {
                            const phaseName = phaseKey.substring(phaseKey.indexOf('-') + 1);
                            const phaseTotal = steps.length;
                            const phaseCompleted = steps.filter(s => s.status === 'Completed').length;
                            const phaseProgress = phaseTotal > 0 ? (phaseCompleted / phaseTotal) * 100 : 0;
                            
                            return (
                                <div key={phaseKey} className="border-b last:border-b-0">
                                    <div 
                                      className="flex items-center justify-between bg-gray-50 p-4 cursor-pointer hover:bg-gray-100" 
                                      onClick={() => togglePhase(phaseKey)}
                                    >
                                        <div className="flex items-center flex-grow">
                                            {openPhases[phaseKey] ? <ChevronDown className="h-5 w-5 mr-3 text-gray-600"/> : <ChevronRight className="h-5 w-5 mr-3 text-gray-600"/>}
                                            <h2 className="text-xl font-semibold text-gray-700">{phaseName}</h2>
                                        </div>
                                        <div className="w-1/3 ml-4">
                                            <Progress value={phaseProgress} />
                                        </div>
                                    </div>
                                    {openPhases[phaseKey] && (
                                        <div className="divide-y">
                                            {steps.sort((a, b) => a.step_order - b.step_order).map(step => (
                                                <div key={step.project_step_id} className="p-4 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center">
                                                            {step.status === 'Completed' ? <CheckCircle className="h-5 w-5 text-green-500 mr-3"/> : <Circle className="h-5 w-5 text-gray-400 mr-3"/>}
                                                            <span className="font-medium text-gray-800">{step.step_order}. {step.step_name}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Select value={step.status} onValueChange={(newStatus) => handleStatusChange(step.project_step_id, newStatus)}>
                                                                <SelectTrigger className="w-[180px] h-8 text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Not Started">{t('workflow_page.step_status_not_started')}</SelectItem>
                                                                    <SelectItem value="In Progress">{t('workflow_page.step_status_in_progress')}</SelectItem>
                                                                    <SelectItem value="Pending Approval">{t('workflow_page.step_status_pending_approval')}</SelectItem>
                                                                    <SelectItem value="Completed">{t('workflow_page.step_status_completed')}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className="pl-8 space-y-3">
                                                        <p className="text-sm text-gray-600">{step.key_actions_requirements}</p>
                                                        <div>
                                                            <h4 className="text-sm font-semibold mb-1">{t('workflow_page.required_deliverables')}</h4>
                                                            <p className="text-sm text-gray-500">{step.required_deliverables || "None"}</p>
                                                            <Button variant="outline" size="sm" className="mt-2"><Upload className="h-3 w-3 mr-1.5"/> {t('workflow_page.upload_files_cta')}</Button>
                                                        </div>
                                                        {(userRole === 'Homebuilder' || userRole === 'Admin') && (
                                                          <div className="space-y-1">
                                                              <h4 className="text-sm font-semibold">{t('workflow_page.notes')}</h4>
                                                              <textarea className="w-full p-2 border rounded-md text-sm" placeholder={t('workflow_page.add_notes_placeholder')}></textarea>
                                                          </div>
                                                        )}
                                                        {(step.approval_required !== 'None' && step.status === 'Pending Approval' && (userRole === step.approval_required || userRole === 'Admin')) && (
                                                            <div className="flex items-center space-x-2 pt-2">
                                                                <Button variant="success" size="sm">{t('workflow_page.approve')}</Button>
                                                                <Button variant="destructive" size="sm">{t('workflow_page.request_changes')}</Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        {workflowSteps.length === 0 && !loading && (
                            <div className="text-center py-16">
                                <h3 className="text-lg font-medium text-gray-800">No workflow steps found for this project.</h3>
                                <p className="text-gray-500 mt-1">This may be because the project was created without a workflow template. Please define a default workflow in settings.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Add Construction Process Dialog */}
                <AddConstructionProcessDialog
                    isOpen={isAddProcessOpen}
                    onClose={() => setIsAddProcessOpen(false)}
                    onSave={handleAddProcess}
                    projects={projects}
                />
            </motion.div>
        </>
    );
};

export default ConstructionProcessPage;