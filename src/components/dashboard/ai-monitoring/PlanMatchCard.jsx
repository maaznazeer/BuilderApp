import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AnalysisResult = ({ result }) => {
    const overallPass = result.every(r => r.is_pass);

    return (
        <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold">Analysis Complete</h3>
                <Badge variant={overallPass ? 'success' : 'destructive'}>
                    {overallPass ? 'Pass' : 'Fail'}
                </Badge>
            </div>
            <div className="space-y-4">
                {result.map(item => (
                    <Card key={item.id} className={item.is_pass ? 'bg-green-50/50' : 'bg-red-50/50'}>
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                {item.is_pass ? <CheckCircle className="h-5 w-5 text-green-600 mt-1" /> : <XCircle className="h-5 w-5 text-red-600 mt-1" />}
                                <div>
                                    <p className="font-semibold text-sm">Media: <a href={item.media_url} target="_blank" rel="noopener noreferrer" className="underline truncate">{item.media_url.split('/').pop()}</a></p>
                                    <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                                        <li>Element Present: <span className="font-medium">{item.element_present ? "Yes" : "No"}</span></li>
                                        <li>Material Matches Spec: <span className="font-medium">{item.material_matches_spec ? "Yes" : "No"}</span></li>
                                        <li>Dimensions: <span className="font-medium">{item.dimension_match_details}</span></li>
                                    </ul>
                                    {!item.is_pass && item.differences?.length > 0 && (
                                        <div className="mt-2">
                                            <p className="font-semibold text-xs text-red-700">Discrepancies:</p>
                                            <ul className="list-disc pl-5 mt-1 text-xs text-red-600">
                                                {item.differences.map((diff, i) => <li key={i}>{diff}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};


const PlanMatchCard = ({ project, mediaUrls }) => {
    const [planRefId, setPlanRefId] = useState('');
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
        if (!planRefId) {
            toast({ title: "Error", description: "Please provide a Plan Reference ID.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setAnalysisResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('vision-verify', {
                body: {
                    project_id: project.id,
                    media_urls: mediaUrls,
                    plan_ref_id: planRefId,
                }
            });

            if (error) throw error;
            
            setAnalysisResult(data.results);
            toast({ title: "Success", description: "Analysis completed successfully." });

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
                <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />Plan Match Analysis</CardTitle>
                <CardDescription>2. Enter a Plan ID and analyze your uploaded media to verify against architectural plans.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="plan-ref">Plan Reference ID</Label>
                        <Input 
                            id="plan-ref" 
                            placeholder="e.g., A-201, Floor-1-Electrical" 
                            value={planRefId}
                            onChange={(e) => setPlanRefId(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <Button onClick={handleAnalyze} disabled={isLoading || !project || mediaUrls.length === 0}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                        Analyze Media
                    </Button>
                </div>

                {isLoading && (
                    <div className="mt-6 text-center">
                        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                        <p className="mt-2 text-muted-foreground">AI is analyzing, please wait...</p>
                    </div>
                )}

                {analysisResult && <AnalysisResult result={analysisResult} />}
                
            </CardContent>
        </Card>
    );
};

export default PlanMatchCard;