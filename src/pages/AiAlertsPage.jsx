import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import AlertsStream from '@/components/dashboard/ai-alerts/AlertsStream';
import RulesBuilder from '@/components/dashboard/ai-alerts/RulesBuilder';
import ForecastsList from '@/components/dashboard/ai-alerts/ForecastsList';


const AiAlertsPage = () => {
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
                <title>Smart Alerts & Predictions | DomusBuilder</title>
                <meta name="description" content="Monitor AI-generated alerts and predictive insights for your projects." />
            </Helmet>

            <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-bold tracking-tight">Smart Alerts & Predictions</h1>
                    <p className="mt-1 text-lg text-muted-foreground">Stay ahead of issues with AI-powered alerts and forecasts for your projects.</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <AlertsStream />
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col gap-6">
                        <RulesBuilder />
                        <ForecastsList />
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
};

export default AiAlertsPage;