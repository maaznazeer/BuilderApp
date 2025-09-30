import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ListTodo, DollarSign, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDashboardOperations } from '@/hooks/useDashboardOperations';

const eventIcons = {
    Task: ListTodo,
    Expense: DollarSign,
    Media: ImageIcon,
    Milestone: CheckCircle,
    default: ListTodo,
};

const ActivityFeed = () => {
    const { data, isLoading, isError, error } = useDashboardOperations();
    const activities = data?.activity_feed;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-4 p-2">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (isError) {
            return (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Activity</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            );
        }

        if (!activities || activities.length === 0) {
            return <div className="text-center text-muted-foreground py-10 h-full flex items-center justify-center">No recent activity.</div>;
        }

        return (
            <ScrollArea className="h-[350px]">
                <div className="space-y-4 pr-4">
                    {activities.map((activity, index) => {
                        const Icon = eventIcons[activity.event_type] || eventIcons.default;
                        return (
                            <div key={index} className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="bg-muted p-2 rounded-full">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm">{activity.details}</p>
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-semibold">{activity.project_name}</span> &bull; {formatDistanceToNow(new Date(activity.event_timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        );
    };
    
    return (
        <Card className="h-full">
            <CardHeader className="p-6 pb-6">
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>Recent events from your projects.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
                {renderContent()}
            </CardContent>
        </Card>
    );
};

export default ActivityFeed;