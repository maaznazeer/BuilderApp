import React from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Skeleton } from '@/components/ui/skeleton';
    import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
    import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics.js';
    import { useMediaQuery } from '@/hooks/useMediaQuery';
    import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
    import { AlertCircle, DollarSign, Zap } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useDashboard } from '@/contexts/DashboardContext.jsx';
    import { Link } from 'react-router-dom';

    const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--destructive))', '#8884d8', '#82ca9d'];

    const LockedPanel = () => (
        <Card className="relative h-full border-l-4 border-primary">
            <div className="absolute inset-0 bg-background/70 z-10 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-center p-6">
                <Zap className="h-12 w-12 text-accent mb-4"/>
                <h3 className="text-xl font-bold text-foreground">Unlock Spend Analytics</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-4">Upgrade to a Basic plan or higher to visualize your spending and gain financial insights.</p>
                <Button asChild>
                    <Link to="/pricing">Upgrade Plan</Link>
                </Button>
            </div>
            <CardHeader>
                <CardTitle className="flex items-center"><DollarSign className="mr-2 h-5 w-5 text-success" />Spend by Category (30d)</CardTitle>
                <CardDescription>A breakdown of your expenses in the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] filter blur-sm">
                <Skeleton className="h-full w-full" />
            </CardContent>
        </Card>
    );

    const SpendByCategoryPanel = () => {
        const { data: analytics, isLoading, isError, error, refetch } = useDashboardAnalytics();
        const isMobile = useMediaQuery("(max-width: 768px)");
        const { plan } = useDashboard();
        const hasAccess = plan !== 'freemium';
        const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

        if (!hasAccess) {
            return <LockedPanel />;
        }

        if (isLoading) {
            return (
                <Card className="border-l-4 border-primary">
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-[300px]">
                        <Skeleton className="h-48 w-48 rounded-full" />
                    </CardContent>
                </Card>
            );
        }
        
        if (isError) {
            return (
                 <Card className="border-l-4 border-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center"><DollarSign className="mr-2 h-5 w-5 text-success" />Spend by Category (30d)</CardTitle>
                        <CardDescription>A breakdown of your expenses in the last 30 days.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-[300px]">
                        <Alert variant="destructive" className="w-full">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error Loading Data</AlertTitle>
                            <AlertDescription>
                                {error.message}
                                <Button variant="link" onClick={() => refetch()} className="p-0 h-auto ml-2">Retry</Button>
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            );
        }

        const chartData = analytics?.spend_by_category_30d || [];

        return (
            <Card className="border-l-4 border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl font-bold gap-2"><DollarSign className="mr-2 h-6 w-6 text-primary" />Spend by Category (30d)</CardTitle>
                    <CardDescription>A breakdown of your expenses in the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                    {chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            No spending data available for the last 30 days.
                        </div>
                    ) : isMobile ? (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-sm" aria-label="Spend by category data table">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left font-semibold p-2">Category</th>
                                        <th className="text-right font-semibold p-2">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chartData.map((entry, index) => (
                                        <tr key={`row-${index}`} className="border-b">
                                            <td className="p-2 flex items-center">
                                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                                {entry.category}
                                            </td>
                                            <td className="text-right p-2">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(entry.total_spent)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart aria-label="Donut chart showing spend by category for the last 30 days.">
                                <Pie
                                    data={chartData}
                                    dataKey="total_spent"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={60}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    isAnimationActive={!prefersReducedMotion}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        );
    };

    export default SpendByCategoryPanel;