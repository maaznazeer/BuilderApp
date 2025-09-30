import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useQueryClient, useMutation } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { ListChecks, Bot, Calendar, Download, Loader2, BellOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ForecastsList = () => {
    const { selectedProject } = useProject();
    const { toast } = useToast();
    const [houseType, setHouseType] = useState('');
    const [materials, setMaterials] = useState('');
    const [timeline, setTimeline] = useState([]);

    const { mutate, isLoading } = useMutation(
        async () => {
            const { data, error } = await supabase.functions.invoke('maint-forecast', {
                body: {
                    project_id: selectedProject.id,
                    house_type: houseType,
                    materials: materials
                }
            });
            if (error) throw error;
            return data;
        },
        {
            onSuccess: (data) => {
                setTimeline(data.timeline);
                toast({ title: 'Success', description: 'Maintenance plan generated.' });
            },
            onError: (error) => {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        }
    );

    const { mutate: exportToIcs, isLoading: isExporting } = useMutation(
        async () => {
            const response = await supabase.functions.invoke('maint-forecast', {
                body: {
                    export_ics: true,
                    project_name: selectedProject.name,
                    timeline: timeline
                }
            });
            
            if (response.error) throw response.error;
            
            const blob = await response.data.blob();
            return blob;
        },
        {
            onSuccess: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selectedProject.name}-maintenance.ics`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                toast({ title: 'Success', description: 'Calendar file has been downloaded.' });
            },
            onError: (error) => {
                toast({ variant: 'destructive', title: 'Export Error', description: error.message });
            }
        }
    );

    const handleGenerate = () => {
        if (!houseType || !materials) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a house type and list materials.' });
            return;
        }
        mutate();
    };

    if (!selectedProject) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" />AI Forecasts</CardTitle>
                    <CardDescription>View predictive insights on budget and schedule.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <BellOff className="w-10 h-10 mb-2" />
                    <p>Please select a project to see forecasts.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" />Maintenance Forecast</CardTitle>
                <CardDescription>Generate a long-term maintenance plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="house-type">House Type</Label>
                    <Select value={houseType} onValueChange={setHouseType}>
                        <SelectTrigger id="house-type"><SelectValue placeholder="Select type..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bungalow">Bungalow</SelectItem>
                            <SelectItem value="multi-story">Multi-story</SelectItem>
                            <SelectItem value="duplex">Duplex</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="materials">Key Materials</Label>
                    <Input 
                        id="materials" 
                        placeholder="e.g., concrete, wood, steel roofing"
                        value={materials}
                        onChange={(e) => setMaterials(e.target.value)}
                    />
                </div>
                <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                    Generate Maintenance Plan
                </Button>
                
                <AnimatePresence>
                {timeline.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-4 border-t"
                    >
                        <h4 className="font-semibold">Generated Timeline</h4>
                        <ScrollArea className="h-64 pr-3">
                            <ul className="space-y-2">
                                {timeline.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3 p-2 rounded-md bg-muted/50">
                                        <div className="flex-shrink-0 w-12 text-center">
                                            <p className="font-bold text-primary">{item.year}</p>
                                            <p className="text-xs text-muted-foreground">Year</p>
                                        </div>
                                        <p className="text-sm border-l-2 border-primary/20 pl-3">{item.action}</p>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                        <Button onClick={exportToIcs} disabled={isExporting} className="w-full">
                            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Export .ICS Calendar
                        </Button>
                    </motion.div>
                )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

export default ForecastsList;