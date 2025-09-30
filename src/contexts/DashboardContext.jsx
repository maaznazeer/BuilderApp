import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from './SupabaseAuthContext';

const DashboardContext = createContext();

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};

const fetchProjectIds = async (userId) => {
    if (!userId) return [];
    const { data, error } = await supabase.rpc('get_user_project_ids');
    if (error) {
        console.error('Error fetching project IDs:', error);
        return [];
    }
    return data.map(p => p.id);
};

const initialTaskColumns = [
    { "header": "Name", "accessor": "name" },
    { "header": "Assignee", "accessor": "assignee_name" },
    { "header": "Due date", "accessor": "due_date", "format": "date:YYYY-MM-DD" },
    { "header": "Priority", "accessor": "priority" }
];

export const DashboardProvider = ({ children }) => {
    const { user, profile } = useAuth();
    const location = useLocation();
    const [scope, setScope] = useState('global');
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [windowDays, setWindowDays] = useState(7);
    const [statusFilter, setStatusFilter] = useState('all');
    const [onlyMine, setOnlyMine] = useState(false); // New state for "Only my tasks"
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [taskTableColumns, setTaskTableColumns] = useState(initialTaskColumns);
    const [availableColumns, setAvailableColumns] = useState([]);
    
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        const projectPathIndex = pathParts.indexOf('projects');
        if (projectPathIndex !== -1 && pathParts.length > projectPathIndex + 1) {
            const projectIdFromRoute = pathParts[projectPathIndex + 1];
            if (projectIdFromRoute) {
                setScope('project');
                setSelectedProjectId(projectIdFromRoute);
            }
        }
    }, [location.pathname]);
    
    const { data: projectIds, isLoading: isLoadingProjectIds } = useQuery(
        ['userProjectIds', user?.id],
        () => fetchProjectIds(user?.id),
        {
            enabled: !!user,
        }
    );

    const addColumnToTasksDue = (colAccessor) => {
        const columnToAdd = availableColumns.find(c => c.value === colAccessor);
        if (columnToAdd && !taskTableColumns.some(c => c.accessor === colAccessor)) {
            setTaskTableColumns(prev => [...prev, { header: columnToAdd.label, accessor: columnToAdd.value }]);
        }
    };

    const value = useMemo(() => ({
        scope,
        setScope,
        selectedProjectId,
        setSelectedProjectId,
        windowDays,
        setWindowDays,
        statusFilter,
        setStatusFilter,
        onlyMine, // Include new state
        setOnlyMine, // Include new state setter
        projectIds: projectIds || [],
        loading: isLoadingProjectIds,
        error: null,
        isColumnModalOpen,
        setIsColumnModalOpen,
        taskTableColumns,
        addColumnToTasksDue,
        availableColumns,
        setAvailableColumns,
        plan: profile?.plan_tier || 'freemium',
    }), [scope, selectedProjectId, windowDays, statusFilter, onlyMine, projectIds, isLoadingProjectIds, isColumnModalOpen, taskTableColumns, availableColumns, profile]);

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
};