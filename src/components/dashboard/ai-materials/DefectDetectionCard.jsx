import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, ShieldX, Thermometer, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const DefectDetectionCard = ({ project, mediaUrls }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState(null);
    const { toast } = useToast();

    const handleScan = async () => {
        if (!project) {
            toast({ title: "Error", description: "Please select a project first.", variant: "destructive" });
            return;
        }
        if (!mediaUrls || mediaUrls.length === 0) {
            toast({ title: "Error", description: "Please upload media first.", variant: "destructive" });
            return;
        }

        setIsScanning(true);
        setResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('defect-detect', {
                body: { 
                    project_id: project.id, 
                    media_urls: mediaUrls,
                }
            });

            if (error) throw error;

            setResult(data.result);
            toast({
                title: "Defect Scan Complete",
                description: `Found ${Object.keys(data.result.detected_defects || {}).length} potential defects.`,
            });
            
        } catch (err) {
            toast({
                title: "Scan Failed",
                description: err.message || "An unexpected error occurred.",
                variant: "destructive"
            });
        } finally {
            setIsScanning(false);
        }
    };
    
    const defects = result?.detected_defects ? Object.entries(result.detected_defects) : [];
    const highConfidenceDefect = defects.some(([_, confidence]) => confidence > 0.7);

    const getBadgeVariant = (confidence) => {
        if (confidence > 0.85) return 'destructive';
        if (confidence > 0.6) return 'warning';
        return 'secondary';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldX className="h-5 w-5" />Defect Detection</CardTitle>
                <CardDescription>Scan media for cracks, rust, warping, and other visual defects.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleScan} disabled={isScanning || !project || !mediaUrls || mediaUrls.length === 0} className="w-full">
                    {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldX className="mr-2 h-4 w-4" />}
                    {isScanning ? 'Scanning...' : 'Scan for Defects'}
                </Button>

                {result && (
                    <div className="mt-4 pt-4 border-t">
                        {highConfidenceDefect && (
                            <Alert variant="destructive" className="mb-4">
                                <ShieldAlert className="h-4 w-4" />
                                <AlertTitle>High Confidence Defect Found!</AlertTitle>
                                <AlertDescription>
                                    Hold installation and physically inspect the material immediately.
                                </AlertDescription>
                            </Alert>
                        )}
                        {defects.length > 0 ? (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Detected Issues:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {defects.map(([defect, confidence]) => (
                                        <Badge key={defect} variant={getBadgeVariant(confidence)}>
                                            <Thermometer className="h-3 w-3 mr-1" />
                                            {defect}: {(confidence * 100).toFixed(0)}%
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ) : (
                             <p className="text-sm text-center text-muted-foreground mt-4">No significant defects detected.</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DefectDetectionCard;