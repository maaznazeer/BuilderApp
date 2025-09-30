import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProjectCard from '@/components/dashboard/ProjectCard';

const OverviewTab = ({ projects = [] }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const renderContent = () => {
    if (projects.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <Card className="max-w-lg mx-auto">
            <CardHeader>
                <div className="mx-auto bg-primary-foreground rounded-full h-20 w-20 flex items-center justify-center">
                    <PlusCircle className="h-10 w-10 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
              <h2 className="text-2xl font-bold mb-2">No Projects Found Yet</h2>
              <p className="text-muted-foreground mb-6">Get started by creating your first construction project.</p>
              <Button onClick={() => navigate('/dashboard/projects?new=true')}>
                Add Your First Project
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </motion.div>
    );
  };

  return <div className="space-y-6">{renderContent()}</div>;
};

export default OverviewTab;