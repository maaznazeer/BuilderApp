import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import KbHeader from '@/components/dashboard/ai-kb/KbHeader';
import KbKpis from '@/components/dashboard/ai-kb/KbKpis';
import SourceTable from '@/components/dashboard/ai-kb/SourceTable';
import SearchTest from '@/components/dashboard/ai-kb/SearchTest';
import EmbedKnowledgeBaseDrawer from '@/components/dashboard/ai-hub/EmbedKnowledgeBaseDrawer';

const KnowledgeBasePage = () => {
    const [isEmbedDrawerOpen, setIsEmbedDrawerOpen] = useState(false);

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
                <title>Knowledge Base | DomusBuilder</title>
                <meta name="description" content="Manage the knowledge base for the Ask-Builder AI assistant." />
            </Helmet>
            <div className="space-y-8">
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div variants={itemVariants}>
                        <KbHeader onEmbedClick={() => setIsEmbedDrawerOpen(true)} />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <KbKpis />
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <motion.div className="lg:col-span-2" variants={itemVariants}>
                            <SourceTable />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <SearchTest />
                        </motion.div>
                    </div>
                </motion.div>

                <EmbedKnowledgeBaseDrawer open={isEmbedDrawerOpen} onOpenChange={setIsEmbedDrawerOpen} />
            </div>
        </>
    );
};

export default KnowledgeBasePage;