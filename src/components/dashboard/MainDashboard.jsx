import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext.jsx';
import KpiStrip from '@/components/dashboard/KpiStrip.jsx';
import StrategicOverview from '@/components/dashboard/StrategicOverview.jsx';
import OperationsZone from '@/components/dashboard/operations/OperationsZone.jsx';
import InsightsZone from '@/components/dashboard/InsightsZone.jsx';
import SupplyChainSection from '@/components/dashboard/supply-chain/SupplyChainSection.jsx';
import WorkforceSection from '@/components/dashboard/WorkforceSection.jsx';
import FinancialsSection from '@/components/dashboard/financials/FinancialsSection.jsx';
import WorkspaceSetup from '@/components/dashboard/WorkspaceSetup.jsx';
import { motion } from 'framer-motion';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader.jsx';


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

  const sections = [
    { id: 'overview', component: <StrategicOverview /> },
    { id: 'operations', component: <OperationsZone /> },
    { id: 'insights', component: <InsightsZone /> },
    { id: 'supply-chain', component: <SupplyChainSection /> },
    { id: 'workforce', component: <WorkforceSection /> },
    { id: 'financials', component: <FinancialsSection /> },
  ];

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <WelcomeHeader />
      </motion.div>
      <motion.div variants={itemVariants}>
        <KpiStrip />
      </motion.div>
      
      {sections.map(section => (
        <motion.div key={section.id} variants={itemVariants}>
          {section.component}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MainDashboard;