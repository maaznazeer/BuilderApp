import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast.js';
import { motion } from 'framer-motion';
import AddProjectDialog from '@/components/dashboard/AddProjectDialog.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';

const HeroCard = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { refreshProjects } = useProject();
    const [isAddProjectDialogOpen, setAddProjectDialogOpen] = useState(false);

    const handleGetStartedClick = () => {
        navigate('/guides/dashboard');
    };
    
    const handleAddProjectClick = () => {
      setAddProjectDialogOpen(true);
    };

    const handleProjectCreated = () => {
        setAddProjectDialogOpen(false);
        refreshProjects();
        toast({
          title: "Project Created!",
          description: "Your new project is ready to be configured.",
        });
    };

    return (
        <>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl bg-white p-8 md:p-10 shadow-sm border border-gray-100"
            >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-gray-800">
                        <p className="font-semibold text-primary mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || 'Victor'} 👋</p>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-gray-900">Here’s the status of your builds</h1>
                        <p className="text-gray-500 max-w-md mb-6">Stay on top of projects, budgets, and milestones.</p>
                        <div className="flex flex-wrap gap-4">
                             <Button 
                                size="lg" 
                                onClick={handleAddProjectClick}
                            >
                                Add project
                            </Button>
                            <Button 
                                size="lg" 
                                variant="secondary" 
                                onClick={handleGetStartedClick}
                            >
                                Get started
                            </Button>
                        </div>
                    </div>
                    <div className="hidden md:flex justify-center items-center">
                        <div className="w-64 h-64 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                            <img  class="w-full h-full object-cover" alt="Illustration of a modern house blueprint and construction tools" src="https://images.unsplash.com/flagged/photo-1564767609237-ee41afa5eed5" />
                        </div>
                    </div>
                </div>
            </motion.div>

            <AddProjectDialog
                isOpen={isAddProjectDialogOpen}
                onOpenChange={setAddProjectDialogOpen}
                onSuccess={handleProjectCreated}
            />
        </>
    );
};

export default HeroCard;