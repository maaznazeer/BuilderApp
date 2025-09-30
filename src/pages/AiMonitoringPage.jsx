import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Eye, AreaChart, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import ProjectPicker from '@/components/dashboard/ai-monitoring/ProjectPicker';
import UploadBar from '@/components/dashboard/ai-monitoring/UploadBar';
import PlanMatchCard from '@/components/dashboard/ai-monitoring/PlanMatchCard';
import ProgressEstimatorCard from '@/components/dashboard/ai-monitoring/ProgressEstimatorCard';
import SpendAnomalyCard from '@/components/dashboard/ai-monitoring/SpendAnomalyCard';

const AiMonitoringPage = () => {
    const { projects, loading: projectsLoading } = useProject();
    const [selectedProject, setSelectedProject] = useState(null);
    const [uploadedMediaUrls, setUploadedMediaUrls] = useState([]);

    const handleProjectSelect = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        setSelectedProject(project);
    };

    const handleUploadComplete = (urls) => {
        setUploadedMediaUrls(urls);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <>
            <Helmet>
                <title>Remote Monitoring & Fraud Prevention | DomusBuilder</title>
                <meta name="description" content="AI-powered remote monitoring, progress tracking, and fraud prevention for your construction projects." />
            </Helmet>
            <motion.div 
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Remote Monitoring & Fraud Prevention</h1>
                            <p className="mt-1 text-lg text-muted-foreground">Your eyes on site, powered by AI.</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <UploadBar projectId={selectedProject?.id} onUploadComplete={handleUploadComplete} />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ProjectPicker projects={projects} onSelect={handleProjectSelect} isLoading={projectsLoading} selectedProject={selectedProject?.id} />
                        <Card>
                            <CardHeader>
                                <CardTitle>Current Stage</CardTitle>
                                <CardDescription>Identified construction phase based on media.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedProject ? (
                                    <div className="text-2xl font-bold text-primary">Foundation Pouring</div>
                                ) : (
                                    <div className="text-muted-foreground">Select a project</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Tabs defaultValue="plan-match">
                        <TabsList>
                            <TabsTrigger value="plan-match">Plan Match</TabsTrigger>
                            <TabsTrigger value="progress">Progress</TabsTrigger>
                            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
                        </TabsList>
                        <TabsContent value="plan-match" className="mt-4">
                           <PlanMatchCard 
                             project={selectedProject} 
                             mediaUrls={uploadedMediaUrls} 
                           />
                        </TabsContent>
                        <TabsContent value="progress" className="mt-4">
                             <ProgressEstimatorCard
                                project={selectedProject}
                                mediaUrls={uploadedMediaUrls}
                             />
                        </TabsContent>
                        <TabsContent value="anomalies" className="mt-4">
                            <SpendAnomalyCard project={selectedProject} />
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </motion.div>
        </>
    );
};

export default AiMonitoringPage;