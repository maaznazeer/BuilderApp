import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, ScanSearch, CheckCircle, AlertTriangle, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const MaterialRecognitionCard = ({ project, mediaUrls }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState(null);
    const { toast } = useToast();

    const handleIdentify = async () => {
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
            const { data, error } = await supabase.functions.invoke('material-recognize', {
                body: { 
                    project_id: project.id, 
                    media_urls: mediaUrls,
                    allowed_brands: ['SampleBrand', 'SteelCorp'] // Example allowed brands
                }
            });

            if (error) throw error;

            setResult(data.result);
            toast({
                title: "Recognition Complete",
                description: `Detected: ${data.result.detected_brand}`,
            });

            if (data.result.mismatch) {
                toast({
                    title: "Substitution Risk Detected!",
                    description: `An alert has been created for an unexpected material.`,
                    variant: "destructive"
                });
            }

        } catch (err) {
            toast({
                title: "Recognition Failed",
                description: err.message || "An unexpected error occurred.",
                variant: "destructive"
            });
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ScanSearch className="h-5 w-5" />Material Recognition</CardTitle>
                <CardDescription>Identify materials from images to detect unauthorized substitutions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleIdentify} disabled={isScanning || !project || !mediaUrls || mediaUrls.length === 0} className="w-full">
                    {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanSearch className="mr-2 h-4 w-4" />}
                    {isScanning ? 'Identifying...' : 'Identify Material'}
                </Button>

                {result && (
                    <div className="mt-4 space-y-2 pt-4 border-t">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Detected Brand:</span>
                            <span className="font-semibold">{result.detected_brand}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Model / Size:</span>
                            <span className="font-semibold">{result.detected_model} / {result.detected_size}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Confidence:</span>
                            <Badge variant="secondary">
                                <Percent className="h-3 w-3 mr-1" />
                                {(result.confidence * 100).toFixed(1)}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Status:</span>
                            {result.mismatch ? (
                                <Badge variant="destructive">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Mismatch
                                </Badge>
                            ) : (
                                <Badge variant="success">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Match
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default MaterialRecognitionCard;