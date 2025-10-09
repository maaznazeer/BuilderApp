import React, { useState, useEffect, useCallback } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { useTranslation } from 'react-i18next';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import GanttView from '@/components/project-management/GanttView.jsx';
    import ResourcesView from '@/components/project-management/ResourcesView.jsx';
    import CalendarsView from '@/components/project-management/CalendarsView.jsx';
    import WorkloadView from '@/components/project-management/WorkloadView.jsx';
    import BudgetView from '@/components/project-management/BudgetView.jsx';
    import TimeAndReportsView from '@/components/project-management/TimeAndReportsView.jsx';
    import ProjectMaterialsPage from '@/pages/ProjectMaterialsPage.jsx';
    import PayrollGridWidget from '@/components/payroll/PayrollGridWidget.jsx';
import { GanttChartSquare, Users, CalendarDays, BarChart3, Wallet, Clock, Package, Banknote } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
    
    const ProjectManagementPage = () => {
        const { t, i18n } = useTranslation();
        const { toast } = useToast();
        const { profile } = useAuth();
        const isSubcontractor = profile?.app_role?.toLowerCase() === 'subcontractor';
        const [activeTab, setActiveTab] = useState('gantt');
        const [projects, setProjects] = useState([]);
        const [selectedProject, setSelectedProject] = useState(null);
        const [loading, setLoading] = useState(true);
    
        const fetchProjects = useCallback(async () => {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_user_projects');
            if (error) {
                toast({ variant: 'destructive', title: 'Error fetching projects', description: error.message });
            } else {
                setProjects(data || []);
                if (data && data.length > 0 && !selectedProject) {
                    setSelectedProject(data[0].id);
                } else if (!data || data.length === 0) {
                    setSelectedProject(null);
                }
            }
            setLoading(false);
        }, [toast, selectedProject]);
    
        useEffect(() => {
            fetchProjects();
        }, [fetchProjects]);
    
        const commonProps = { projects, setProjects, selectedProject, setSelectedProject, refreshProjects: fetchProjects };
    
        const tabs = isSubcontractor ? [
            { value: 'calendars', label: t('Calendars'), icon: CalendarDays, component: <CalendarsView {...commonProps} /> },
            { value: 'workload', label: t('Workload'), icon: BarChart3, component: <WorkloadView {...commonProps} /> },
            { value: 'materials', label: t('Materials'), icon: Package, component: <ProjectMaterialsPage {...commonProps} /> },
        ] : [
            { value: 'gantt', label: t('Gantt'), icon: GanttChartSquare, component: <GanttView {...commonProps} /> },
            { value: 'materials', label: t('Materials'), icon: Package, component: <ProjectMaterialsPage {...commonProps} /> },
            { value: 'payroll', label: t('Payroll'), icon: Banknote, component: <PayrollGridWidget {...commonProps} /> },
            { value: 'resources', label: t('Resources'), icon: Users, component: <ResourcesView {...commonProps} /> },
            { value: 'calendars', label: t('Calendars'), icon: CalendarDays, component: <CalendarsView {...commonProps} /> },
            { value: 'workload', label: t('Workload'), icon: BarChart3, component: <WorkloadView {...commonProps} /> },
            { value: 'budget', label: t('Budget'), icon: Wallet, component: <BudgetView {...commonProps} /> },
            { value: 'time-reports', label: t('Time & Reports'), icon: Clock, component: <TimeAndReportsView {...commonProps} /> },
        ];
    
        return (
            <>
                <Helmet>
                    <html lang={i18n.language} />
                    <title>{t('Project Management')} - DomusBuilder Hub</title>
                    <meta name="description" content={t('Manage your construction project timelines, resources, and budgets with powerful tools.')} />
                </Helmet>
                <div className="h-full flex flex-col p-4 md:p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
                            {tabs.map(tab => (
                                <TabsTrigger key={tab.value} value={tab.value}>
                                    <tab.icon className="mr-2 h-4 w-4" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        
                        <div className="flex-grow mt-4 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <p>Loading projects...</p>
                                </div>
                            ) : (
                                tabs.map(tab => (
                                     <TabsContent key={tab.value} value={tab.value} className="h-full">
                                        {tab.component}
                                    </TabsContent>
                                ))
                            )}
                        </div>
                    </Tabs>
                </div>
            </>
        );
    };
    
    export default ProjectManagementPage;