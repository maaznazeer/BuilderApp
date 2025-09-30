import React from 'react';
import { useAiAlerts } from '@/hooks/useAiHub';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Info, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const AlertsStream = ({ projectId }) => {
    const { data: alerts, isLoading, error } = useAiAlerts(projectId);

    const getAlertMeta = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical':
            case 'high':
                return { Icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-50' };
            case 'warning':
                return { Icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
            case 'info':
                return { Icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-50' };
            default:
                return { Icon: ShieldCheck, color: 'text-gray-500', bgColor: 'bg-gray-50' };
        }
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-6 w-6" />
                    AI Alerts Stream
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {isLoading && Array.from({ length: 5 }).map((_, i) => (
                             <div key={i} className="flex items-start space-x-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-3 w-1/3" />
                                </div>
                            </div>
                        ))}
                        {error && (
                            <div className="text-center text-red-500 py-8">
                                <div className="flex flex-col items-center gap-2">
                                    <AlertCircle className="h-8 w-8" />
                                    <span>Error loading alerts.</span>
                                </div>
                            </div>
                        )}
                        {!isLoading && alerts?.map(alert => {
                            const { Icon, color, bgColor } = getAlertMeta(alert.severity);
                            return (
                                <div key={alert.id} className="flex items-start gap-4">
                                    <div className={cn("rounded-full p-2", bgColor)}>
                                        <Icon className={cn("h-5 w-5", color)} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{alert.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        {!isLoading && alerts?.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                No alerts from the AI yet. All clear!
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default AlertsStream;