import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { supabase } from '@/lib/customSupabaseClient';
import { useFX } from '@/contexts/CurrencyProvider';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, MoreHorizontal } from 'lucide-react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import EditProjectDialog from '@/components/dashboard/details/EditProjectDialog.jsx';

function VarianceBar({ value, ccy }) {
    const pct = Math.min(100, Math.abs(value) / (Math.abs(value) + 1000) * 100);
    const positive = value >= 0;
    return (
        <div>
            <div className="h-2 w-32 rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div className={`h-2 rounded-full ${positive ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{positive ? 'Under' : 'Over'} &middot; {Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {ccy}</div>
        </div>
    );
}

export default function Projects() {
    const { currency } = useFX();
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingProject, setEditingProject] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const fetchProjects = () => {
        setLoading(true);
        supabase.rpc('projects_overview', { p_ccy: currency })
            .then(({ data, error }) => {
                if (error) {
                    console.error('Error fetching projects overview:', error);
                    setRows([]);
                } else {
                    setRows(data || []);
                }
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProjects();
    }, [currency]);

    const filtered = useMemo(() => rows.filter(r =>
        (r.name || '').toLowerCase().includes(q.toLowerCase()) ||
        (r.code || '').toLowerCase().includes(q.toLowerCase())
    ), [rows, q]);

    const handleRowClick = (projectId) => {
        navigate(`/dashboard/projects/${projectId}`);
    };

    const handleEditClick = (e, project) => {
        e.stopPropagation();
        setEditingProject(project);
        setIsEditDialogOpen(true);
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

    const formatCurrency = (value, ccy) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: ccy || 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value || 0);
    };

    return (
        <>
            <Helmet>
                <title>Projects | DomusBuilder</title>
                <meta name="description" content="View and manage all your construction projects." />
            </Helmet>
            <DashboardShell active="/dashboard/projects">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-2xl font-bold">Projects</h1>
                    <div className="flex items-center gap-4">
                        <input className="h-9 w-full max-w-md rounded-xl border bg-white dark:bg-neutral-800 px-3 text-sm" placeholder="Search projects by name/code..." value={q} onChange={e => setQ(e.target.value)} />
                        <Link to="/projects/new">
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Project
                            </Button>
                        </Link>
                    </div>
                </div>

                <motion.div
                    className="mt-4 overflow-x-auto rounded-lg border shadow-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-50 dark:bg-neutral-800">
                        <tr className="text-left text-muted-foreground">
                            <th className="p-3 font-medium">Project</th>
                            <th className="p-3 font-medium">Location</th>
                            <th className="p-3 font-medium">Status</th>
                            <th className="p-3 font-medium">Progress</th>
                            <th className="p-3 font-medium text-right">Budget ({currency})</th>
                            <th className="p-3 font-medium">Variance</th>
                            <th className="p-3 font-medium text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="bg-white dark:bg-neutral-900">
                                    {[...Array(7)].map((_, j) => <td key={j} className="p-3"><div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div></td>)}
                                </tr>
                            ))
                        ) : filtered.length > 0 ? (
                            filtered.map(p => (
                                <tr key={p.project_id} onClick={() => handleRowClick(p.project_id)} className="bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer">
                                    <td className="p-3 font-medium">
                                        <span className="hover:underline text-primary">{p.name}</span>
                                        <span className="ml-2 text-muted-foreground">{p.code ? `· ${p.code}` : ''}</span>
                                    </td>
                                    <td className="p-3 text-muted-foreground">{p.city || '—'}, {p.country || '—'}</td>
                                    <td className="p-3 capitalize"><Badge variant={getStatusVariant(p.status)}>{p.status}</Badge></td>
                                    <td className="p-3 w-48">
                                        <div className="flex items-center gap-2">
                                            <Progress value={p.progress || 0} className="w-24 h-2" />
                                            <span className="text-xs text-muted-foreground w-10 text-right">{p.progress || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">{formatCurrency(p.budget, currency)}</td>
                                    <td className="p-3"><VarianceBar value={Number(p.variance || 0)} ccy={currency} /></td>
                                    <td className="p-3 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => handleEditClick(e, p)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Project
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center p-8 text-muted-foreground bg-white dark:bg-neutral-900">
                                    No projects found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </motion.div>
            </DashboardShell>
            {editingProject && (
                <EditProjectDialog
                    project={editingProject}
                    isOpen={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    onProjectUpdated={fetchProjects}
                />
            )}
        </>
    );
}