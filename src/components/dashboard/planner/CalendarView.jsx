import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, parseISO } from 'date-fns';

const CalendarView = ({ tasks }) => {
    const events = (tasks || [])
        .filter(task => task.due_date)
        .reduce((acc, task) => {
            try {
                const date = format(parseISO(task.due_date), 'yyyy-MM-dd');
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(task);
            } catch (e) {
                console.error("Invalid date format for task:", task.id, task.due_date);
            }
            return acc;
        }, {});

    const DayContent = ({ date }) => {
        const dateString = format(date, 'yyyy-MM-dd');
        const dayTasks = events[dateString];

        const dayHasTasks = dayTasks && dayTasks.length > 0;

        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <span>{date.getDate()}</span>
                {dayHasTasks ? (
                    <Popover>
                        <PopoverTrigger asChild>
                             <div className="absolute bottom-1 w-1.5 h-1.5 bg-primary rounded-full cursor-pointer"></div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 z-50">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">{format(date, 'MMMM d, yyyy')}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {dayTasks.length} task(s) due today.
                                    </p>
                                </div>
                                <div className="grid gap-2 max-h-60 overflow-y-auto">
                                    {dayTasks.map(task => (
                                        <div key={task.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                                            <span className={`flex h-2 w-2 translate-y-1 rounded-full ${task.completed ? 'bg-green-500' : 'bg-blue-500'}`} />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{task.title}</p>
                                                <Badge variant="outline">{task.project_code}</Badge>
                                                {task.assignee_name && (
                                                    <div className="flex items-center gap-2 pt-1">
                                                        <Avatar className="h-5 w-5">
                                                            <AvatarImage src={task.assignee_avatar_url} />
                                                            <AvatarFallback>{task.assignee_name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs text-muted-foreground">{task.assignee_name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                ) : null}
            </div>
        );
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
             <Calendar
                mode="single"
                className="w-full"
                components={{
                    Day: DayContent,
                }}
            />
        </div>
    );
};

export default CalendarView;