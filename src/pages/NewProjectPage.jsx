import React from 'react';
    import { Helmet } from 'react-helmet-async';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import AddProjectForm from '@/components/projects/AddProjectForm';
    import { useNavigate } from 'react-router-dom';
    import { useToast } from '@/components/ui/use-toast';
    import { useProject } from '@/contexts/ProjectContext.jsx';
    import { ArrowLeft } from 'lucide-react';
    import { Button } from '@/components/ui/button';

    const NewProjectPage = () => {
        const navigate = useNavigate();
        const { toast } = useToast();
        const { addAndSelectProject } = useProject();

        const handleSuccess = async (newProject) => {
            toast({
                title: 'Project Created Successfully!',
                description: `The project "${newProject.name}" is now ready.`,
            });
            await addAndSelectProject(newProject);
            navigate(`/dashboard/projects/${newProject.id}`);
        };

        const handleCancel = () => {
            navigate(-1);
        };

        return (
            <>
                <Helmet>
                    <title>Create New Project | DomusBuilder</title>
                    <meta name="description" content="Start a new construction project with DomusBuilder." />
                </Helmet>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl">
                         <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold tracking-tight">Create a New Project</CardTitle>
                                <CardDescription>Fill in the details below to get your new project up and running.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AddProjectForm onSuccess={handleSuccess} onCancel={handleCancel} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </>
        );
    };

    export default NewProjectPage;