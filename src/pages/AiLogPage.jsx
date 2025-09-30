import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import AiLogTable from '@/components/dashboard/ai-log/AiLogTable';

const AiLogPage = () => {
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
                <title>AI Task Log | DomusBuilder</title>
                <meta name="description" content="Review the history of all AI-powered tasks and analyses for your projects." />
            </Helmet>

            <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-bold tracking-tight">AI Task Log</h1>
                    <p className="mt-1 text-lg text-muted-foreground">An audit trail of all AI jobs run on your projects.</p>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <AiLogTable />
                </motion.div>
            </motion.div>
        </>
    );
};

export default AiLogPage;