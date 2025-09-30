import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Building2, ThumbsUp, ThumbsDown, Save, CheckCircle, Eye } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const LayoutCard = ({ layout, onSave, onSelect, isSaving, savedLayoutId, isSelected }) => {
    const isSaved = !!savedLayoutId;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={cn("border rounded-lg overflow-hidden shadow-sm transition-all", isSelected ? "ring-2 ring-primary" : "")}
        >
            <div className="p-4 bg-muted/40">
                <img src={layout.preview_url} alt={layout.name} className="w-full h-auto rounded-md object-cover aspect-[4/3]" />
            </div>
            <div className="p-4">
                <h3 className="font-semibold">{layout.name}</h3>
                <p className="text-sm text-muted-foreground">{layout.dimensions_sqm} sq. m</p>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                        <h4 className="font-medium flex items-center gap-1 text-green-600"><ThumbsUp className="h-4 w-4" /> Pros</h4>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            {layout.details.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium flex items-center gap-1 text-red-600"><ThumbsDown className="h-4 w-4" /> Cons</h4>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            {layout.details.cons.map((con, i) => <li key={i}>{con}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
            <CardFooter className="flex gap-2">
                <Button 
                    variant="outline"
                    className="w-full" 
                    onClick={() => onSelect(layout)}
                >
                    <Eye className="mr-2 h-4 w-4" />
                    {isSelected ? "Selected" : "Select for 3D"}
                </Button>
                <Button 
                    className="w-full" 
                    onClick={() => onSave(layout)} 
                    disabled={isSaving || isSaved}
                >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isSaved ? <CheckCircle className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />)}
                    {isSaving ? 'Saving...' : (isSaved ? 'Saved' : 'Save')}
                </Button>
            </CardFooter>
        </motion.div>
    );
};

const LayoutGallery = ({ requirements, project, onLayoutsGenerated, onLayoutSelect, selectedLayout }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [layouts, setLayouts] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [savedLayouts, setSavedLayouts] = useState({});
    const { toast } = useToast();

    const handleGenerateLayouts = async () => {
        if (!requirements) {
            toast({ title: "Requirements Needed", description: "Please fill out the design requirements form first.", variant: "destructive" });
            return;
        }
        if (!project) {
            toast({ title: "No Project Selected", description: "Please select a project first.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setLayouts([]);
        onLayoutsGenerated([]);
        onLayoutSelect(null);

        try {
            const { data, error } = await supabase.functions.invoke('floorplan-generate', {
                body: { project_id: project.id, requirements }
            });

            if (error) throw error;
            const layoutsWithTempId = data.results.map(r => ({...r, tempId: Math.random().toString(36).substring(7)}));
            setLayouts(layoutsWithTempId);
            onLayoutsGenerated(layoutsWithTempId);
            toast({ title: "Layouts Generated!", description: "The AI has created new floorplans for you." });
        } catch (err) {
            toast({ title: "Generation Failed", description: err.message || "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveLayout = async (layout) => {
        if (!project) {
            toast({ title: "No Project Selected", description: "Please select a project to save the design.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data: newDesign, error } = await supabase.from('designs').insert({
                project_id: project.id,
                user_id: user.id,
                name: layout.name,
                preview_url: layout.preview_url,
                dimensions_sqm: layout.dimensions_sqm,
                details: layout.details
            }).select().single();

            if (error) throw error;
            
            const updatedLayout = {...layout, id: newDesign.id};

            setSavedLayouts(prev => ({...prev, [layout.tempId]: newDesign.id}));
            
            if (selectedLayout?.tempId === layout.tempId) {
                onLayoutSelect(updatedLayout);
            }
            
            toast({ title: "Layout Saved!", description: `${layout.name} has been saved to your project.` });
        } catch (err) {
            toast({ title: "Save Failed", description: err.message || "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSelectLayout = (layout) => {
        const savedId = savedLayouts[layout.tempId];
        onLayoutSelect({...layout, id: savedId});
    };

    useEffect(() => {
        if (requirements) {
            handleGenerateLayouts();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requirements]);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Layout Gallery
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="font-semibold">AI is generating layouts...</p>
                        <p className="text-sm text-muted-foreground">This may take a moment.</p>
                    </div>
                ) : layouts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {layouts.map((layout) => (
                                <LayoutCard 
                                    key={layout.tempId} 
                                    layout={layout} 
                                    onSave={handleSaveLayout}
                                    onSelect={handleSelectLayout}
                                    isSaving={isSaving}
                                    savedLayoutId={savedLayouts[layout.tempId]}
                                    isSelected={selectedLayout?.tempId === layout.tempId}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="font-semibold">Your generated layouts will appear here.</p>
                        <p className="text-sm text-muted-foreground">Fill out the form and click "Generate Layouts" to start.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default LayoutGallery;