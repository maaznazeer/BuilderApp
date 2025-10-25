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
      const [deleteStep, setDeleteStep] = useState('');
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
          // Get counts of dependent records for user information
          const [payrollCount, expensesCount, tasksCount, materialsCount, ledgerCount] = await Promise.all([
            supabase.from('payroll_entries').select('id', { count: 'exact' }).eq('project_code', project.code),
            supabase.from('expenses').select('id', { count: 'exact' }).eq('project_id', project.id),
            supabase.from('pm_tasks').select('id', { count: 'exact' }).eq('project_code', project.code),
            supabase.from('task_materials').select('id', { count: 'exact' }).eq('pm_tasks.project_code', project.code),
            supabase.from('financial_ledger').select('id', { count: 'exact' }).eq('project_code', project.code)
          ]);

          const totalDependencies = 
            (payrollCount.count || 0) +
            (expensesCount.count || 0) +
            (tasksCount.count || 0) +
            (materialsCount.count || 0) +
            (ledgerCount.count || 0);

          console.log(`Deleting project "${project.name}" with ${totalDependencies} dependent records`);

          // Perform cascading delete in the correct order
          const deleteOperations = [];

          // 1. Delete task materials first (they reference tasks)
          if (materialsCount.count > 0) {
            setDeleteStep('Deleting task materials...');
            deleteOperations.push(
              supabase.from('task_materials')
                .delete()
                .eq('pm_tasks.project_code', project.code)
            );
          }

          // 2. Delete tasks
          if (tasksCount.count > 0) {
            setDeleteStep('Deleting tasks...');
            deleteOperations.push(
              supabase.from('pm_tasks')
                .delete()
                .eq('project_code', project.code)
            );
          }

          // 3. Delete payroll entries
          if (payrollCount.count > 0) {
            setDeleteStep('Deleting payroll entries...');
            deleteOperations.push(
              supabase.from('payroll_entries')
                .delete()
                .eq('project_code', project.code)
            );
          }

          // 4. Delete expenses
          if (expensesCount.count > 0) {
            setDeleteStep('Deleting expenses...');
            deleteOperations.push(
              supabase.from('expenses')
                .delete()
                .eq('project_id', project.id)
            );
          }

          // 5. Delete financial ledger entries
          if (ledgerCount.count > 0) {
            setDeleteStep('Deleting financial ledger entries...');
            deleteOperations.push(
              supabase.from('financial_ledger')
                .delete()
                .eq('project_code', project.code)
            );
          }

          // 6. Delete worker-project relationships
          setDeleteStep('Deleting worker relationships...');
          deleteOperations.push(
            supabase.from('worker_projects')
              .delete()
              .eq('project_code', project.code)
          );

          // 7. Delete supplier-project relationships
          setDeleteStep('Deleting supplier relationships...');
          deleteOperations.push(
            supabase.from('suppliers')
              .delete()
              .eq('project_id', project.id)
          );

          // Execute all delete operations
          if (deleteOperations.length > 0) {
            console.log(`Executing ${deleteOperations.length} delete operations`);
            await Promise.all(deleteOperations);
          }

          // 8. Finally, delete the project itself
          setDeleteStep('Deleting project...');
          const { error } = await supabase.rpc('delete_project', { p_project_id: project.id });

          if (error) {
            throw error;
          }

          toast({
            title: 'Project Deleted Successfully',
            description: `Project "${project.name}" and all its associated data (${totalDependencies} records) have been permanently deleted.`,
          });
          
          setSelectedProject(null);
          await refreshProjects();
          if (onSuccess) onSuccess();
          onOpenChange(false);

        } catch (error) {
          console.error('Delete project error:', error);
          toast({
            variant: 'destructive',
            title: 'Error deleting project',
            description: `Failed to delete project: ${error.message}`,
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
                This action cannot be undone. This will permanently delete the project <span className="font-bold text-destructive">{project.name}</span> and <span className="font-bold text-destructive">ALL</span> of its associated data including:
                <ul className="mt-2 ml-4 list-disc text-sm">
                  <li>All payroll entries</li>
                  <li>All expenses</li>
                  <li>All tasks and task materials</li>
                  <li>All financial ledger entries</li>
                  <li>All worker-project relationships</li>
                  <li>All supplier-project relationships</li>
                </ul>
                <span className="text-destructive font-semibold">This will permanently remove all project data from our servers.</span>
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
                disabled={isDeleting}
              />
              {isDeleting && deleteStep && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{deleteStep}</span>
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!isConfirmationMatching || isDeleting}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isDeleting ? (deleteStep || 'Deleting...') : 'Delete Project'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    };