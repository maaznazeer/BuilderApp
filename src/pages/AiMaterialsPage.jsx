import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import UploadBar from '@/components/dashboard/ai-monitoring/UploadBar';
import BrandSpecPicker from '@/components/dashboard/ai-materials/BrandSpecPicker';
import ResultCardsGrid from '@/components/dashboard/ai-materials/ResultCardsGrid';
import StandardsDrawer from '@/components/dashboard/ai-materials/StandardsDrawer';
import { useProject } from '@/contexts/ProjectContext';

const AiMaterialsPage = () => {
    const [uploadedMediaUrls, setUploadedMediaUrls] = useState([]);
    const [selectedSpec, setSelectedSpec] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null); // To pass to drawer
    const { selectedProject } = useProject();

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
    
    // This will be updated by the AiQualityAdvisorCard via prop drilling
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    return (
        <>
            <Helmet>
                <title>Materials & Quality Assurance | DomusBuilder</title>
                <meta name="description" content="Ensure material quality and compliance with AI-powered analysis." />
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
                            <h1 className="text-3xl font-bold tracking-tight">Materials & Quality Assurance</h1>
                            <p className="mt-1 text-lg text-muted-foreground">Verify on-site materials against brand and technical specifications.</p>
                        </div>
                        <div className="flex-shrink-0">
                           <StandardsDrawer category={selectedCategory} />
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <UploadBar 
                        projectId={selectedProject?.id}
                        onUploadComplete={handleUploadComplete} 
                        tag="materials"
                    />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <BrandSpecPicker onSpecSelect={setSelectedSpec} />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <ResultCardsGrid 
                        mediaUrls={uploadedMediaUrls} 
                        spec={selectedSpec} 
                        project={selectedProject}
                        onCategoryChange={handleCategoryChange}
                    />
                </motion.div>

            </motion.div>
        </>
    );
};

export default AiMaterialsPage;