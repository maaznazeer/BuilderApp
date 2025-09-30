import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, MessageSquare, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RecentActivity = () => {
  const recentActivities = [
    {
      id: 1,
      type: "update",
      message: "Foundation work completed for Family Home - Lagos",
      time: "2 hours ago",
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      id: 2,
      type: "alert",
      message: "Budget alert: Kitchen Renovation approaching 80% threshold",
      time: "4 hours ago",
      icon: AlertTriangle,
      color: "text-yellow-500"
    },
    {
      id: 3,
      type: "message",
      message: "New message from John Contractor about material delivery",
      time: "6 hours ago",
      icon: MessageSquare,
      color: "text-blue-500"
    },
    {
      id: 4,
      type: "upload",
      message: "Progress photos uploaded for Office Building project",
      time: "1 day ago",
      icon: Camera,
      color: "text-purple-500"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;