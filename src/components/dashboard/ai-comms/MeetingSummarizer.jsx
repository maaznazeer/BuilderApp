import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { FileText, Upload, Loader2, Save, CheckCircle, ListTodo, AlertTriangle, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { format } from 'date-fns';

const MeetingSummarizer = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const { selectedProject } = useProject();

    const [mediaUrl, setMediaUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [summaryResult, setSummaryResult] = useState(null);

    const handleSummarize = async () => {
        if (!mediaUrl.trim()) {
            toast({ title: "Media URL is empty", description: "Please provide a link to the audio/video file.", variant: "destructive" });
            return;
        }
        if (!selectedProject) {
            toast({ title: "No project selected", description: "Please select a project first.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setSummaryResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('meeting-summarize', {
                body: { project_id: selectedProject.id, media_url: mediaUrl, lang: 'en' }
            });

            if (error) throw error;
            
            setSummaryResult(data.summary);
            toast({ title: "Summary generated successfully!" });

        } catch (err) {
            toast({ title: "Summarization failed", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveMinutes = async () => {
        if (!summaryResult || !selectedProject || !user) {
            toast({ title: "Cannot save minutes", description: "No summary available or project not selected.", variant: "destructive" });
            return;
        }

        const meetingTitle = `Meeting Summary - ${format(new Date(), 'yyyy-MM-dd HH:mm')}`;

        try {
            const { error } = await supabase
                .from('meetings')
                .insert({
                    project_id: selectedProject.id,
                    user_id: user.id,
                    title: meetingTitle,
                    meeting_date: new Date().toISOString(),
                    summary: summaryResult
                });

            if (error) throw error;

            toast({ title: "Meeting minutes saved successfully!" });
        } catch (err) {
            toast({ title: "Failed to save minutes", description: err.message, variant: "destructive" });
        }
    };

    const renderSummary = () => {
        if (!summaryResult) return null;

        return (
            <div className="mt-4 space-y-4 text-sm">
                <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2"><Key className="h-4 w-4 text-primary"/> Key Decisions</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {summaryResult.key_decisions.map((decision, index) => <li key={index}>{decision}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2"><ListTodo className="h-4 w-4 text-primary"/> Action Items</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {summaryResult.action_items.map((action, index) => (
                            <li key={index}>{action.item} (Due: {format(new Date(action.due), 'MMM dd, yyyy')})</li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Meeting Summarizer
                </CardTitle>
                <CardDescription>
                    Paste a link to an audio/video file to get key points.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                {!summaryResult ? (
                    <>
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center h-48 bg-muted/20">
                            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                            <Input 
                                type="url"
                                placeholder="Paste audio/video link here..."
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        {isLoading && (
                            <div className="text-center mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                AI is transcribing and summarizing...
                            </div>
                        )}
                    </>
                ) : renderSummary()}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
                {!summaryResult ? (
                     <Button className="w-full" onClick={handleSummarize} disabled={isLoading || !mediaUrl}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Processing...' : 'Transcribe & Summarize'}
                    </Button>
                ) : (
                    <>
                        <Button className="w-full" onClick={handleSaveMinutes}>
                            <Save className="mr-2 h-4 w-4" /> Save as Minutes
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => setSummaryResult(null)}>
                            Summarize Another
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    );
};

export default MeetingSummarizer;