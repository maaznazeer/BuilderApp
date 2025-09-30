import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import HeroCard from '@/components/dashboard/HeroCard';
import KpiStrip from '@/components/dashboard/KpiStrip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTabContent from '@/components/dashboard/overview/OverviewTabContent';
import ProjectsTab from '@/components/dashboard/ProjectsTab';
import PlannerTab from '@/components/dashboard/planner/PlannerTab';
import ConstructionManagementSection from '@/components/dashboard/ConstructionManagementSection';
import WorkforceSection from '@/components/dashboard/WorkforceSection';
import SupplyChainSection from '@/components/dashboard/supply-chain/SupplyChainSection';

const MainDashboardPage = () => {
    const { toast } = useToast();
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");

    const handleFeatureClick = (featureName) => {
        toast({
            title: `🚀 ${featureName}`,
            description: "This feature is coming soon! Stay tuned.",
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 md:p-6 lg:p-8 space-y-8"
        >
            <HeroCard />
            <KpiStrip />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid md:grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="planner">Planner</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <OverviewTabContent />
                </TabsContent>
                <TabsContent value="projects">
                    <ProjectsTab />
                </TabsContent>
                <TabsContent value="planner">
                    <PlannerTab />
                </TabsContent>
            </Tabs>
            
            <div className="space-y-8">
                <ConstructionManagementSection />
                <WorkforceSection />
                <SupplyChainSection />
            </div>
        </motion.div>
    );
};

export default MainDashboardPage;