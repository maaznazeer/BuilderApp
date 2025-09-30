import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const ProjectsTableFilters = ({ filters, setFilters, clients, statuses, onExport }) => {
    const handleFilterChange = (filterName) => (value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleDateChange = (date) => {
        setFilters(prev => ({ ...prev, dateRange: date }));
    };

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="relative w-full md:flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search by code or title..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    className="pl-9 w-full"
                />
            </div>
            <div className="flex w-full md:w-auto gap-2">
                <Select value={filters.status} onValueChange={handleFilterChange('status')}>
                    <SelectTrigger className="w-full md:w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={filters.client} onValueChange={handleFilterChange('client')}>
                    <SelectTrigger className="w-full md:w-[150px]">
                        <SelectValue placeholder="Client" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Clients</SelectItem>
                        {clients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                            <span>
                                {filters.dateRange?.from ?
                                    filters.dateRange.to ?
                                        `${format(filters.dateRange.from, "LLL dd, y")} - ${format(filters.dateRange.to, "LLL dd, y")}` :
                                        format(filters.dateRange.from, "LLL dd, y") :
                                    "Filter by date"
                                }
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={filters.dateRange}
                            onSelect={handleDateChange}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <Button variant="ghost" size="icon" onClick={onExport} aria-label="Export data">
                   <Download className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default ProjectsTableFilters;