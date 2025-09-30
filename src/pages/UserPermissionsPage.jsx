import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from 'lucide-react';
import PermissionsTable from '@/components/permissions/PermissionsTable';
import InviteUserDialog from '@/components/permissions/InviteUserDialog';
import DeleteUserDialog from '@/components/permissions/DeleteUserDialog';
import InviteIntegratorForm from '@/components/permissions/InviteIntegratorForm';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600 mx-auto"></div>
      <h2 className="mt-4 text-xl font-semibold text-gray-700">Loading Permissions...</h2>
    </div>
  </div>
);

const UserPermissionsPage = () => {
    const { user: currentUser, deleteUser: deleteUserFromContext } = useAuth();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchUsersAndRoles = useCallback(async () => {
        setLoading(true);
        try {
            const { data: usersData, error: usersError } = await supabase.from('profiles').select('*, roles(id, name)');
            if (usersError) throw usersError;
            setUsers(usersData.map(u => ({
              id: u.id,
              full_name: u.full_name,
              email: u.email,
              avatar: u.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${u.full_name || u.email}`,
              role: u.roles?.name || 'N/A',
              role_id: u.roles?.id,
              lastActive: u.updated_at ? new Date(u.updated_at).toLocaleDateString() : 'Never',
            })));

            const { data: rolesData, error: rolesError } = await supabase.from('roles').select('*');
            if (rolesError) throw rolesError;
            setRoles(rolesData);

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error fetching data",
                description: "Could not fetch users and roles. Please try again.",
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchUsersAndRoles();
    }, [fetchUsersAndRoles]);
    
    const handleRoleChange = async (userId, newRoleId) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role_id: newRoleId })
                .eq('id', userId);

            if (error) throw error;
            toast({
                title: "Success",
                description: "User role updated successfully.",
            });
            fetchUsersAndRoles();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error updating role",
                description: error.message,
            });
            console.error(error);
        }
    };
    
    const handleDeleteUser = async (userId) => {
        await deleteUserFromContext(userId);
        fetchUsersAndRoles();
    };

    const handleInviteUser = async (email, roleName) => {
      const role = roles.find(r => r.name === roleName);
      if (!role) {
        toast({ variant: 'destructive', title: 'Invalid role selected.' });
        return;
      }
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, { data: { role_id: role.id } });
      
      if (error) {
        toast({ variant: 'destructive', title: 'Failed to invite user', description: error.message });
      } else {
        toast({ title: 'Invitation sent!', description: `An invitation has been sent to ${email}.` });
        fetchUsersAndRoles();
      }
    };

    if (loading) {
        return <LoadingFallback />;
    }

    return (
        <>
            <Helmet>
                <title>User Permissions - Domus Builder</title>
                <meta name="description" content="Manage user roles and permissions for your team." />
            </Helmet>
            <div className="p-6 bg-gray-50/50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <PermissionsTable 
                        users={users} 
                        roles={roles}
                        onRoleChange={handleRoleChange}
                        onDeleteUser={handleDeleteUser}
                        onInviteUser={handleInviteUser}
                        currentUser={currentUser}
                        loading={loading}
                    />
                    <InviteIntegratorForm />
                </div>
            </div>
        </>
    );
};

export default UserPermissionsPage;