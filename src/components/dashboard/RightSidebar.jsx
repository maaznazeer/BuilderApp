import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Info, Plus, Upload, UserPlus } from 'lucide-react';
import AddProjectDialog from '@/components/dashboard/AddProjectDialog.jsx';
import QuickUploadMediaDialog from '@/components/dashboard/operations/modals/QuickUploadMediaDialog.jsx';
import QuickInviteDialog from '@/components/dashboard/operations/modals/QuickInviteDialog.jsx';
import { useToast } from '@/components/ui/use-toast';

const RightSidebar = () => {
  const { toast } = useToast();
  const [activeModal, setActiveModal] = useState(null);

  const handleSuccess = (modalName, message) => {
    toast({
      title: 'Success!',
      description: message || `${modalName} action completed successfully.`,
    });
    setActiveModal(null);
  };

  return (
    <>
      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <PlusCircle className="mr-2 h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full font-bold"
              onClick={() => setActiveModal('addProject')}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
            <Button
              className="w-full font-bold bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => setActiveModal('uploadMedia')}
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Media
            </Button>
            <Button
              className="w-full font-bold bg-muted-foreground hover:bg-muted-foreground/90 text-primary-foreground"
              onClick={() => setActiveModal('inviteCollaborator')}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Invite Contractor
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <Info className="mr-2 h-5 w-5 text-muted-foreground" />
              Contextual Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This panel will show information relevant to the current page you are viewing.
            </p>
          </CardContent>
        </Card>
      </aside>

      <AddProjectDialog
        isOpen={activeModal === 'addProject'}
        onOpenChange={() => setActiveModal(null)}
      />

      <QuickUploadMediaDialog
        isOpen={activeModal === 'uploadMedia'}
        onOpenChange={() => setActiveModal(null)}
        onSuccess={() => handleSuccess('Upload Media', 'Files uploaded successfully!')}
      />

      <QuickInviteDialog
        isOpen={activeModal === 'inviteCollaborator'}
        onOpenChange={() => setActiveModal(null)}
        onSuccess={() => handleSuccess('Invite Collaborator', 'Invitation sent successfully!')}
      />
    </>
  );
};

export default RightSidebar;