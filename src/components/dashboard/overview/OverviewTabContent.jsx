import React from 'react';
import { motion } from 'framer-motion';
import KpiStrip from '@/components/dashboard/overview/KpiStrip';
import TasksByAssignee from '@/components/dashboard/overview/TasksByAssignee';
import UrgentTasks from '@/components/dashboard/overview/UrgentTasks';
import RecentActivityFeed from '@/components/dashboard/overview/RecentActivityFeed';
import TaskStatusChart from '@/components/dashboard/overview/TaskStatusChart';
import AiExecutiveSummary from '@/components/dashboard/overview/AiExecutiveSummary';
import DashboardFilters from '@/components/dashboard/overview/DashboardFilters';
import TasksStatus from '@/components/dashboard/overview/TasksStatus';
import MyTasksKpiStrip from '@/components/dashboard/overview/MyTasksKpiStrip';
import MyUrgentTasks from '@/components/dashboard/overview/MyUrgentTasks';

const OverviewTabContent = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <DashboardFilters />
            </motion.div>

            <motion.div variants={itemVariants}>
                <KpiStrip />
            </motion.div>

            <motion.div variants={itemVariants}>
                <MyTasksKpiStrip />
            </motion.div>
            
            <motion.div variants={itemVariants}>
                 <UrgentTasks />
            </motion.div>
            
            <motion.div variants={itemVariants}>
                 <MyUrgentTasks />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <TaskStatusChart />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <TasksStatus />
                </motion.div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="lg:col-span-1">
                    <RecentActivityFeed />
                </motion.div>
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <TasksByAssignee />
                </motion.div>
            </div>

             <motion.div variants={itemVariants}>
                <AiExecutiveSummary />
            </motion.div>

        </motion.div>
    );
};

export default OverviewTabContent;