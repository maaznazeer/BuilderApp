import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useProject } from '@/contexts/ProjectContext';
import ProjectPicker from '@/components/dashboard/ai-monitoring/ProjectPicker';
import KpisRow from '@/components/dashboard/ai-costs/KpisRow';
import ForecastCard from '@/components/dashboard/ai-costs/ForecastCard';
import PriceTrackerCard from '@/components/dashboard/ai-costs/PriceTrackerCard';
import FinanceSimCard from '@/components/dashboard/ai-costs/FinanceSimCard';


const AiCostsPage = () => {
    const { selectedProject, setSelectedProject } = useProject();

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
                <title>Smart Cost Control & Forecasts | DomusBuilder</title>
                <meta name="description" content="Leverage AI for advanced cost control, budget forecasting, and financial simulations." />
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
                            <h1 className="text-3xl font-bold tracking-tight">Smart Cost Control & Forecasts</h1>
                            <p className="mt-1 text-lg text-muted-foreground">Monitor financial health and predict future costs with AI precision.</p>
                        </div>
                        <ProjectPicker selectedProject={selectedProject} onProjectChange={setSelectedProject} />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                   <KpisRow projectId={selectedProject?.id} />
                </motion.div>
                
                <motion.div 
                    variants={itemVariants} 
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    <PriceTrackerCard project={selectedProject} />
                    <ForecastCard project={selectedProject} />
                    <FinanceSimCard project={selectedProject} />
                </motion.div>
            </motion.div>
        </>
    );
};

export default AiCostsPage;