import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const modulePathMap = {
  'Budget Tracker': '/dashboard?tab=budget',
  'Expense Tracker': '/dashboard?tab=expenses',
  'Material Inventory': '/dashboard?tab=materials',
  'Gantt Planner': '/dashboard?tab=planner',
  'Remote Monitoring': '/dashboard?tab=media-logs',
  'Team Directory': '/dashboard?tab=team',
  'Reports & Exports': '/dashboard?tab=reports',
};

const ModuleLinks = ({ modules }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleModuleClick = (moduleName) => {
    const path = modulePathMap[moduleName];
    if (path) {
      navigate(path);
    } else {
      toast({
        title: "🚧 Feature in progress!",
        description: `The "${moduleName}" module isn't ready yet, but it's coming soon!`,
      });
    }
  };

  if (!modules || modules.length === 0) {
    return <span className="text-gray-500 text-xs">None</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {modules.map((module) => (
        <Button
          key={module}
          variant="outline"
          size="sm"
          className="text-xs h-auto py-1 px-2"
          onClick={() => handleModuleClick(module)}
        >
          {module}
        </Button>
      ))}
    </div>
  );
};

export default ModuleLinks;