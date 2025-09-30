import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const WbsToolbar = ({
  projectCode,
  baseStartDate,
  setBaseStartDate,
  timescaleWeeks,
  setTimescaleWeeks,
  autoSchedule,
  setAutoSchedule,
  tz,
  setTz,
  onAddTask,
  onRecalculate,
}) => {
  return (
    <div className="sticky top-[60px] md:top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 py-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link to={`/dashboard/projects/${projectCode}`}>
               <Badge variant="secondary" className="text-sm py-1 px-3 cursor-pointer hover:bg-muted">
                Project: {projectCode}
              </Badge>
            </Link>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal h-9',
                    !baseStartDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {baseStartDate ? format(baseStartDate, 'PPP') : <span>Pick a start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={baseStartDate}
                  onSelect={setBaseStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2">
              <Label htmlFor="timescale" className="whitespace-nowrap text-sm">Weeks: {timescaleWeeks}</Label>
              <Slider
                id="timescale"
                min={4}
                max={52}
                step={1}
                value={[timescaleWeeks]}
                onValueChange={(value) => setTimescaleWeeks(value[0])}
                className="w-32"
              />
            </div>

             <div className="flex items-center space-x-2">
              <Switch id="auto-schedule" checked={autoSchedule} onCheckedChange={setAutoSchedule} />
              <Label htmlFor="auto-schedule" className="text-sm">Auto-schedule</Label>
            </div>

            <Select value={tz} onValueChange={setTz}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Warsaw">Europe/Warsaw</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={onRecalculate} className="h-9 w-9">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Recalculate Schedule</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Button onClick={onAddTask} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WbsToolbar;