import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics.js';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, AlertTriangle, CalendarCheck2 } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext.jsx';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, value, label, link, color, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    );
  }

  return (
    <Link to={link} className="block hover:bg-muted/50 p-3 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg bg-opacity-10 ${color.bg}`}>
          <Icon className={`h-6 w-6 ${color.text}`} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </Link>
  );
};

const WelcomeHeader = () => {
  const { profile } = useAuth();
  const { projectIds } = useDashboard();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();

  const firstName = profile?.full_name?.split(' ')[0] || 'User';

  const stats = [
    {
      icon: Briefcase,
      value: metrics?.active_projects_count || 0,
      label: 'Active Projects',
      link: '/dashboard/projects',
      color: { text: 'text-blue-500', bg: 'bg-blue-500' },
    },
    {
      icon: AlertTriangle,
      value: metrics?.overdue_tasks || 0,
      label: 'Overdue Tasks',
      link: '/dashboard/tasks',
      color: { text: 'text-red-500', bg: 'bg-red-500' },
    },
    {
      icon: CalendarCheck2,
      value: metrics?.upcoming_milestones_7d || 0,
      label: 'Milestones (7d)',
      link: '/dashboard/milestones',
      color: { text: 'text-amber-500', bg: 'bg-amber-500' },
    },
  ];

  return (
    <Card className="w-full bg-gradient-to-r from-background to-muted/30 border-primary/10 border">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-sm text-muted-foreground">Here's a quick look at your construction status.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} isLoading={metricsLoading} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeHeader;