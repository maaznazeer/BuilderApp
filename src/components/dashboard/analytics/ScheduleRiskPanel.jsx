import React, { useMemo } from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { useDashboard } from '@/contexts/DashboardContext.jsx';
    import { Skeleton } from '@/components/ui/skeleton';
    import { AlertCircle, CalendarCheck, Clock, TrendingUp, Zap, EyeOff } from 'lucide-react';
    import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
    import { Button } from '@/components/ui/button.jsx';
    import { useNavigate } from 'react-router-dom';

    const ScheduleRiskPanel = () => {
        const { analytics, analyticsLoading, hasFeature, plan } = useDashboard();
        const navigate = useNavigate();

        const riskData = useMemo(() => analytics?.schedule_risk || {}, [analytics]);
        const trendData = useMemo(() => analytics?.schedule_risk_trend_60d || [], [analytics]);

        const formattedTrendData = useMemo(() => {
            return trendData.map(item => ({
                ...item,
                week_start_formatted: new Date(item.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }));
        }, [trendData]);
        
        if (!hasFeature('risk')) {
            return (
                <Card className="flex flex-col border-l-4 border-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-muted-foreground">
                            <EyeOff className="h-5 w-5" />
                            Schedule Risk
                        </CardTitle>
                        <CardDescription>Advanced risk analysis is a premium feature.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
                        <Zap className="h-12 w-12 text-yellow-400 mb-4" />
                        <p className="text-lg font-semibold">Unlock Advanced Analytics</p>
                        <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-4">
                            Gain insights into schedule risks, delays, and trends to keep your projects on track.
                        </p>
                        <Button onClick={() => navigate('/pricing')}>
                            Upgrade to Premium
                        </Button>
                    </CardContent>
                </Card>
            );
        }
        
        if (analyticsLoading) {
            return (
                <Card className="border-l-4 border-primary">
                    <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card className="flex flex-col border-l-4 border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl font-bold gap-2"><Clock className="h-6 w-6 text-primary" />Schedule Risk</CardTitle>
                    <CardDescription>Analysis of project timelines and potential delays.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-2 text-red-600">
                               <AlertCircle className="h-5 w-5" />
                               <p className="text-sm font-semibold">Delayed Milestones</p>
                            </div>
                            <p className="text-2xl font-bold text-red-800">{riskData.delayed_milestones_count || 0}</p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-600">
                               <Clock className="h-5 w-5" />
                               <p className="text-sm font-semibold">Avg. Lateness</p>
                            </div>
                            <p className="text-2xl font-bold text-yellow-800">{riskData.avg_lateness_days || 0} days</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <div className="flex items-center gap-2 text-orange-600">
                               <AlertCircle className="h-5 w-5" />
                               <p className="text-sm font-semibold">Overdue Tasks</p>
                            </div>
                            <p className="text-2xl font-bold text-orange-800">{riskData.overdue_tasks_count || 0}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 text-blue-600">
                               <CalendarCheck className="h-5 w-5" />
                               <p className="text-sm font-semibold">Upcoming Milestones</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-800">{riskData.upcoming_milestones_14d || 0}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4" />Delayed Milestones Trend (60 Days)</h4>
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={formattedTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="week_start_formatted" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Bar dataKey="delayed_count" fill="hsl(var(--primary))" name="Delayed" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
                <CardFooter>
                     <p className="text-xs text-muted-foreground">This panel provides high-level risk indicators. For detailed management, use the Risks tab in a project.</p>
                </CardFooter>
            </Card>
        );
    };

    export default ScheduleRiskPanel;