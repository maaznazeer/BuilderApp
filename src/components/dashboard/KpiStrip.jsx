import React from 'react';
    import { motion } from 'framer-motion';
    import { Briefcase, BookOpen, GanttChartSquare, ClipboardCheck, RefreshCw } from 'lucide-react';
    import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
    import KpiCard from './KpiCard';
    import { Skeleton } from '@/components/ui/skeleton';
    import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
    import { Button } from '@/components/ui/button';
    import { AlertCircle } from 'lucide-react';
    import { useDashboard } from '@/contexts/DashboardContext.jsx';

    const KpiStrip = () => {
        const { projectIds } = useDashboard();
        const { data: metrics, isLoading, isError, error, refetch } = useDashboardMetrics();
        
        const kpiData = metrics || {};

        const kpiCards = [
            {
                title: "Projects",
                value: projectIds.length,
                icon: Briefcase,
                link: '/dashboard/projects',
                color: 'text-sky-500'
            },
            {
                title: "Financial Ledger",
                value: kpiData.total_spent,
                icon: BookOpen,
                isCurrency: true, 
                link: '/dashboard/financial-ledger',
                color: 'text-emerald-500'
            },
            {
                title: "Project Management",
                value: kpiData.upcoming_milestones_7d,
                icon: GanttChartSquare,
                link: '/dashboard/project-management',
                color: 'text-amber-500'
            },
            {
                title: "Approvals",
                value: kpiData.overdue_tasks,
                icon: ClipboardCheck,
                link: '/dashboard/approvals',
                color: 'text-rose-500'
            }
        ];

        if (isLoading) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
                    ))}
                </div>
            );
        }
        
        if (isError) {
            return (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading KPIs</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                        <span>{error.message || 'Could not load key performance indicators.'}</span>
                        <Button onClick={() => refetch()} size="sm" variant="secondary">
                            <RefreshCw className="h-4 w-4 mr-2"/>
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            );
        }

        return (
            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.05 } }
                }}
            >
                {kpiCards.map((kpi, index) => (
                    <KpiCard key={index} {...kpi} />
                ))}
            </motion.div>
        );
    };

    export default KpiStrip;