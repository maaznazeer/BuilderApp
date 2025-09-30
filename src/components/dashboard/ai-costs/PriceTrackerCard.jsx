import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, LineChart, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const PriceTrackerCard = ({ project }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [material, setMaterial] = useState('cement');
    const [city, setCity] = useState('New York');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const { toast } = useToast();

    const handleUpdate = async () => {
        if (!material || !city) {
            toast({ title: "Missing Information", description: "Please select a material and enter a city.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('price-forecast', {
                body: { project_id: project?.id, material, city, horizon_days: 90 }
            });
            if (error) throw error;
            setResult(data.result);
            toast({ title: "Price Forecast Updated!", description: `Forecast for ${material} in ${city} is now available.` });
        } catch (err) {
            toast({ title: "Update Failed", description: err.message || "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoRefreshToggle = async (checked) => {
        setAutoRefresh(checked);
        if (checked) {
            try {
                const { data, error } = await supabase.functions.invoke('scheduler', {
                    body: { function_name: 'price-forecast', schedule: '0 0 * * 0', project_id: project?.id } // weekly schedule
                });
                if (error) throw error;
                toast({ title: "Auto-Refresh Enabled", description: data.message });
            } catch (err) {
                 toast({ title: "Scheduling Failed", description: err.message || "Could not enable auto-refresh.", variant: "destructive" });
                 setAutoRefresh(false);
            }
        } else {
             toast({ title: "Auto-Refresh Disabled", description: "Weekly price forecast updates have been turned off." });
        }
    };
    
    const TrendIcon = ({ current, future }) => {
        if (future > current) return <TrendingUp className="h-4 w-4 text-red-500" />;
        if (future < current) return <TrendingDown className="h-4 w-4 text-green-500" />;
        return <Minus className="h-4 w-4 text-gray-500" />;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5" />Material Price Tracker</CardTitle>
                <CardDescription>Track and predict local material prices to optimize procurement.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Select value={material} onValueChange={setMaterial}>
                            <SelectTrigger><SelectValue placeholder="Select Material" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cement">Cement</SelectItem>
                                <SelectItem value="steel">Steel</SelectItem>
                                <SelectItem value="timber">Timber</SelectItem>
                                <SelectItem value="tile">Tile</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <Button onClick={handleUpdate} disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isLoading ? 'Forecasting...' : 'Update & Predict 90d'}
                    </Button>
                     <div className="flex items-center justify-between pt-2">
                        <Label htmlFor="auto-refresh-price" className="text-sm font-medium">Auto-refresh weekly</Label>
                        <Switch id="auto-refresh-price" checked={autoRefresh} onCheckedChange={handleAutoRefreshToggle} />
                    </div>
                </div>

                {result && (
                    <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold mb-2 text-center">
                            Forecast for <span className="capitalize text-primary">{result.material}</span> in <span className="text-primary">{result.city}</span>
                        </h4>
                        <p className="text-center text-sm text-muted-foreground mb-4">
                            Current Price Index: <span className="font-bold text-lg text-foreground">{result.current_index}</span>
                        </p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Horizon</TableHead>
                                    <TableHead className="text-right">Forecasted Index</TableHead>
                                    <TableHead className="text-right">Trend</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>30 Days</TableCell>
                                    <TableCell className="text-right font-medium">{result.forecast_30d}</TableCell>
                                    <TableCell className="flex justify-end"><TrendIcon current={result.current_index} future={result.forecast_30d} /></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>60 Days</TableCell>
                                    <TableCell className="text-right font-medium">{result.forecast_60d}</TableCell>
                                    <TableCell className="flex justify-end"><TrendIcon current={result.forecast_30d} future={result.forecast_60d} /></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>90 Days</TableCell>
                                    <TableCell className="text-right font-medium">{result.forecast_90d}</TableCell>
                                    <TableCell className="flex justify-end"><TrendIcon current={result.forecast_60d} future={result.forecast_90d} /></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PriceTrackerCard;