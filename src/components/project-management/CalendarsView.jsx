import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import AddEditCalendarDialog from './AddEditCalendarDialog';
import CalendarCard from './CalendarCard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useProjectManagementPermissions } from '@/hooks/useProjectManagementPermissions';

const CalendarsView = () => {
    const [calendars, setCalendars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCalendar, setSelectedCalendar] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [calendarToDelete, setCalendarToDelete] = useState(null);
    const { toast } = useToast();
    const permissions = useProjectManagementPermissions();

    const fetchCalendars = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('resource_calendars')
            .select('*')
            .order('name');
        
        if (error) {
            toast({ variant: 'destructive', title: 'Error fetching calendars', description: error.message });
        } else {
            setCalendars(data);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchCalendars();
    }, [fetchCalendars]);

    const handleSaveCalendar = async (calendarData, calendarId) => {
        let error;
        if (calendarId) {
            // Update
            ({ error } = await supabase.from('resource_calendars').update(calendarData).eq('calendar_id', calendarId));
        } else {
            // Create
            ({ error } = await supabase.from('resource_calendars').insert(calendarData));
        }

        if (error) {
            toast({ variant: "destructive", title: "Failed to save calendar", description: error.message });
        } else {
            toast({ title: `Calendar ${calendarId ? 'updated' : 'created'} successfully!` });
            setIsDialogOpen(false);
            fetchCalendars();
        }
    };

    const handleEdit = (calendar) => {
        setSelectedCalendar(calendar);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setSelectedCalendar(null);
        setIsDialogOpen(true);
    };

    const confirmDelete = (calendar) => {
        setCalendarToDelete(calendar);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!calendarToDelete) return;
        
        const { error } = await supabase.from('resource_calendars').delete().eq('calendar_id', calendarToDelete.calendar_id);
        
        if (error) {
            toast({ variant: "destructive", title: "Failed to delete calendar", description: "This calendar might be in use by a resource." });
        } else {
            toast({ title: "Calendar deleted successfully!" });
            fetchCalendars();
        }
        setIsDeleteDialogOpen(false);
        setCalendarToDelete(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
                <h2 className="text-xl font-bold">Work Calendars</h2>
                <Button onClick={handleAdd} disabled={!permissions.canEditCalendars}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Calendar
                </Button>
            </div>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="flex flex-col">
                            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                            <CardContent className="flex-grow space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-8 w-1/2" />
                                <Skeleton className="h-6 w-1/3" />
                            </CardContent>
                            <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {calendars.length > 0 ? (
                        calendars.map(calendar => (
                            <CalendarCard
                                key={calendar.calendar_id}
                                calendar={calendar}
                                onEdit={() => handleEdit(calendar)}
                                onDelete={() => confirmDelete(calendar)}
                                canEdit={permissions.canEditCalendars}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed">
                            <p className="text-muted-foreground">No custom calendars created yet.</p>
                            <Button onClick={handleAdd} className="mt-4" disabled={!permissions.canEditCalendars}>Create Your First Calendar</Button>
                        </div>
                    )}
                </div>
            )}
            <AddEditCalendarDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveCalendar}
                calendar={selectedCalendar}
            />
             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the calendar "{calendarToDelete?.name}". Resources using this calendar will revert to the default schedule.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CalendarsView;