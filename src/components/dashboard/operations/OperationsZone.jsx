import React from 'react';
import ActivityFeed from './ActivityFeed';
import DeliveriesTimeline from './DeliveriesTimeline';
import QuickActions from './QuickActions';
import { useDashboardOperations } from '@/hooks/useDashboardOperations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Zap, ListChecks, Truck } from 'lucide-react';
import { useQueryClient } from 'react-query';
import { useDashboard } from '@/contexts/DashboardContext.jsx';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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

const OperationsZone = () => {
    const { data, isLoading, isError, error } = useDashboardOperations();
    const queryClient = useQueryClient();
    const { plan } = useDashboard();
    const planName = plan?.toLowerCase();

    const showDeliveries = planName === 'basic' || planName === 'premium' || planName === 'lifetime';

    const handleRefresh = () => {
        queryClient.invalidateQueries('dashboardOperations');
        queryClient.invalidateQueries('dashboardKpis');
        queryClient.invalidateQueries('dashboardAnalytics');
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Operations</h2>
                <QuickActions onActionSuccess={handleRefresh} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <Card className="h-full border-l-4 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ListChecks className="h-5 w-5 text-primary" />
                                Activity Feed
                            </CardTitle>
                            <CardDescription>The latest events from across your projects.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading && <ActivityFeed.Skeleton />}
                            {isError && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert>}
                            {!isLoading && !isError && <ActivityFeed activities={data?.activity_feed} />}
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card className="h-full border-l-4 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-primary" />
                                Deliveries Timeline
                            </CardTitle>
                            <CardDescription>Upcoming material deliveries in the next 14 days.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!showDeliveries ? (
                                <UpgradeCTA 
                                    title="Track Your Deliveries"
                                    description="Upgrade to get a timeline of all your upcoming material deliveries."
                                />
                            ) : isLoading ? (
                                <DeliveriesTimeline.Skeleton />
                            ) : isError ? (
                                <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert>
                            ) : (
                                <DeliveriesTimeline deliveries={data?.deliveries_timeline} />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default OperationsZone;