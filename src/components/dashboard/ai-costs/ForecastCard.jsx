import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Bot, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

const ForecastCard = ({ project }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const { toast } = useToast();

    const handleRunForecast = async () => {
        if (!project) {
            toast({ title: "No Project Selected", description: "Please select a project to run a forecast.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('budget-forecast', {
                body: { project_id: project.id }
            });

            if (error) throw error;
            setResult(data.result);
            toast({ title: "Forecast Complete!", description: "AI budget forecast has been generated." });
        } catch (err) {
            toast({
                title: "Forecast Failed",
                description: err.message || "An unexpected error occurred.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" />AI Budget Forecaster</CardTitle>
                <CardDescription>Generate dynamic budget forecasts based on progress and market volatility.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleRunForecast} disabled={isLoading || !project} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Forecasting...' : 'Run New Forecast'}
                </Button>

                {result && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-sm text-muted-foreground">P50 Overrun</p>
                                <p className="text-lg font-bold flex items-center justify-center gap-1">
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                    {formatCurrency(result.p50_overrun)}
                                </p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">P90 Overrun</p>
                                <p className="text-lg font-bold flex items-center justify-center gap-1">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                    {formatCurrency(result.p90_overrun)}
                                </p>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Top Risk Drivers:</h4>
                            <div className="space-y-2">
                                {result.risk_drivers.map((driver, i) => (
                                    <div key={i} className="text-xs p-2 bg-muted rounded-md">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">{driver.driver}</span>
                                            <Badge variant={driver.impact === 'High' ? 'destructive' : 'secondary'}>{driver.impact}</Badge>
                                        </div>
                                        <p className="text-muted-foreground">{driver.mitigation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-[200px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={result.forecast_data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" style={{ fontSize: '12px' }} />
                                    <YAxis tickFormatter={(value) => `$${value/1000}k`} style={{ fontSize: '12px' }} />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                    <Line type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={2} name="Actual Spend" />
                                    <Line type="monotone" dataKey="forecast" stroke="#8884d8" strokeWidth={2} name="Forecast" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ForecastCard;