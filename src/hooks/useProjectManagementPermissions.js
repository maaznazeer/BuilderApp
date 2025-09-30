import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useMemo } from 'react';

export const useProjectManagementPermissions = () => {
    const { profile } = useAuth();
    const role = profile?.app_role;

    const permissions = useMemo(() => {
        const p = {
            // Default to false
            canReadEverything: false,
            canEditTasks: false,
            canEditDependencies: false,
            canEditAssignments: false,
            canEditCalendars: false,
            canLogTime: false,
            canApproveTimeLogs: false,
            canUpdateOwnPercentComplete: false,
            canViewBudget: false,
            canRunReports: false,
            canExport: false,
            isReadOnly: true,
        };

        if (!role) {
            return p;
        }

        switch (role) {
            case 'Admin':
            case 'Homebuilder':
                p.canReadEverything = true;
                p.canEditTasks = true;
                p.canEditDependencies = true;
                p.canEditAssignments = true;
                p.canEditCalendars = true;
                p.canLogTime = true;
                p.canApproveTimeLogs = true;
                p.canUpdateOwnPercentComplete = true;
                p.canViewBudget = true;
                p.canRunReports = true;
                p.canExport = true;
                p.isReadOnly = false;
                break;
            
            case 'Homeowner':
                p.canReadEverything = true;
                p.canViewBudget = true;
                p.canRunReports = true;
                p.canExport = true;
                // Can approve milestones (handled in specific component)
                // Can adjust deadlines (optional, for now false)
                break;
            
            case 'Subcontractor':
                // Will only see assigned tasks via data filtering
                p.canLogTime = true;
                p.canUpdateOwnPercentComplete = true;
                break;
            
            case 'Auditor':
                p.canReadEverything = true;
                p.canRunReports = true;
                p.canExport = true;
                break;

            default:
                // Read-Only or other roles
                p.canReadEverything = true;
                break;
        }

        return p;

    }, [role]);

    return permissions;
};