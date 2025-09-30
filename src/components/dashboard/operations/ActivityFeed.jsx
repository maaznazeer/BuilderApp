import React from 'react';
import { ListTodo, DollarSign, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const eventIcons = {
    Task: ListTodo,
    Expense: DollarSign,
    Media: ImageIcon,
    default: ListTodo,
};

const ActivityFeed = ({ activities }) => {
    const { toast } = useToast();

    const handleLinkClick = (e) => {
        e.preventDefault();
        toast({
            title: "🚧 Feature in Progress",
            description: "Navigating to the source item is not yet implemented.",
        });
    };

    if (!activities || activities.length === 0) {
        return <div className="text-center text-muted-foreground py-10 h-96 flex items-center justify-center">No recent activity.</div>;
    }

    return (
        <ScrollArea className="h-96">
            <div className="space-y-4 pr-4">
                {activities.map((activity, index) => {
                    const Icon = eventIcons[activity.event_type] || eventIcons.default;
                    return (
                        <Link to="#" onClick={handleLinkClick} key={index} className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="bg-muted p-2 rounded-full">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm">{activity.details}</p>
                                <p className="text-xs text-muted-foreground">
                                    <span className="font-semibold">{activity.project_name}</span> &bull; {formatDistanceToNow(new Date(activity.event_timestamp), { addSuffix: true })}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </ScrollArea>
    );
};

ActivityFeed.Skeleton = () => (
    <div className="space-y-4 h-96">
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

export default ActivityFeed;