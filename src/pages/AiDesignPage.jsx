import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import RequirementsForm from '@/components/dashboard/ai-design/RequirementsForm';
import LayoutGallery from '@/components/dashboard/ai-design/LayoutGallery';
import RenderPreview from '@/components/dashboard/ai-design/RenderPreview';
import CultureTipsCard from '@/components/dashboard/ai-design/CultureTipsCard';
import { useProject } from '@/contexts/ProjectContext';

const AiDesignPage = () => {
    const [requirements, setRequirements] = useState(null);
    const [generatedLayouts, setGeneratedLayouts] = useState([]);
    const [selectedLayout, setSelectedLayout] = useState(null);
    const { selectedProject } = useProject();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };
    
    const handleUpload = useCallback(() => {
        setSelectedLayout(null);
    }, []);

    return (
        <>
            <Helmet>
                <title>Design & Inspiration | DomusBuilder</title>
                <meta name="description" content="Use AI to generate architectural designs and cultural-inspired layouts." />
            </Helmet>

            <motion.div 
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-bold tracking-tight">Design & Inspiration</h1>
                    <p className="mt-1 text-lg text-muted-foreground">Define your needs and let AI craft the perfect design.</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col gap-6">
                        <RequirementsForm onGenerate={setRequirements} project={selectedProject} />
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="lg:col-span-2 grid grid-cols-1 md:grid-cols-1 gap-6">
                         <LayoutGallery 
                            requirements={requirements} 
                            project={selectedProject} 
                            onLayoutsGenerated={setGeneratedLayouts}
                            onLayoutSelect={setSelectedLayout}
                            selectedLayout={selectedLayout}
                         />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <RenderPreview 
                                project={selectedProject}
                                selectedLayout={selectedLayout}
                                onUpload={handleUpload}
                             />
                            <CultureTipsCard
                                requirements={requirements}
                                project={selectedProject}
                             />
                         </div>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
};

export default AiDesignPage;