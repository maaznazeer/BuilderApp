import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/contexts/DashboardContext';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

const fetchData = async (dataBinding, scope, projectId, windowDays, statusFilter, onlyMine) => {
    let rpcName;
    const params = {
        p_scope: scope, 
        p_project_id: scope === 'project' ? projectId : null,
    };

    if (dataBinding === 'tasks_due' || dataBinding === 'my_tasks_due') {
        rpcName = 'list_tasks_due';
        params.p_window_days = windowDays;
        params.p_status_filter = statusFilter;
        params.p_only_mine = dataBinding === 'my_tasks_due' || onlyMine;
    } else {
        throw new Error(`Unknown dataBinding: ${dataBinding}`);
    }

    const { data, error } = await supabase.rpc(rpcName, params);

    if (error) {
        throw new Error(error.message);
    }
    return data;
};

const priorityVariantMap = {
    'High': 'destructive',
    'Medium': 'secondary',
    'Low': 'outline',
};

const statusVariantMap = {
    'unassigned': 'secondary',
    'in progress': 'default',
    'completed': 'success',
};

const normalizeStatus = (status) => {
    if (!status) return 'unassigned';
    const s = status.toLowerCase();
    if (['in_progress', 'in-progress', 'doing'].includes(s)) return 'in progress';
    if (['completed', 'done'].includes(s)) return 'completed';
    return s;
};

const DataTable = ({ dataBinding, columns, toolbar, rowActions, title, data: staticData }) => {
    const { scope, selectedProjectId, windowDays, statusFilter, onlyMine, setIsColumnModalOpen, taskTableColumns } = useDashboard();
    const navigate = useNavigate();

    const queryKey = [dataBinding, scope, selectedProjectId, windowDays, statusFilter, onlyMine];
    const queryFn = () => fetchData(dataBinding, scope, selectedProjectId, windowDays, statusFilter, onlyMine);

    const { data: fetchedData, isLoading: isLoadingFetched, error: fetchedError } = useQuery(queryKey, queryFn, { 
        enabled: !staticData && !!dataBinding && !!scope && (scope === 'global' || (scope === 'project' && !!selectedProjectId)),
        refetchOnWindowFocus: false,
    });
    
    const data = staticData || fetchedData;
    const isLoading = !staticData && isLoadingFetched;
    const error = staticData ? null : fetchedError;

    let currentColumns;
    if (staticData) {
        currentColumns = columns;
    } else if (dataBinding === 'tasks_due') {
        currentColumns = taskTableColumns;
    } else {
        currentColumns = columns;
    }

    const finalColumns = currentColumns.map(c => ({...c, accessorKey: c.accessor}));


    const handleToolbarActionClick = (action) => {
        if (action.onClick === 'openColumnModal') {
            setIsColumnModalOpen(true);
        }
    };
    
    const handleRowActionClick = (action, row) => {
        if (action.type === 'navigate') {
            let path = action.to;
            if (action.params) {
                Object.keys(action.params).forEach(param => {
                    const placeholder = `:${param}`;
                    const rowValueKey = action.params[param].replace('{{row.', '').replace('}}', '');
                    if(row[rowValueKey]){
                        path = path.replace(placeholder, row[rowValueKey]);
                    }
                });
            }
            navigate(path);
        }
    };


    const renderCell = (row, column) => {
        const value = row[column.accessorKey];
        if (column.accessorKey === 'due_date' && value) {
            let dateFormat = 'PPP';
            if(column.format === 'date:YYYY-MM-DD'){
                dateFormat = 'yyyy-MM-dd';
            }
            try {
              return format(new Date(value), dateFormat);
            } catch(e) {
              return value;
            }
        }
        if (column.accessorKey === 'priority' && value) {
            return (
                <Badge variant={priorityVariantMap[value] || 'default'}>
                    {value}
                </Badge>
            );
        }
        if (column.accessorKey === 'status' && value) {
            const normalized = normalizeStatus(value);
            return (
                <Badge variant={statusVariantMap[normalized] || 'outline'} className="capitalize">
                    {normalized}
                </Badge>
            );
        }
        return value || 'N/A';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
        },
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{title || "Data"}</CardTitle>
                {toolbar && toolbar.actions && (
                  <div className="flex items-center space-x-2">
                      {toolbar.actions.map((action, index) => (
                          <Button key={index} variant="outline" size="sm" onClick={() => handleToolbarActionClick(action)}>
                              {action.label}
                          </Button>
                      ))}
                  </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {finalColumns.map((column) => (
                                    <TableHead key={column.accessorKey}>{column.header}</TableHead>
                                ))}
                                {rowActions && rowActions.length > 0 && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody
                            as={motion.tbody}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {finalColumns.map((col) => (
                                            <TableCell key={col.accessorKey}>
                                                <Skeleton className="h-6 w-full" />
                                            </TableCell>
                                        ))}
                                        {rowActions && rowActions.length > 0 && <TableCell><Skeleton className="h-6 w-full" /></TableCell>}
                                    </TableRow>
                                ))
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={finalColumns.length + (rowActions ? 1 : 0)} className="text-center text-red-500">
                                        Error loading data: {error.message}
                                    </TableCell>
                                </TableRow>
                            ) : data && data.length > 0 ? (
                                data.map((row) => (
                                    <motion.tr variants={itemVariants} key={row.id}>
                                        {finalColumns.map((column) => (
                                            <TableCell key={column.accessorKey}>
                                                {renderCell(row, column)}
                                            </TableCell>
                                        ))}
                                        {rowActions && rowActions.length > 0 && (
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {rowActions.map((action, index) => (
                                                            <DropdownMenuItem key={index} onClick={() => handleRowActionClick(action, row)}>
                                                                {action.label}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        )}
                                    </motion.tr>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={finalColumns.length + (rowActions ? 1 : 0)} className="text-center text-muted-foreground">
                                        No tasks match the current filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default DataTable;