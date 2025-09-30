import React from 'react';
import { format, isPast } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
        case 'scheduled': return 'default';
        case 'in_transit': return 'warning';
        case 'delayed': return 'destructive';
        default: return 'secondary';
    }
};

const DeliveriesTimeline = ({ deliveries }) => {
    if (!deliveries || deliveries.length === 0) {
        return <div className="text-center text-muted-foreground py-10 h-96 flex items-center justify-center">No upcoming deliveries.</div>;
    }

    return (
        <ScrollArea className="h-96">
            <div className="space-y-6 pr-4 relative">
                <div className="absolute left-1.5 top-0 bottom-0 w-px bg-border"></div>
                {deliveries.map((delivery) => {
                    const overdue = isPast(new Date(delivery.date_expected)) && delivery.status !== 'Delivered';
                    return (
                        <div key={delivery.id} className="flex gap-4 relative">
                            <div className={cn("z-10 mt-1 w-3 h-3 rounded-full", overdue ? "bg-red-500" : "bg-blue-500")}></div>
                            <div className="flex-1">
                                <p className={cn("font-semibold", overdue && "text-red-600")}>
                                    {format(new Date(delivery.date_expected), 'MMM dd, yyyy')}
                                </p>
                                <p className="text-sm">{delivery.material_name}</p>
                                <p className="text-xs text-muted-foreground">{delivery.supplier_name || 'N/A'}</p>
                                <Badge variant={getStatusBadgeVariant(delivery.status)} className="mt-2">{delivery.status}</Badge>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
};

DeliveriesTimeline.Skeleton = () => (
    <div className="space-y-6 h-96">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="w-px h-16 mt-1" />
                </div>
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

export default DeliveriesTimeline;