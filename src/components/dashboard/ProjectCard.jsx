import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Camera, MessageSquare, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const ProjectCard = ({ project }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFeatureClick = (featureName) => {
    toast({
      title: `🚧 ${featureName} is a work in progress!`,
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-800';
      case 'Planned': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-success-foreground text-success';
      case 'On Hold': return 'bg-danger-foreground text-danger';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger': return <AlertCircle className="w-4 h-4 text-danger" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-accent" />;
      case 'info': return <Info className="w-4 h-4 text-primary" />;
      default: return null;
    }
  };

  const overallProgress = project.progress || 0;
  const spent = project.spent || 0;
  const budget = project.budget || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden flex flex-col">
        <div className="p-6 flex-grow">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status || 'N/A'}
            </span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/project-settings')}>
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          
          <h3 className="text-lg font-bold text-foreground mb-1">{project.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{project.location || 'Location not set'}</p>
          
          <div className="space-y-3 mb-6">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget</span>
              <span className="font-medium text-foreground">{budget > 0 ? `$${spent.toLocaleString()} / $${budget.toLocaleString()}` : 'Not set'}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Contractor</span>
              <span className="font-medium text-foreground">{project.contractor || 'N/A'}</span>
            </div>
          </div>

          {project.alerts && project.alerts.length > 0 && (
            <div className="space-y-2">
              {project.alerts.map((alert, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs p-2 bg-muted rounded-md">
                  {getAlertIcon(alert.type)}
                  <span className="text-muted-foreground">{alert.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-muted border-t border-border flex items-center space-x-2">
          <Button size="sm" className="flex-1 text-primary-foreground" onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
            View Details
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleFeatureClick('Upload Photos')}>
            <Camera className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleFeatureClick('Team Chat')}>
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;