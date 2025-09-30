import React from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MultiSelect from '@/components/wbs/MultiSelect';
import { useToast } from '@/components/ui/use-toast';
import Papa from 'papaparse';
import Chips from '@/components/ui/chips';

const WbsFilters = ({ filters, setFilters, availableOptions, onClear, tasksToExport, projectCode }) => {
    const { toast } = useToast();

    const handleExport = () => {
        if (!tasksToExport || tasksToExport.length === 0) {
            toast({
                title: 'No data to export',
                description: 'There are no tasks matching the current filters.',
                variant: 'destructive',
            });
            return;
        }

        const csv = Papa.unparse(tasksToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `wbs-export-${projectCode}-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
            title: 'Export successful!',
            description: `${tasksToExport.length} tasks have been exported to CSV.`,
        });
    };

    const hasActiveFilters = filters.phases.length > 0 || filters.statuses.length > 0 || filters.priorities.length > 0;

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-3 px-4 bg-muted/30 border-t border-b">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 flex-1">
                <MultiSelect
                    options={availableOptions.phases}
                    selected={filters.phases}
                    onChange={(phases) => setFilters({ ...filters, phases })}
                    placeholder="Filter by Phase..."
                    className="h-9"
                />
                <MultiSelect
                    options={availableOptions.priorities}
                    selected={filters.priorities}
                    onChange={(priorities) => setFilters({ ...filters, priorities })}
                    placeholder="Filter by Priority..."
                    className="h-9"
                />
                <div className="flex items-center gap-2">
                     <Chips
                        id="status-filter"
                        options={availableOptions.statuses.map(s => ({label: s, value: s}))}
                        value={filters.status}
                        onChange={(status) => setFilters({ ...filters, status })}
                    />
                </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
                {hasActiveFilters && (
                     <Button variant="ghost" onClick={onClear} className="h-9 px-3">
                        <X className="mr-2 h-4 w-4" />
                        Clear Filters
                    </Button>
                )}
                <Button variant="outline" onClick={handleExport} className="h-9 px-3">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        </div>
    );
};

export default WbsFilters;