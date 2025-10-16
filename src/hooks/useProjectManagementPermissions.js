import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useMemo } from 'react';

export const useProjectManagementPermissions = () => {
    const { profile } = useAuth();
    const role = profile?.app_role;

    const permissions = useMemo(() => {
        // Allow all users full access to all features
        return {
            canReadEverything: true,
            canEditTasks: true,
            canEditDependencies: true,
            canEditAssignments: true,
            canEditCalendars: true,
            canLogTime: true,
            canApproveTimeLogs: true,
            canUpdateOwnPercentComplete: true,
            canViewBudget: true,
            canRunReports: true,
            canExport: true,
            isReadOnly: false,
        };
    }, [role]);

    return permissions;
};