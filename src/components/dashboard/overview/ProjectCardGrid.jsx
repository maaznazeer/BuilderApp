import React from 'react';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/dashboard/ProjectCard.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ProjectCardGrid = () => {
  const { data: projects, isLoading, isError, error, refetch } = useProjects();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[280px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Projects</AlertTitle>
        <AlertDescription>
          {error.message || 'Could not load your projects.'}
          <button onClick={() => refetch()} className="ml-2 underline font-bold">Retry</button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-slate-50 p-8 rounded-xl border-2 border-dashed">
        <FolderOpen className="w-16 h-16 mb-4 text-slate-400" />
        <h3 className="text-lg font-semibold text-foreground">No Projects Yet</h3>
        <p className="mb-4">Create your first project to see it here.</p>
        <Button onClick={() => navigate('/projects/new')}>Create Project</Button>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.05 } }
      }}
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </motion.div>
  );
};

export default ProjectCardGrid;