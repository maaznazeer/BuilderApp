import React from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const Notifications = () => {
    const { toast } = useToast();
    const hasNotifications = true; // Mock data

    const handleNotificationClick = () => {
        toast({
            title: "🚧 Feature Not Implemented",
            description: "You can request this feature in your next prompt! 🚀",
        });
    };

    return (
        <Popover onOpenChange={(open) => { if(open) handleNotificationClick() }}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {hasNotifications && (
                        <span className="absolute top-1 right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 font-medium border-b">
                    Notifications
                </div>
                <div className="p-4 text-sm text-center text-muted-foreground">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                    <p className="mt-2">You're all caught up!</p>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default Notifications;