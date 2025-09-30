import React from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Skeleton } from '@/components/ui/skeleton';
    import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
    import { useActivityFeed } from '@/hooks/useActivityFeed.js';
    import { Button } from '@/components/ui/button';
    import { Link } from 'react-router-dom';
    import { formatDistanceToNow } from 'date-fns';
    import {
      AlertCircle,
      ListChecks,
      DollarSign,
      Image,
      ClipboardCheck,
      Newspaper
    } from 'lucide-react';

    const eventIcons = {
      Task: ListChecks,
      Expense: DollarSign,
      Media: Image,
      Milestone: ClipboardCheck,
      default: Newspaper,
    };

    const ActivityFeedPanel = () => {
      const { data: activities, isLoading, isError, error, refetch } = useActivityFeed();

      const getLinkForItem = (item) => {
        return item.link_path || `/dashboard/projects/${item.project_id}`;
      };

      const renderContent = () => {
        if (isLoading) {
          return (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (isError) {
          return (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Activity</AlertTitle>
              <AlertDescription>
                {error.message}
                <Button variant="link" onClick={() => refetch()} className="p-0 h-auto ml-2">Retry</Button>
              </AlertDescription>
            </Alert>
          );
        }

        if (!activities || activities.length === 0) {
          return (
            <div className="text-center text-muted-foreground py-10">
              <p>No recent activity found across your projects.</p>
            </div>
          );
        }

        return (
          <ul className="space-y-2">
            {activities.map((activity) => {
              const Icon = eventIcons[activity.event_type] || eventIcons.default;
              return (
                <li key={activity.event_id}>
                  <Link to={getLinkForItem(activity)} className="block p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{activity.summary}</p>
                        <p className="text-sm text-muted-foreground">
                          On project <span className="font-semibold">{activity.project_name}</span> by {activity.actor_name}
                        </p>
                      </div>
                      <time className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </time>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        );
      };

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
                <Newspaper className="mr-2 h-5 w-5 text-primary" />
                Recent Activity
            </CardTitle>
            <CardDescription>The latest 15 events from across your projects.</CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      );
    };

    export default ActivityFeedPanel;