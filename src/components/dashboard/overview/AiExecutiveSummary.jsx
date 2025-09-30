import React from 'react';
import { useQuery } from 'react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { useProject } from '@/contexts/ProjectContext';

const fetchExecutiveSummary = async (projectId) => {
    const question = projectId 
        ? `Provide an executive summary for the project with ID ${projectId}. Highlight key risks, budget status, and upcoming critical milestones.`
        : "Provide a high-level executive summary of all my projects. Highlight portfolio-wide risks, overall budget status, and the most critical upcoming milestones across all projects. Be concise and use markdown for formatting.";

    const { data, error } = await supabase.functions.invoke('assistant-ask', {
        body: {
            question,
            live_data: true,
            project_id: projectId
        }
    });
    if (error) throw error;
    return data;
};

const AiExecutiveSummary = () => {
    const { currentProject } = useProject();
    const projectId = currentProject?.id || null;

    const { data: summary, isLoading, isError, error, refetch } = useQuery(
        ['aiExecutiveSummary', projectId], 
        () => fetchExecutiveSummary(projectId), 
        {
          staleTime: 1000 * 60 * 15, // 15 minutes
          refetchOnWindowFocus: false,
        }
    );

    return (
        <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-blue-900/20">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Bot className="w-6 h-6 text-primary" />
                        AI Executive Summary
                    </CardTitle>
                    <CardDescription>{projectId ? `Briefing for ${currentProject.name}` : "Your AI-powered daily briefing."}</CardDescription>
                </div>
                 <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading}>
                    <Sparkles className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                )}
                {isError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error?.message || 'Could not fetch AI summary.'}</AlertDescription>
                    </Alert>
                )}
                {summary && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{summary.answer}</ReactMarkdown>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AiExecutiveSummary;