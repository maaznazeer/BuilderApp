import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookPlus } from 'lucide-react';
import Hero from '@/components/dashboard/ai-hub/Hero';
import QuickActionsGrid from '@/components/dashboard/ai-hub/QuickActionsGrid';
import RecentAIJobs from '@/components/dashboard/ai-hub/RecentAIJobs';
import AlertsStream from '@/components/dashboard/ai-hub/AlertsStream';
import LiveAssistant from '@/components/dashboard/ai-hub/LiveAssistant';
import EmbedKnowledgeBaseDrawer from '@/components/dashboard/ai-hub/EmbedKnowledgeBaseDrawer';
import { useProject } from '@/contexts/ProjectContext';

const AskBuilderPage = () => {
    const [isEmbedDrawerOpen, setIsEmbedDrawerOpen] = useState(false);
    const { selectedProject } = useProject();

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
            transition: {
                type: 'spring',
                stiffness: 100,
            },
        },
    };

    return (
        <>
            <Helmet>
                <title>Ask-Builder Brain | DomusBuilder</title>
                <meta name="description" content="Harness the power of AI for remote construction monitoring, QA, cost forecasting, and more." />
                <meta property="og:title" content="Ask-Builder Brain" />
                <meta property="og:description" content="AI-powered insights for remote build confidence." />
            </Helmet>
            <div className="relative">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <Hero />
                    </motion.div>

                    <div className="p-4 md:p-6 space-y-8">
                        <motion.div variants={itemVariants} className="pt-4 border-b pb-6">
                            <div className="flex justify-end">
                                <Button onClick={() => setIsEmbedDrawerOpen(true)}>
                                    <BookPlus className="mr-2 h-4 w-4" />
                                    Embed Knowledge
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <LiveAssistant projectId={selectedProject?.id} />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <QuickActionsGrid />
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <motion.div className="lg:col-span-2" variants={itemVariants}>
                                <RecentAIJobs />
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <AlertsStream projectId={selectedProject?.id} />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                <EmbedKnowledgeBaseDrawer open={isEmbedDrawerOpen} onOpenChange={setIsEmbedDrawerOpen} />
            </div>
        </>
    );
};

export default AskBuilderPage;