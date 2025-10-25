import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Settings, Trash2 } from 'lucide-react';
import GeneralProjectSettings from '@/components/settings/GeneralProjectSettings';
import ProjectAlertSettings from '@/components/settings/ProjectAlertSettings';
import { Button } from '@/components/ui/button';
import { DeleteProjectDialog } from '@/components/settings/DeleteProjectDialog';

const LoadingDisplay = () => (
    <div className="flex items-center justify-center p-8">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <span className="text-lg text-muted-foreground">Loading Project...</span>
    </div>
);

const NoProjectDisplay = () => (
    <Card>
        <CardHeader>
            <CardTitle>No Project Selected</CardTitle>
            <CardDescription>Please select a project from the dashboard to view its settings.</CardDescription>
        </CardHeader>
    </Card>
);

const DangerZone = ({ project }) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    return (
        <>
            <Card className="border-destructive">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-destructive/10 text-destructive rounded-full flex items-center justify-center flex-shrink-0">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                            <CardDescription>Once you delete a project, there is no going back. Please be certain.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <p className="font-medium">Delete this project</p>
                        <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>Delete Project</Button>
                    </div>
                </CardContent>
            </Card>
            <DeleteProjectDialog 
                project={project}
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            />
        </>
    );
};


const ProjectSettingsPage = () => {
    const { t } = useTranslation();
    const { selectedProject, loading, refreshProjects } = useProject();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
        },
    };
    
    return (
        <>
            <Helmet>
                <title>{t('Project Settings')} - DomusBuilder Hub</title>
                <meta name="description" content={t('Manage your project settings and preferences.')} />
            </Helmet>
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t('Project Settings')}</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        {selectedProject 
                            ? `${t('Managing')} "${selectedProject.name}" (${selectedProject.code || selectedProject.project_code})`
                            : t('Manage your project settings and preferences.')
                        }
                    </p>
                </div>

                {loading && <LoadingDisplay />}
                {!loading && !selectedProject && <NoProjectDisplay />}
                
                {!loading && selectedProject && (
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-1 md:w-[400px]">
                            <TabsTrigger value="general"><Settings className="mr-2 h-4 w-4"/>General</TabsTrigger>
                            {/* <TabsTrigger value="alerts"><AlertCircle className="mr-2 h-4 w-4"/>Alerts</TabsTrigger> */}
                        </TabsList>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="mt-6"
                        >
                            <TabsContent value="general">
                                <motion.div variants={itemVariants}>
                                    <GeneralProjectSettings project={selectedProject} />
                                </motion.div>
                                <motion.div variants={itemVariants} className="mt-8">
                                    <DangerZone project={selectedProject} />
                                </motion.div>
                            </TabsContent>
                            <TabsContent value="alerts">
                                <motion.div variants={itemVariants}>
                                    <ProjectAlertSettings project={selectedProject} onProjectUpdate={refreshProjects} />
                                </motion.div>
                            </TabsContent>
                        </motion.div>
                    </Tabs>
                )}
            </div>
        </>
    );
};

export default ProjectSettingsPage;