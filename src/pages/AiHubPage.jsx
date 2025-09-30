import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Hero from '@/components/dashboard/ai-hub/Hero';
import QuickActionsGrid from '@/components/dashboard/ai-hub/QuickActionsGrid';
import RecentAIJobs from '@/components/dashboard/ai-hub/RecentAIJobs';
import AlertsStream from '@/components/dashboard/ai-hub/AlertsStream';

const AiHubPage = () => {
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
                <title>Ask-Builder Hub | DomusBuilder</title>
                <meta name="description" content="Harness the power of AI for remote construction monitoring, QA, cost forecasting, and more." />
                <meta property="og:title" content="Ask-Builder Hub" />
                <meta property="og:description" content="AI-powered insights for remote build confidence." />
            </Helmet>
            <motion.div
                className="space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <Hero />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <QuickActionsGrid />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div className="lg:col-span-2" variants={itemVariants}>
                        <RecentAIJobs />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <AlertsStream />
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
};

export default AiHubPage;