import React from 'react';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, PieChart, BarChart, ShieldX, Zap } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext.jsx';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, Pie, Cell, Tooltip, Legend, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useMediaQuery } from '@/hooks/useMediaQuery.js';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ChartPlaceholder = () => (
    <div className="flex flex-col space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex items-center justify-center h-64">
            <Skeleton className="h-48 w-48 rounded-full" />
        </div>
        <div className="flex justify-center space-x-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
        </div>
    </div>
);

const SpendByCategoryChart = ({ data }) => {
    const isMobile = useMediaQuery("(max-width: 768px)");

    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No spending data for the last 30 days.</div>;
    }

    if (isMobile) {
        return (
            <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400" aria-label="Spend by Category Data">
                    <caption className="sr-only">Spend by Category Data Table</caption>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((entry, index) => (
                            <tr key={`cell-${index}`} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{entry.category}</th>
                                <td className="px-6 py-4">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(entry.total_spent)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                 <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_spent"
                    nameKey="category"
                    aria-label="Donut chart showing spend by category"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

const ScheduleRiskChart = ({ risk, trend }) => {
    const isMobile = useMediaQuery("(max-width: 768px)");

    const trendData = trend.map(t => ({...t, date: new Date(t.week_start).toLocaleDateString()}));

    if (isMobile) {
        return (
             <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400" aria-label="Schedule Risk Data">
                    <caption className="sr-only">Schedule Risk Data Table</caption>
                     <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Metric</th>
                            <th scope="col" className="px-6 py-3">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">Delayed Milestones</th>
                            <td className="px-6 py-4">{risk.delayed_milestones_count}</td>
                        </tr>
                         <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">Avg. Lateness</th>
                            <td className="px-6 py-4">{risk.avg_lateness_days} days</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <p className="text-3xl font-bold text-red-600">{risk.delayed_milestones_count}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Delayed Milestones</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <p className="text-3xl font-bold text-yellow-600">{risk.avg_lateness_days}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Lateness (days)</p>
                </div>
            </div>
            <div className="flex-grow">
                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 text-center">Delayed Milestones Trend (Last 60d)</p>
                <ResponsiveContainer width="100%" height={180}>
                     <BarChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} aria-label="Bar chart showing trend of delayed milestones over the last 60 days">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false}/>
                        <Tooltip />
                        <Bar dataKey="delayed_count" name="Delayed" fill="#ef4444" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


const UpgradeCTA = ({ title, description }) => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
            <Zap className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 my-2">{description}</p>
            <Button onClick={() => navigate('/pricing')}>Upgrade Plan</Button>
        </div>
    )
}

const InsightsZone = () => {
    const { data: analytics, isLoading, isError, error } = useDashboardAnalytics();
    const { plan } = useDashboard();
    const planName = plan?.toLowerCase();
    const showSpendChart = planName === 'basic' || planName === 'premium' || planName === 'lifetime';
    const showRiskChart = planName === 'premium' || planName === 'lifetime';

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><PieChart className="mr-2 h-5 w-5 text-blue-500" />Spend by Category (30d)</CardTitle>
                    <CardDescription>A breakdown of your expenses in the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!showSpendChart ? (
                        <UpgradeCTA 
                            title="Unlock Spend Analytics"
                            description="Get a detailed breakdown of your expenses by category to better manage your budget."
                        />
                    ) : isLoading ? (
                        <ChartPlaceholder />
                    ) : isError ? (
                        <div className="text-red-500 flex items-center"><ShieldX className="mr-2 h-4 w-4" /> {error.message}</div>
                    ) : (
                        <SpendByCategoryChart data={analytics?.spend_by_category_30d} />
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-red-500" />Schedule Risk</CardTitle>
                    <CardDescription>An overview of potential schedule delays and trends.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!showRiskChart ? (
                        <UpgradeCTA 
                            title="Unlock Advanced Analytics"
                            description="Get detailed insights into schedule risks and project trends to stay ahead of delays."
                        />
                    ) : isLoading ? (
                        <ChartPlaceholder />
                    ) : isError ? (
                        <div className="text-red-500 flex items-center"><ShieldX className="mr-2 h-4 w-4" /> {error.message}</div>
                    ) : (
                        <ScheduleRiskChart risk={analytics?.schedule_risk} trend={analytics?.schedule_risk_trend_60d} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default InsightsZone;