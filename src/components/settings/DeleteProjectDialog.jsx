import React, { useState } from 'react';
    import {
      AlertDialog,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
    } from "@/components/ui/alert-dialog";
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Loader2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useProject } from '@/contexts/ProjectContext';

    export const DeleteProjectDialog = ({ project, open, onOpenChange, onSuccess }) => {
      const [confirmationText, setConfirmationText] = useState('');
      const [isDeleting, setIsDeleting] = useState(false);
      const { toast } = useToast();
      const { refreshProjects, setSelectedProject } = useProject();

      const isConfirmationMatching = confirmationText === project?.name;

      const handleDelete = async () => {
        if (!isConfirmationMatching) {
          toast({
            variant: 'destructive',
            title: 'Confirmation text does not match.',
          });
          return;
        }

        setIsDeleting(true);
        try {
          const { error } = await supabase.rpc('delete_project', { p_project_id: project.id });

          if (error) {
            throw error;
          }

          toast({
            title: 'Project Deleted',
            description: `Project "${project.name}" has been permanently deleted.`,
          });
          
          setSelectedProject(null);
          await refreshProjects();
          if (onSuccess) onSuccess();
          onOpenChange(false);

        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Error deleting project',
            description: error.message,
          });
        } finally {
          setIsDeleting(false);
          setConfirmationText('');
        }
      };

      if (!project) return null;

      return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project <span className="font-bold text-destructive">{project.name}</span> and all of its associated data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <Label htmlFor="confirmation">
                To confirm, please type <span className="font-semibold text-foreground">{project.name}</span> in the box below.
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                autoComplete="off"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!isConfirmationMatching || isDeleting}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    };