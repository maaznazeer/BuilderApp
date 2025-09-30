import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, CheckCircle, Circle, Paperclip, Upload, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useOutletContext } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

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
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{t('workflow_page.title')}</h1>
                                <p className="text-gray-500 mt-1">{t('workflow_page.description')}</p>
                            </div>
                            <div className="mt-4 md:mt-0 w-full md:w-auto md:min-w-[250px]">
                                <Label htmlFor="project-select">{t('workflow_page.select_project')}</Label>
                                <Select onValueChange={setSelectedProject} value={selectedProject || ''} disabled={projects.length === 0}>
                                    <SelectTrigger id="project-select">
                                        <SelectValue placeholder={t('workflow_page.select_project')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(project => (
                                            <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {selectedProject && (
                            <div className="mt-6">
                                <Label>{t('workflow_page.overall_progress')}</Label>
                                <Progress value={overallProgress} className="mt-1" />
                            </div>
                        )}
                    </CardContent>
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
            </motion.div>
        </>
    );
};

export default ConstructionProcessPage;