import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, ListTodo, Upload, UserPlus, FolderPlus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import QuickAddProjectDialog from './modals/QuickAddProjectDialog';
import QuickAddExpenseDialog from './modals/QuickAddExpenseDialog';
import QuickAddTaskDialog from './modals/QuickAddTaskDialog';
import QuickUploadMediaDialog from './modals/QuickUploadMediaDialog';
import QuickInviteDialog from './modals/QuickInviteDialog';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from 'react-query';

const QuickActions = ({ onActionSuccess }) => {
    const [activeModal, setActiveModal] = useState(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const handleSuccess = (modalName, message) => {
        toast({
            title: "Success",
            description: message,
        });
        setActiveModal(null);
        if (onActionSuccess) {
            onActionSuccess();
        } else {
            queryClient.invalidateQueries();
        }
    };

    const actions = [
        { id: 'project', label: 'Add Project', icon: FolderPlus, component: QuickAddProjectDialog },
        { id: 'expense', label: 'Add Expense', icon: DollarSign, component: QuickAddExpenseDialog },
        { id: 'task', label: 'New Task', icon: ListTodo, component: QuickAddTaskDialog },
        { id: 'media', label: 'Upload Media', icon: Upload, component: QuickUploadMediaDialog },
        { id: 'invite', label: 'Invite Collaborator', icon: UserPlus, component: QuickInviteDialog },
    ];

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Quick Actions
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Create New</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {actions.map(action => (
                        <DropdownMenuItem key={action.id} onSelect={() => setActiveModal(action.id)}>
                            <action.icon className="mr-2 h-4 w-4" />
                            <span>{action.label}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {actions.map(action => {
                const Component = action.component;
                if (!Component) return null;
                return (
                    <Component
                        key={action.id}
                        isOpen={activeModal === action.id}
                        onOpenChange={() => setActiveModal(null)}
                        onSuccess={(message) => handleSuccess(action.id, message)}
                    />
                );
            })}
        </>
    );
};

export default QuickActions;