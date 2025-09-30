import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
};

const ProjectsTable = ({ projects, isLoading }) => {
    const navigate = useNavigate();

    const handleRowClick = (projectId) => {
        navigate(`/dashboard/projects/${projectId}`);
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'Active':
            case 'In Progress':
                return 'default';
            case 'Completed':
                return 'success';
            case 'On Hold':
                return 'secondary';
            case 'Cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(10)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">Code</TableHead>
                            <TableHead>Project Title</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Budget</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Last Updated</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((project) => (
                            <TableRow
                                key={project.id}
                                onClick={() => handleRowClick(project.id)}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                                <TableCell className="font-medium">{project.project_code}</TableCell>
                                <TableCell>{project.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Progress value={project.progress_pct} className="w-24 h-2" />
                                        <span className="text-sm text-muted-foreground">{project.progress_pct}%</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(project.budget_spent)} / {formatCurrency(project.budget_total)}
                                </TableCell>
                                <TableCell>{project.client_name}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(project.status)}>{project.status || 'N/A'}</Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground text-sm">
                                    {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </motion.div>
    );
};

export default ProjectsTable;