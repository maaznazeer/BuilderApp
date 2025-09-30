import React from 'react';
import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowDownUp, DollarSign, Target, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const fetchFinanceKpis = async (projectId) => {
    if (!projectId) return null;
    const { data, error } = await supabase
        .from('v_project_finance_kpis')
        .select('*')
        .eq('project_id', projectId)
        .single();
    
    if (error) {
        console.error('Error fetching finance KPIs:', error);
        throw new Error('Failed to fetch financial KPIs. ' + error.message);
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

const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 2,
    }).format(value);
};

const KpisRow = ({ projectId }) => {
    const { data: kpis, isLoading, isError, error } = useQuery(
        ['financeKpis', projectId],
        () => fetchFinanceKpis(projectId),
        {
            enabled: !!projectId,
        }
    );

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
        );
    }
    
    if (isError) {
        return (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-4">
                <AlertCircle className="h-6 w-6 text-destructive"/>
                <div>
                    <h4 className="font-bold">Error Loading Financial KPIs</h4>
                    <p className="text-sm text-destructive">{error.message}</p>
                </div>
            </div>
        );
    }
    
    if (!kpis) {
        return (
             <div className="p-4 bg-muted/50 border rounded-md text-center">
                <p>Select a project to view its financial KPIs.</p>
            </div>
        );
    }

    const kpiCardsData = [
        { title: "Spent to Date", value: formatCurrency(kpis.spent_to_date), icon: DollarSign, tooltip: "Total actual cost (AC) incurred on the project so far." },
        { title: "Burn Rate (/day)", value: formatCurrency(kpis.burn_rate), icon: TrendingUp, tooltip: "Average daily cost of the project since it started." },
        { title: "Estimate to Complete (ETC)", value: formatCurrency(kpis.etc), icon: Target, tooltip: "The expected cost required to finish all remaining project work." },
        { title: "Estimate at Completion (EAC)", value: formatCurrency(kpis.eac), icon: Wallet, tooltip: "The new forecasted total cost of the project (original budget or current spend, whichever is higher)." },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCardsData.map(kpi => (
                <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} tooltipText={kpi.tooltip} />
            ))}
        </div>
    );
};

export default KpisRow;