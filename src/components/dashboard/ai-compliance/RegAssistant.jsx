import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { FileText, Wand2, Loader2, ListTodo, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/customSupabaseClient';
import { useProject } from '@/contexts/ProjectContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

const topics = [
    { value: 'permits', label: 'Permits' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'structural', label: 'Structural' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'fire', label: 'Fire Safety' },
];

const languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
];

const ResultSection = ({ title, items }) => (
    <div className="space-y-2">
        <h4 className="font-semibold text-md">{title}</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    </div>
);

const RegAssistant = ({ countryCode }) => {
    const { toast } = useToast();
    const { selectedProject } = useProject();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [topic, setTopic] = useState('permits');
    const [language, setLanguage] = useState('en');
    const [result, setResult] = useState(null);

    const handleGetAdvice = async () => {
        if (!countryCode) {
            toast({ title: "Country Required", description: "Please select a country first.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        setResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('regulation-assistant', {
                body: { country: countryCode, topic, lang: language }
            });

            if (error) throw error;
            setResult(data);
            toast({ title: "AI Advice Generated!", description: "Review the compliance guidelines below." });
        } catch (err) {
            setResult({ error: err.message || "Could not retrieve advice. The selected combination might not be available in the mock database." });
            toast({ title: "Failed to Get Advice", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddToTodo = async () => {
        if (!result || !selectedProject || result.error) {
            toast({ title: "Cannot Add Tasks", description: "Generate valid advice for a project first.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const tasksToAdd = result.steps.map(step => ({
                project_id: selectedProject.id,
                title: `Compliance: ${step}`,
                description: `From AI Regulation Assistant for ${topic} in ${countryCode}. Guideline: ${result.guidelines}`,
                status: 'Not Started',
                completed: false,
            }));

            const { error } = await supabase.from('tasks').insert(tasksToAdd);
            if (error) throw error;
            
            toast({ title: "Tasks Added!", description: "Compliance steps have been added to your project's to-do list." });
        } catch (err) {
            toast({ title: "Failed to Add Tasks", description: err.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-primary" />
                    AI Regulation Assistant
                </CardTitle>
                <CardDescription>
                    Get AI-powered summaries for building codes and regulations.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="topic-select">Regulation Topic</Label>
                        <Select value={topic} onValueChange={setTopic}>
                            <SelectTrigger id="topic-select">
                                <SelectValue placeholder="Select topic" />
                            </SelectTrigger>
                            <SelectContent>
                                {topics.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="language-select">Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger id="language-select">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <Button onClick={handleGetAdvice} disabled={isLoading || !countryCode} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            {isLoading ? 'Thinking...' : 'Get Advice'}
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center text-center p-6 min-h-[200px] space-y-4">
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            <p className="font-semibold">AI is analyzing regulations...</p>
                            <p className="text-sm text-muted-foreground">Please wait a moment.</p>
                        </motion.div>
                    )}
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {result.error ? (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{result.error}</AlertDescription>
                                </Alert>
                            ) : (
                                <>
                                <Alert>
                                    <FileText className="h-4 w-4" />
                                    <AlertTitle>Guideline</AlertTitle>
                                    <AlertDescription>{result.guidelines}</AlertDescription>
                                </Alert>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ResultSection title="Actionable Steps" items={result.steps} />
                                    <ResultSection title="Required Documents" items={result.required_docs} />
                                </div>
                                <Button onClick={handleAddToTodo} disabled={isSaving || !selectedProject}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListTodo className="mr-2 h-4 w-4" />}
                                    {isSaving ? 'Saving...' : 'Add to To-Do List'}
                                </Button>
                                </>
                            )}
                        </motion.div>
                    )}
                    {!isLoading && !result && (
                         <div className="flex flex-col items-center justify-center text-center p-6 min-h-[200px] space-y-4 border-2 border-dashed rounded-lg">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                            <p className="font-semibold">Your compliance advice will appear here.</p>
                            <p className="text-sm text-muted-foreground">Select a topic and language, then click "Get Advice".</p>
                        </div>
                    )}
                </AnimatePresence>

            </CardContent>
        </Card>
    );
};

export default RegAssistant;