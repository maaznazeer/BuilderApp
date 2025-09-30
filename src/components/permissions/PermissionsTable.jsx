import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, MoreHorizontal, Trash2 } from 'lucide-react';
import InviteUserDialog from './InviteUserDialog';
import DeleteUserDialog from './DeleteUserDialog';

const roleColors = {
  Admin: "bg-purple-100 text-purple-800",
  Homebuilder: "bg-red-100 text-red-800",
  Homeowner: "bg-blue-100 text-blue-800",
  Subcontractor: "bg-green-100 text-green-800",
  Auditor: "bg-yellow-100 text-yellow-800",
  'Read-Only': "bg-gray-100 text-gray-800",
  'N/A': "bg-gray-100 text-gray-800",
};

const PermissionsTable = ({ users, roles, onRoleChange, onInviteUser, onDeleteUser, currentUser, loading }) => {
  const canManage = currentUser?.role === 'Admin';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
      <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Control access and roles for all team members.</p>
        </div>
        {canManage && (
          <InviteUserDialog onInviteUser={onInviteUser} roles={roles}>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Invite User
            </Button>
          </InviteUserDialog>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan="4" className="text-center h-24">Loading users...</TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.full_name || user.email} />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{user.full_name || 'No name provided'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${roleColors[user.role] || roleColors['N/A']} hover:${roleColors[user.role]}`}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">{user.lastActive}</TableCell>
                <TableCell className="text-right">
                  {canManage && currentUser.id !== user.id ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {roles.filter(r => r.name !== 'Admin').map(role => (
                                        <DropdownMenuItem key={role.id} onSelect={() => onRoleChange(user.id, role.id)}>
                                            {role.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DeleteUserDialog onConfirm={() => onDeleteUser(user.id)}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete User</span>
                          </DropdownMenuItem>
                        </DeleteUserDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PermissionsTable;