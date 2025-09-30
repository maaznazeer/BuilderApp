import React from 'react';
import { motion } from 'framer-motion';
import { ListTodo, Loader, CheckCircle, UserCheck } from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import { supabase } from '@/lib/customSupabaseClient';
import { useDashboard } from '@/contexts/DashboardContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from 'react-query';

const fetchTaskCounts = async (scope, projectId, onlyMine) => {
    const { data, error } = await supabase.rpc('get_task_counts', { 
        p_scope: scope, 
        p_project_id: projectId,
        p_only_mine: onlyMine
    });

    if (error) throw new Error(error.message);
    
    if (onlyMine) {
        return {
            my_unassigned: data?.[0]?.count_unassigned || 0,
            my_inprogress: data?.[0]?.count_inprogress || 0,
            my_completed: data?.[0]?.count_completed || 0
        };
    }
    
    return data[0];
};

const CardGroup = ({ cards, title, onlyMine: groupOnlyMine = false }) => {
    const { scope, selectedProjectId, onlyMine: contextOnlyMine } = useDashboard();
    
    const isMyTasksGroup = groupOnlyMine;
    const queryOnlyMine = isMyTasksGroup || contextOnlyMine;

    const { data: taskCounts, isLoading } = useQuery(
        ['taskCounts', scope, selectedProjectId, queryOnlyMine],
        () => fetchTaskCounts(scope, selectedProjectId, queryOnlyMine)
    );

    const cardDetails = [
        {
            title: "Unassigned",
            valueBinding: "count_unassigned",
            icon: ListTodo,
            color: "text-amber-500",
            link: "/dashboard/tasks?status=Unassigned",
        },
        {
            title: "In Progress",
            valueBinding: "count_inprogress",
            icon: Loader,
            color: "text-sky-500",
            link: "/dashboard/tasks?status=In Progress",
        },
        {
            title: "Completed",
            valueBinding: "count_completed",
            icon: CheckCircle,
            color: "text-emerald-500",
            link: "/dashboard/tasks?status=Completed",
        },
        {
            title: "Unassigned to Me",
            valueBinding: "my_unassigned",
            icon: UserCheck,
            color: "text-amber-500",
            link: "/dashboard/tasks?status=Unassigned&assignee=me",
        },
        {
            title: "In Progress",
            valueBinding: "my_inprogress",
            icon: Loader,
            color: "text-sky-500",
            link: "/dashboard/tasks?status=In Progress&assignee=me",
        },
        {
            title: "Completed",
            valueBinding: "my_completed",
            icon: CheckCircle,
            color: "text-emerald-500",
            link: "/dashboard/tasks?status=Completed&assignee=me",
        },
    ];

    const getCardProps = (cardConfig) => {
        const details = cardDetails.find(d => d.title === cardConfig.title && d.valueBinding === cardConfig.valueBinding);
        if (!details) {
            const genericDetails = cardDetails.find(d => d.title === cardConfig.title);
            if (!genericDetails) return null;
            return {
                ...genericDetails,
                value: taskCounts ? taskCounts[cardConfig.valueBinding] : 0,
            }
        }

        return {
            title: details.title,
            value: taskCounts ? taskCounts[details.valueBinding] : 0,
            icon: details.icon,
            color: details.color,
            link: details.link
        };
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
            </div>
        );
    }
    
    return (
        <div>
            {title && <h2 className="text-lg font-semibold text-gray-800 mb-3">{title}</h2>}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.1 } }
                }}
            >
                {cards.map((card, index) => {
                    const cardProps = getCardProps(card);
                    if (!cardProps) return null;
                    return <KpiCard key={index} {...cardProps} />;
                })}
            </motion.div>
        </div>
    );
};

export default CardGroup;