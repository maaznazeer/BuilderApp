import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const UpcomingTasks = ({ tasks }) => {
  const upcomingTasks = tasks || [
    {
      id: 1,
      task: "Site inspection - Family Home",
      date: "Tomorrow",
      priority: "High",
      assignee: "David Supervisor"
    },
    {
      id: 2,
      task: "Material delivery - Kitchen tiles",
      date: "Jan 25",
      priority: "Medium",
      assignee: "Sarah Designer"
    },
    {
      id: 3,
      task: "Budget review meeting",
      date: "Jan 28",
      priority: "High",
      assignee: "Project Manager"
    },
  ];

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingTasks.slice(0, 3).map((task) => (
            <div key={task.id || task.milestone_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{task.task || task.phase_name}</h4>
                <p className="text-xs text-gray-600">Due: {task.date || task.due_date}</p>
              </div>
              <Badge variant={getPriorityVariant(task.priority)}>{task.priority || 'Medium'}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingTasks;