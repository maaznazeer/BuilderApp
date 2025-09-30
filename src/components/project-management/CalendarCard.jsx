import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CalendarCard = ({ calendar, onEdit, onDelete, canEdit }) => {
    const getExceptionCount = () => {
        if (!calendar.exceptions) return 0;
        if (typeof calendar.exceptions === 'object' && calendar.exceptions !== null) {
            return Object.keys(calendar.exceptions).length;
        }
        return 0;
    };

    const exceptionCount = getExceptionCount();

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>{calendar.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div>
                    <h4 className="font-semibold text-sm mb-2">Working Days</h4>
                    <div className="flex gap-1.5 flex-wrap">
                        {weekDays.map(day => (
                            <Badge key={day} variant={calendar.work_days?.includes(day) ? 'default' : 'outline'} className="w-10 justify-center">
                                {day}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-sm mb-1">Daily Hours</h4>
                    <p className="text-lg font-bold">{calendar.daily_hours || 8} hours</p>
                </div>
                <div>
                    <h4 className="font-semibold text-sm mb-1">Exceptions</h4>
                    <p className="text-sm text-muted-foreground">
                        {exceptionCount > 0 ? `${exceptionCount} date${exceptionCount > 1 ? 's' : ''}` : 'None'}
                    </p>
                </div>
            </CardContent>
            {canEdit && (
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={onEdit}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={onDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};

export default CalendarCard;