import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useProject } from '@/contexts/ProjectContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertTriangle, Bell, CheckCircle, Info, Loader2, Rss } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const AlertIcon = ({ severity }) => {
    switch (severity) {
        case 'critical':
            return <AlertTriangle className="h-5 w-5 text-red-500" />;
        case 'high':
            return <AlertTriangle className="h-5 w-5 text-orange-500" />;
        case 'warning':
            return <Info className="h-5 w-5 text-yellow-500" />;
        case 'info':
        default:
            return <CheckCircle className="h-5 w-5 text-blue-500" />;
    }
};

const AlertCard = ({ alert }) => {
    const severityColors = {
        critical: 'border-red-500/50 bg-red-500/5',
        high: 'border-orange-500/50 bg-orange-500/5',
        warning: 'border-yellow-500/50 bg-yellow-500/5',
        info: 'border-blue-500/50 bg-blue-500/5',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start p-4 space-x-4 rounded-lg border ${severityColors[alert.severity] || 'border-gray-200'}`}
        >
            <AlertIcon severity={alert.severity} />
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <Badge variant={alert.severity === 'critical' || alert.severity === 'high' ? 'destructive' : 'secondary'} className="capitalize">{alert.severity}</Badge>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </p>
                </div>
                <p className="text-sm font-medium leading-none">{alert.message}</p>
            </div>
        </motion.div>
    );
};

const AlertsStream = () => {
    const { selectedProject } = useProject();
    const [alerts, setAlerts] = useState([]);

    const fetchAlerts = async () => {
        if (!selectedProject) return [];
        const { data, error } = await supabase
            .from('ai_alerts')
            .select('*')
            .eq('project_id', selectedProject.id)
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) throw new Error(error.message);
        return data;
    };

    const { data, isLoading, error } = useQuery(['ai_alerts', selectedProject?.id], fetchAlerts, {
        enabled: !!selectedProject,
        onSuccess: (data) => setAlerts(data || []),
    });

    useEffect(() => {
        if (!selectedProject) return;

        const channel = supabase.channel(`ai_alerts:${selectedProject.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'ai_alerts',
                filter: `project_id=eq.${selectedProject.id}`
            }, (payload) => {
                setAlerts(currentAlerts => [payload.new, ...currentAlerts]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedProject]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Rss className="h-5 w-5 text-primary" />
                    Live Alerts Stream
                </CardTitle>
                <CardDescription>Real-time AI-generated alerts for your selected project.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto pr-4">
                {!selectedProject ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Bell className="h-12 w-12 mb-4" />
                        <p className="font-semibold">No Project Selected</p>
                        <p className="text-sm">Please select a project to view its alerts.</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center">Error: {error.message}</div>
                ) : alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
                        <p className="font-semibold">All Clear!</p>
                        <p className="text-sm">No alerts for this project at the moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {alerts.map((alert) => (
                                <AlertCard key={alert.id} alert={alert} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AlertsStream;