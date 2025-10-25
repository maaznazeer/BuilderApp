import React from 'react';
import { useDashboardModules } from '@/hooks/useDashboardModules.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Banknote, ShoppingCart, Image as ImageIcon, Target, MessageSquare, Shield, GanttChartSquare, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDashboard } from '@/contexts/DashboardContext.jsx';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', compactDisplay: 'short' }).format(value);
};

const MiniWidget = ({ icon: Icon, title, data, isLoading, link, color }) => {
    const navigate = useNavigate();
    
    const content = isLoading ? (
        <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    ) : (
        data
    );

    return (
        <motion.div 
          whileHover={{ scale: 1.03 }} 
          transition={{ type: 'spring', stiffness: 300 }}
          className="motion-safe:transition"
        >
            <Card className="h-full cursor-pointer hover:shadow-md border-l-4 border-primary/20 hover:border-primary/60 transition-colors" onClick={() => navigate(link)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Icon className={cn("h-4 w-4 text-muted-foreground", color)} />
                </CardHeader>
                <CardContent>
                    {content}
                </CardContent>
            </Card>
        </motion.div>
    );
};

const StrategicOverview = () => {
    const { data, isLoading, isError, error, refetch } = useDashboardModules();

    const widgets = [
        {
            title: 'Budget',
            icon: Banknote,
            link: '/dashboard/budget',
            color: 'text-green-500',
            render: (d) => (
                <div>
                    <div className="text-2xl font-bold">{formatCurrency(d?.budget?.total_spent)}</div>
                    <p className="text-xs text-muted-foreground">of {formatCurrency(d?.budget?.total_budget)} planned</p>
                </div>
            ),
        },
        {
            title: 'Sourcing',
            icon: ShoppingCart,
            link: '/dashboard/sourcing',
            color: 'text-sky-500',
            render: (d) => (
                <div>
                    <div className="text-2xl font-bold">{d?.sourcing?.pending_deliveries || 0}</div>
                    <p className="text-xs text-muted-foreground">pending deliveries</p>
                </div>
            ),
        },
        {
            title: 'Media',
            icon: ImageIcon,
            link: '/dashboard/media',
            color: 'text-indigo-500',
            render: (d) => (
                <div>
                    <div className="text-2xl font-bold">{d?.media?.uploads_this_week || 0}</div>
                    <p className="text-xs text-muted-foreground">uploads in last 7 days</p>
                </div>
            ),
        },
        {
            title: 'Milestones',
            icon: Target,
            link: '/dashboard/milestones',
            color: 'text-amber-500',
            render: (d) => (
                <div>
                    <div className="text-2xl font-bold">{d?.milestones?.overall_completion || 0}%</div>
                    <p className="text-xs text-muted-foreground">{d?.milestones?.completed_milestones || 0} of {d?.milestones?.total_milestones || 0} completed</p>
                </div>
            ),
        },
        {
            title: 'Communication',
            icon: MessageSquare,
            link: '/dashboard/communication',
            color: 'text-cyan-500',
            render: (d) => (
                <div>
                    <div className="text-2xl font-bold">{d?.communication?.general_messages_count || 0}</div>
                    <p className="text-xs text-muted-foreground">messages in #general</p>
                </div>
            ),
        },
        {
            title: 'Contingency',
            icon: Shield,
            link: '/dashboard/contingency',
            color: 'text-rose-500',
            render: (d) => (
                <div>
                    <div className="text-2xl font-bold">{formatCurrency(d?.contingency?.total_reserved)}</div>
                    <p className="text-xs text-muted-foreground">{d?.contingency?.scenario_count || 0} scenarios</p>
                </div>
            ),
        },
        {
            title: 'Payroll',
            icon: GanttChartSquare,
            link: '/dashboard/payroll',
            color: 'text-orange-500',
            render: (d) => (
                <div>
                    <div className="text-2xl font-bold">{formatCurrency(d?.payroll?.total_paid || 0)}</div>
                    <p className="text-xs text-muted-foreground">total payroll paid</p>
                </div>
            ),
        },
        {
            title: 'Loans',
            icon: Landmark,
            link: '/dashboard/loans',
            color: 'text-slate-500',
            render: (d) => (
                <div>
                    <div className="text-2xl font-bold">{formatCurrency(d?.loans?.outstanding_balance)}</div>
                    <p className="text-xs text-muted-foreground">{d?.loans?.open_loans_count || 0} open loans</p>
                </div>
            ),
        },
    ];

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Modules</AlertTitle>
                <AlertDescription>
                    {error.message}
                    <Button variant="link" onClick={() => refetch()} className="p-0 h-auto ml-2">Retry</Button>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-bold text-foreground mb-3 flex-shrink-0">Strategic Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 min-h-0">
                {widgets.map((widget, i) => (
                    <MiniWidget
                        key={i}
                        icon={widget.icon}
                        title={widget.title}
                        link={widget.link}
                        isLoading={isLoading}
                        data={widget.render(data)}
                        color={widget.color}
                    />
                ))}
            </div>
        </div>
    );
};

export default StrategicOverview;