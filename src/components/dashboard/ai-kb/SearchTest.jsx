import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Send, FileText, BrainCircuit, Sparkles, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useDashboard } from '@/contexts/DashboardContext';
import ReactMarkdown from 'react-markdown';

const askSchema = z.object({
  ask_q: z.string().min(5, "Question must be at least 5 characters long."),
  ask_lang: z.string().default('en'),
  ask_live: z.boolean().default(false),
});

const askAssistant = async ({ question, lang, live_data, project_id }) => {
    const { data, error } = await supabase.functions.invoke('assistant-ask', {
        body: { question, lang, live_data, project_id },
    });

    if (error) {
        throw new Error('Assistant request failed: ' + error.message);
    }
    return data;
};

const SearchTest = () => {
    const { toast } = useToast();
    const { selectedProject } = useDashboard();
    const [lastAnswer, setLastAnswer] = useState(null);

    const form = useForm({
        resolver: zodResolver(askSchema),
        defaultValues: {
            ask_q: '',
            ask_lang: 'en',
            ask_live: false,
        },
    });

    const mutation = useMutation(askAssistant, {
        onSuccess: (data) => {
            setLastAnswer(data);
            toast({
                title: 'Answer Received',
                description: `The assistant responded with ${data.citations.length} sources.`,
            });
        },
        onError: (error) => {
            toast({
                variant: 'destructive',
                title: 'Request Failed',
                description: error.message,
            });
        },
    });

    const onSubmit = (values) => {
        mutation.mutate({ 
            question: values.ask_q, 
            lang: values.ask_lang, 
            live_data: values.ask_live,
            project_id: values.ask_live ? selectedProject?.id : null
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Assistant Test</CardTitle>
                <CardDescription>Query your knowledge base and test the AI's responses.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="ask_q"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Question</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., What is the standard curing time for concrete?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="ask_lang"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Language</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Language" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="fr">French</SelectItem>
                                                <SelectItem value="local">Local</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ask_live"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col justify-center">
                                        <FormLabel>Use Live Data</FormLabel>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={!selectedProject}
                                                />
                                            </FormControl>
                                            <span className="text-sm text-muted-foreground">
                                                {selectedProject ? `Project: ${selectedProject.name}` : 'No project selected'}
                                            </span>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={mutation.isLoading} className="w-full">
                            {mutation.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Ask Assistant
                        </Button>
                    </form>
                </Form>

                {mutation.isLoading && (
                    <div className="mt-6 text-center">
                        <BrainCircuit className="h-10 w-10 mx-auto animate-pulse text-primary" />
                        <p className="text-sm text-muted-foreground mt-2">Thinking...</p>
                    </div>
                )}

                {lastAnswer && !mutation.isLoading && (
                    <div className="mt-6 space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-yellow-500" />Answer</h4>
                            <div className="prose prose-sm max-w-none p-4 bg-muted rounded-md border">
                                <ReactMarkdown>{lastAnswer.answer}</ReactMarkdown>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Cited Sources</h4>
                            <div className="space-y-2">
                                {lastAnswer.citations.map((cite, index) => (
                                    <div key={index} className="p-3 border rounded-lg bg-background">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-medium flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="truncate max-w-[200px]">{cite.title || 'Untitled Source'}</span>
                                            </p>
                                            <Badge variant="secondary">
                                                {(cite.similarity * 100).toFixed(1)}%
                                            </Badge>
                                        </div>
                                        {cite.url && (
                                            <a href={cite.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                                                <LinkIcon className="h-3 w-3" />
                                                Source Link
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {mutation.isError && !mutation.isLoading && (
                     <div className="mt-6 text-destructive text-sm p-3 bg-destructive/10 rounded-md">
                        {mutation.error.message}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SearchTest;