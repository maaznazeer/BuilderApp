import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Translator from '@/components/dashboard/ai-comms/Translator';
import MeetingSummarizer from '@/components/dashboard/ai-comms/MeetingSummarizer';
import PriceBenchmarker from '@/components/dashboard/ai-comms/PriceBenchmarker';

const AiCommsPage = () => {
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
                <title>Trust & Communication | DomusBuilder</title>
                <meta name="description" content="AI-powered tools to enhance trust and clear communication with contractors." />
            </Helmet>

            <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-bold tracking-tight">Trust & Communication</h1>
                    <p className="mt-1 text-lg text-muted-foreground">Bridge language gaps and ensure total clarity with your build team.</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <Translator />
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col gap-6">
                        <MeetingSummarizer />
                        <PriceBenchmarker />
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
};

export default AiCommsPage;