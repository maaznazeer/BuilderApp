import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext.jsx';
import KpiStrip from '@/components/dashboard/KpiStrip.jsx';
import StrategicOverview from '@/components/dashboard/StrategicOverview.jsx';
import WorkspaceSetup from '@/components/dashboard/WorkspaceSetup.jsx';
import { motion } from 'framer-motion';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader.jsx';
import FinancialSummaryCard from '@/components/dashboard/overview/FinancialSummaryCard';
import SimpleProjectChart from '@/components/dashboard/overview/SimpleProjectChart';
import ProjectCostChart from '@/components/dashboard/overview/ProjectCostChart';
import FinancialTrendsChart from '@/components/dashboard/overview/FinancialTrendsChart';
import ProjectPerformanceDashboard from '@/components/dashboard/overview/ProjectPerformanceDashboard';

const MainDashboard = () => {
  const { showWorkspaceSetup, refreshDashboard } = useDashboard();

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
  
  if (showWorkspaceSetup) {
    return <WorkspaceSetup onFinish={refreshDashboard} />;
  }

  return (
    <div className=" flex flex-col overflow-hidden">
      <motion.div 
        // className="flex-1 flex flex-col space-y-4 p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Header - Compact */}
        <motion.div variants={itemVariants} className="flex-shrink-0">
          <WelcomeHeader />
        </motion.div>
        
        {/* KPI Strip - Compact */}
        <motion.div variants={itemVariants} className="flex-shrink-0">
          <KpiStrip />
        </motion.div>

        {/* Financial Overview Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          <FinancialSummaryCard />
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <SimpleProjectChart />
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <ProjectCostChart />
        </motion.div>
    
      </motion.div>
    </div>
  );
};

export default MainDashboard;