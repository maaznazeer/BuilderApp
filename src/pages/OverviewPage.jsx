import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useDashboard } from '@/contexts/DashboardContext.jsx';
import KpiStrip from '@/components/dashboard/overview/KpiStrip';
import AiExecutiveSummary from '@/components/dashboard/overview/AiExecutiveSummary';
import TasksStatus from '@/components/dashboard/overview/TasksStatus';
import WorkloadChart from '@/components/dashboard/overview/WorkloadChart';
import TasksByAssignee from '@/components/dashboard/overview/TasksByAssignee';
import UrgentTasks from '@/components/dashboard/overview/UrgentTasks';
import RecentActivityFeed from '@/components/dashboard/overview/RecentActivityFeed';
import { motion } from 'framer-motion';

const OverviewPage = () => {
  const { loading } = useDashboard();

  return (
    <>
      <Helmet>
        <title>Dashboard Overview | DomusBuilder</title>
        <meta name="description" content="Your central command center for all construction projects." />
      </Helmet>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <KpiStrip />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AiExecutiveSummary />
            <TasksStatus />
            <UrgentTasks />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <WorkloadChart />
            <TasksByAssignee />
            <RecentActivityFeed />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default OverviewPage;