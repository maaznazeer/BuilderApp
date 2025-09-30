import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, AreaChart, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const EstimationResult = ({ result }) => {
    const confidenceColor = result.confidence >= 0.9 ? 'success' : result.confidence >= 0.8 ? 'warning' : 'destructive';

    return (
        <div className="mt-6 space-y-4">
            {result.is_behind_schedule && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Behind Schedule</AlertTitle>
                    <AlertDescription>
                        AI analysis suggests this project is tracking behind the planned schedule. Review task dependencies and resource allocation.
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex items-baseline justify-between">
                 <h3 className="text-lg font-semibold">Stage: <span className="text-primary">{result.stage_name}</span></h3>
                <Badge variant={confidenceColor}>Confidence: {Math.round(result.confidence * 100)}%</Badge>
            </div>
           
            <div>
                <Label>Estimated Completion</Label>
                <Progress value={result.pct_complete} className="mt-1" />
                <p className="text-right text-sm font-bold mt-1">{result.pct_complete}%</p>
            </div>

             <div>
                <Label>AI Notes</Label>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{result.notes}</p>
            </div>
        </div>
    );
};


const ProgressEstimatorCard = ({ project, mediaUrls }) => {
    const [scheduleRefId, setScheduleRefId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const { toast } = useToast();

    const handleAnalyze = async () => {
        if (!project) {
            toast({ title: "Error", description: "Please select a project first.", variant: "destructive" });
            return;
        }
        if (!mediaUrls || mediaUrls.length === 0) {
            toast({ title: "Error", description: "Please upload media files before analyzing.", variant: "destructive" });
            return;
        }
        if (!scheduleRefId) {
            toast({ title: "Error", description: "Please provide a Schedule Baseline ID.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setAnalysisResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('progress-estimate', {
                body: {
                    project_id: project.id,
                    media_urls: mediaUrls,
                    schedule_baseline_id: scheduleRefId,
                }
            });

            if (error) throw error;
            
            setAnalysisResult(data.result);
            toast({ title: "Success", description: "Progress estimation completed." });

        } catch (error) {
            toast({
                title: "Analysis Failed",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><AreaChart className="h-5 w-5" />Progress Estimation</CardTitle>
                <CardDescription>Enter a Schedule Baseline ID to estimate the current construction stage and completion percentage from uploaded media.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="schedule-ref">Schedule Baseline ID</Label>
                        <Input 
                            id="schedule-ref" 
                            placeholder="e.g., Main-Schedule-V1, Phase-2-Baseline" 
                            value={scheduleRefId}
                            onChange={(e) => setScheduleRefId(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <Button onClick={handleAnalyze} disabled={isLoading || !project || mediaUrls.length === 0}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AreaChart className="mr-2 h-4 w-4" />}
                        Estimate Stage
                    </Button>
                </div>

                {isLoading && (
                    <div className="mt-6 text-center">
                        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                        <p className="mt-2 text-muted-foreground">Estimating progress, this may take a moment...</p>
                    </div>
                )}

                {analysisResult && <EstimationResult result={analysisResult} />}
                
            </CardContent>
        </Card>
    );
};

export default ProgressEstimatorCard;