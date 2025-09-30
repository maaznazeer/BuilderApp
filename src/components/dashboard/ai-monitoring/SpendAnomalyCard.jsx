import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, AlertTriangle, ScanLine, FileWarning, Sparkles, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

const SpendAnomalyCard = ({ project }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [anomalies, setAnomalies] = useState([]);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    const fetchAnomalies = useCallback(async () => {
        if (!project) return;
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('spend_anomalies')
                .select('*')
                .eq('project_id', project.id)
                .order('date', { ascending: false })
                .limit(10);
            if (error) throw error;
            setAnomalies(data);
        } catch (err) {
            setError('Failed to fetch past anomalies.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [project]);

    useEffect(() => {
        fetchAnomalies();
    }, [fetchAnomalies]);


    const handleScan = async () => {
        if (!project) {
            toast({ title: "Error", description: "Please select a project first.", variant: "destructive" });
            return;
        }

        setIsScanning(true);
        setError(null);
        
        try {
            const { data, error } = await supabase.functions.invoke('budget-anomaly-scan', {
                body: { project_id: project.id, lookback_days: 60 }
            });

            if (error) throw error;

            toast({
                title: "Scan Complete",
                description: `Found ${data.results?.length || 0} new anomalies.`,
            });
            fetchAnomalies(); // Refresh the list
        } catch (err) {
            toast({
                title: "Scan Failed",
                description: err.message || "An unexpected error occurred.",
                variant: "destructive"
            });
            setError(err.message);
        } finally {
            setIsScanning(false);
        }
    };

    const getScoreVariant = (score) => {
        const absScore = Math.abs(score);
        if (absScore > 3.5) return 'destructive';
        if (absScore > 2.5) return 'warning';
        return 'secondary';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileWarning className="h-5 w-5" />Spend Anomaly Detection</CardTitle>
                <CardDescription>Scan project expenses to detect statistically significant deviations from spending patterns.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 p-4 mb-6 rounded-lg bg-muted/50">
                    <Button onClick={handleScan} disabled={isScanning || !project}>
                        {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
                        {isScanning ? 'Scanning...' : 'Run Anomaly Scan'}
                    </Button>
                    <p className="text-sm text-muted-foreground">Scans financial data from the last 60 days.</p>
                </div>
                
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>An Error Occurred</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <h3 className="text-md font-semibold mb-2">Spending Signals</h3>
                 <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Z-Score</TableHead>
                                <TableHead>Note</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : anomalies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Sparkles className="h-6 w-6"/>
                                            <p>No anomalies detected yet. Run a scan to begin.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                anomalies.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{format(new Date(item.date), 'MMM dd, yyyy')}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: project.currency || 'USD' }).format(item.amount)}</TableCell>
                                        <TableCell>
                                            <Badge variant={getScoreVariant(item.z_score)}>
                                                {item.z_score}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{item.note}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default SpendAnomalyCard;