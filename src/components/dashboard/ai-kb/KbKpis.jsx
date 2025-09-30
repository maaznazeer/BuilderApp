import React from 'react';
import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Database, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const fetchKbStats = async () => {
    const { data, error } = await supabase
        .from('v_kb_stats')
        .select('sources, chunks')
        .single();
    
    if (error) {
        console.error('Error fetching KB stats:', error);
        throw new Error('Failed to fetch knowledge base stats. ' + error.message);
    }
    return data;
};

const KpiCard = ({ title, value, icon: Icon, tooltipText }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{title}</CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{value}</div>
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const KbKpis = () => {
    const { data: stats, isLoading, isError, error } = useQuery('kbStats', fetchKbStats);

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
        );
    }
    
    if (isError) {
        return (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-4">
                <AlertCircle className="h-6 w-6 text-destructive"/>
                <div>
                    <h4 className="font-bold">Error Loading KB Stats</h4>
                    <p className="text-sm text-destructive">{error.message}</p>
                </div>
            </div>
        );
    }

    const kpiCardsData = [
        { title: "Sources", value: stats?.sources ?? 0, icon: FileText, tooltip: "Total number of documents, URLs, and text snippets in the knowledge base." },
        { title: "Chunks", value: stats?.chunks ?? 0, icon: Database, tooltip: "Total number of indexed text segments the AI can search through." },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {kpiCardsData.map(kpi => (
                <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} tooltipText={kpi.tooltip} />
            ))}
        </div>
    );
};

export default KbKpis;