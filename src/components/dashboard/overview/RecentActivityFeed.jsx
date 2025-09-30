import React, { useState } from 'react';
import { useFilteredActivityFeed } from '@/hooks/useFilteredActivityFeed.js';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileText, CheckCircle, Monitor, MessageSquare, Tag, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const activityIcons = {
  Expense: { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-100' },
  Task: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
  Milestone: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
  Media: { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  Team: { icon: Users, color: 'text-purple-500', bg: 'bg-purple-100' },
  Default: { icon: Tag, color: 'text-gray-500', bg: 'bg-gray-100' }
};

const ActivityItem = ({ item, index }) => {
  const { icon: Icon, color, bg } = activityIcons[item.kind] || activityIcons.Default;
  const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start space-x-4 pb-4"
    >
      <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: item.summary }} />
        <Link to={`/dashboard/projects/${item.project_id}`} className="text-xs text-muted-foreground hover:underline">
          {timeAgo} on {item.project_name}
        </Link>
      </div>
    </motion.div>
  );
};

const RecentActivityFeed = () => {
  const [filter, setFilter] = useState('All');
  const { data: activities, isLoading, isError, error, refetch } = useFilteredActivityFeed(filter === 'All' ? null : filter);

  const filters = ['All', 'Expense', 'Task', 'Media', 'Team'];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>The latest events from across your projects.</CardDescription>
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.map(f => (
            <Badge
              key={f}
              variant={filter === f ? 'default' : 'secondary'}
              onClick={() => setFilter(f)}
              className="cursor-pointer"
            >
              {f}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[600px] pr-4">
          {isLoading && (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error.message || 'Could not load activity.'}
                <button onClick={() => refetch()} className="ml-2 underline font-bold">Retry</button>
              </AlertDescription>
            </Alert>
          )}
          {!isLoading && !isError && activities && activities.length > 0 ? (
            <AnimatePresence>
                {activities.map((item, index) => (
                    <ActivityItem key={item.event_id} item={item} index={index} />
                ))}
            </AnimatePresence>
          ) : (
            !isLoading && <p className="text-center text-muted-foreground pt-10">No activity to show for this filter.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;