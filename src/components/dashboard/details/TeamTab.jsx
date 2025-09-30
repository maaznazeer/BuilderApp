import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import InviteCollaboratorDialog from '@/components/dashboard/details/InviteCollaboratorDialog.jsx';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';

const TeamTab = ({ project }) => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  const isOwner = currentUser?.id === project?.owner_uuid;

  const fetchCollaborators = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('collaborators')
      .select('id, role, profiles(id, full_name, email, avatar_url)')
      .eq('project_id', project.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error fetching collaborators', description: error.message });
    } else {
        const { data: ownerData, error: ownerError } = await supabase.from('profiles').select('id, full_name, email, avatar_url').eq('id', project.owner_uuid).single();
        
        const ownerProfile = {
            id: `owner-${project.owner_uuid}`,
            role: 'Owner',
            profiles: ownerData || {
                id: project.owner_uuid,
                full_name: 'Project Owner',
                email: 'N/A'
            }
        };

        if (ownerError) {
          console.warn("Could not fetch project owner's profile details.");
        }
        
        setCollaborators([ownerProfile, ...data]);
    }
    setLoading(false);
  }, [project?.id, project?.owner_uuid, toast]);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);
  
  const handleInvite = async (email, role) => {
    const { data, error } = await supabase.functions.invoke('invite-collaborator', {
        body: { projectId: project.id, email, role },
    });

    if (error || data.error) {
        toast({
            variant: "destructive",
            title: "Failed to invite collaborator",
            description: error?.message || data?.error,
        });
    } else {
        toast({
            title: "Success!",
            description: `Invitation sent to ${email}.`,
        });
        fetchCollaborators();
    }
    setIsInviteOpen(false);
  };
  
  const handleRemoveCollaborator = async (collaboratorId) => {
    if(!window.confirm("Are you sure you want to remove this collaborator?")) return;

    const { error } = await supabase
      .from('collaborators')
      .delete()
      .eq('id', collaboratorId);
      
    if (error) {
      toast({ variant: 'destructive', title: 'Failed to remove collaborator', description: error.message });
    } else {
      toast({ title: 'Collaborator removed' });
      fetchCollaborators();
    }
  };
  
  const getRoleBadge = (role) => {
    const roleName = role.charAt(0).toUpperCase() + role.slice(1);
    const roleStyles = {
      Owner: 'bg-amber-100 text-amber-800',
      Manager: 'bg-purple-100 text-purple-800',
      Contributor: 'bg-blue-100 text-blue-800',
      Viewer: 'bg-gray-100 text-gray-800',
    };
    return <Badge variant="secondary" className={roleStyles[roleName] || roleStyles['Viewer']}>{roleName}</Badge>;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team & Access Control</CardTitle>
            <CardDescription>Manage who has access to this project and what they can do.</CardDescription>
          </div>
          {isOwner && (
            <Button onClick={() => setIsInviteOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Invite Collaborator
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collaborators.length > 0 ? (
                    collaborators.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={c.profiles.avatar_url} alt={c.profiles.full_name} />
                              <AvatarFallback>{c.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{c.profiles.full_name}</p>
                              <p className="text-sm text-muted-foreground">{c.profiles.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(c.role)}</TableCell>
                        <TableCell className="text-right">
                          {isOwner && c.role !== 'Owner' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-destructive" onClick={() => handleRemoveCollaborator(c.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Remove</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No collaborators yet. Invite someone to get started!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {isOwner && (
        <InviteCollaboratorDialog
            isOpen={isInviteOpen}
            onOpenChange={setIsInviteOpen}
            onInvite={handleInvite}
        />
      )}
    </motion.div>
  );
};

export default TeamTab;