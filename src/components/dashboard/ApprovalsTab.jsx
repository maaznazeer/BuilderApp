import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { Check, X, Clock, AlertTriangle, Link as LinkIcon, Video, Image as ImageIcon, CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';

const MediaPreview = ({ item }) => {
    if (item.media_type === 'Photo') {
        return <img  src={item.media_file_or_link} alt={item.notes} className="w-full h-auto max-h-[70vh] object-contain rounded-lg" src="https://images.unsplash.com/photo-1595872018818-97555653a011" />;
    }
    if (item.media_type === 'Video') {
        return <video src={item.media_file_or_link} controls className="w-full h-auto max-h-96 rounded-lg"></video>;
    }
    if (item.media_type === 'WhatsApp Link') {
        return (
            <div className="text-center p-4 bg-gray-100 rounded-lg">
                <p className="font-semibold">WhatsApp Content</p>
                <a href={item.media_file_or_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View on WhatsApp
                </a>
            </div>
        );
    }
    return <p>No preview available</p>;
};

const ApprovalsTab = ({ projects, updateProjects }) => {
    const { toast } = useToast();
    const { t } = useTranslation('custom');
    const [timesheetItems, setTimesheetItems] = useState({ pending: [], resolved: [] });
    const [loadingTimesheets, setLoadingTimesheets] = useState(true);

    const fetchTimesheets = async () => {
        setLoadingTimesheets(true);
        const { data, error } = await supabase.from('v_timesheets_with_status').select('*');

        if (error) {
            console.error('Error fetching timesheets:', error);
            toast({ variant: 'destructive', title: 'Error fetching timesheets' });
            setTimesheetItems({ pending: [], resolved: [] });
        } else {
            const pending = data.filter(ts => ts.status === 'pending');
            const resolved = data.filter(ts => ['approved', 'rejected'].includes(ts.status))
                                 .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
                                 .slice(0, 20);
            
            setTimesheetItems({ pending, resolved });
        }
        setLoadingTimesheets(false);
    };

    useEffect(() => {
        fetchTimesheets();
    }, []);

    const allApprovalItems = useMemo(() => {
        return timesheetItems.pending.map(ts => ({
            id: `ts-${ts.timesheet_id}`,
            projectId: ts.project_code,
            projectName: projects.find(p => p.project_code === ts.project_code)?.name || ts.project_code,
            type: 'Timesheet',
            item: ts,
            date: ts.created_at,
            status: ts.status,
            submittedBy: ts.worker_data?.first_name ? `${ts.worker_data.first_name} ${ts.worker_data.surname}` : ts.worker_code
        })).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [timesheetItems.pending, projects]);

    const resolvedItems = useMemo(() => {
        return timesheetItems.resolved.map(ts => ({
            id: `ts-${ts.timesheet_id}`,
            projectName: projects.find(p => p.project_code === ts.project_code)?.name || ts.project_code,
            type: 'Timesheet',
            item: ts,
            date: ts.created_at,
            status: ts.status
        }));
    }, [timesheetItems.resolved, projects]);

    const handleTimesheetApproval = async (item, newStatus) => {
        const { error } = await supabase.rpc('rpc_mark_timesheet_status', {
            p_timesheet_id: item.item.timesheet_id,
            p_status: newStatus,
            p_remarks: `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} via Horizons`
        });

        if (error) {
            console.error(`Error ${newStatus} timesheet`, error);
            toast({ variant: 'destructive', title: `Failed to ${newStatus} timesheet` });
        } else {
            toast({ title: `Timesheet ${newStatus}`, description: 'The timesheet status has been updated.' });
            fetchTimesheets(); // Refresh data
        }
    };


    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'approved':
                 return <Badge variant="success"><Check className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };
    
    const getItemIcon = (type) => {
        switch(type) {
            case 'Timesheet': return <CalendarDays className="w-4 h-4 text-gray-500" />;
            default: return null;
        }
    }

    const renderApprovalRow = (item) => (
        <TableRow key={item.id}>
            <TableCell>{item.projectName}</TableCell>
            <TableCell>
                <div className="font-medium">{item.type}</div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                    {getItemIcon(item.type)} 
                    {item.type === 'Timesheet' && `Work Date: ${format(parseISO(item.item.work_date), 'MMM d, yyyy')} (${item.item.days_worked} day/s)`}
                </div>
            </TableCell>
            <TableCell>{item.submittedBy}</TableCell>
            <TableCell>{format(parseISO(item.date), 'MMM d, yyyy')}</TableCell>
            <TableCell>{getStatusBadge(item.status)}</TableCell>
            <TableCell className="text-right space-x-2">
                <Button size="sm" variant="success" onClick={() => handleTimesheetApproval(item, 'approved')}>
                    <Check className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleTimesheetApproval(item, 'rejected')}>
                    <X className="w-4 h-4 mr-1" /> Reject
                </Button>
            </TableCell>
        </TableRow>
    );

    const renderHistoryRow = (item) => (
         <TableRow key={item.id}>
            <TableCell>{item.projectName}</TableCell>
            <TableCell>
                 <div className="font-medium">{item.type}</div>
                 <div className="text-sm text-gray-500 flex items-center gap-2">
                    {getItemIcon(item.type)} 
                    {item.type === 'Timesheet' && `Work Date: ${format(parseISO(item.item.work_date), 'MMM d, yyyy')} (${item.item.days_worked} day/s)`}
                 </div>
            </TableCell>
            <TableCell>{format(parseISO(item.date), 'MMM d, yyyy')}</TableCell>
            <TableCell>{getStatusBadge(item.status)}</TableCell>
        </TableRow>
    );


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-2xl font-bold text-gray-800">{t('approvals.title')}</h2>
                <p className="text-gray-500">{t('approvals.description')}</p>
            </div>
            
            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">{t('approvals.pending_requests')}</TabsTrigger>
                    <TabsTrigger value="history">{t('approvals.resolved_history')}</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                     <div className="bg-white rounded-lg shadow-sm border mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('approvals.table.project')}</TableHead>
                                    <TableHead>{t('approvals.table.item')}</TableHead>
                                    <TableHead>{t('approvals.table.submitted_by')}</TableHead>
                                    <TableHead>{t('approvals.table.date')}</TableHead>
                                    <TableHead>{t('approvals.table.status')}</TableHead>
                                    <TableHead className="text-right">{t('approvals.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingTimesheets ? (
                                    <TableRow><TableCell colSpan={6} className="text-center h-24">Loading...</TableCell></TableRow>
                                ) : allApprovalItems.length > 0 ? (
                                    allApprovalItems.map(renderApprovalRow)
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">
                                            {t('approvals.no_pending')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
                <TabsContent value="history">
                     <div className="bg-white rounded-lg shadow-sm border mt-4">
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>{t('approvals.table.project')}</TableHead>
                                    <TableHead>{t('approvals.table.item')}</TableHead>
                                    <TableHead>{t('approvals.table.date_resolved')}</TableHead>
                                    <TableHead>{t('approvals.table.final_status')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {loadingTimesheets ? (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24">Loading...</TableCell></TableRow>
                                ) : resolvedItems.length > 0 ? (
                                    resolvedItems.map(renderHistoryRow)
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">
                                            {t('approvals.no_resolved')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default ApprovalsTab;