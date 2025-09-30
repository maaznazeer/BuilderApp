import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Cpu, FileDown, Banknote, ShieldCheck } from 'lucide-react';

const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

const FinanceSimCard = ({ project }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [result, setResult] = useState(null);
    const [inputs, setInputs] = useState({ capex: '5000', remit: '300', duration: '24' });
    const { toast } = useToast();

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setInputs(prev => ({ ...prev, [id]: value }));
    };

    const handleRunSim = async () => {
        if (!project) {
            toast({ title: "No Project Selected", description: "Please select a project to run the simulation.", variant: "destructive" });
            return;
        }
        if (!inputs.capex || !inputs.remit || !inputs.duration) {
            toast({ title: "Missing Information", description: "Please fill out all fields.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('finance-opt', {
                body: { 
                    project_id: project.id,
                    capex_total: inputs.capex,
                    remit: inputs.remit,
                    timeline: inputs.duration
                }
            });

            if (error) throw error;
            setResult(data.result);
            toast({ title: "Simulation Complete!", description: "AI has found a financing option for you." });
        } catch (err) {
            toast({ title: "Simulation Failed", description: err.message || "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleExport = async () => {
        if (!result) return;
        setIsExporting(true);
        try {
             const { data, error } = await supabase.functions.invoke('export-plan-pdf', {
                body: { 
                   ...result,
                   capex: inputs.capex,
                   duration: inputs.duration
                }
            });
            if (error) throw error;

            const { base64, filename } = data;
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${base64}`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({ title: "Export Successful!", description: `${filename} has been downloaded.` });
        } catch (err) {
             toast({ title: "Export Failed", description: err.message || "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5" />Finance Simulator</CardTitle>
                <CardDescription>Find optimal microloan & installment plans for your CAPEX.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="capex">Total Capital Needed (CAPEX)</Label>
                        <Input id="capex" type="number" placeholder="5000" value={inputs.capex} onChange={handleInputChange} />
                    </div>
                    <div>
                        <Label htmlFor="remit">Monthly Payment Capacity</Label>
                        <Input id="remit" type="number" placeholder="300" value={inputs.remit} onChange={handleInputChange} />
                    </div>
                    <div>
                        <Label htmlFor="duration">Desired Duration (Months)</Label>
                        <Input id="duration" type="number" placeholder="24" value={inputs.duration} onChange={handleInputChange} />
                    </div>
                    <Button onClick={handleRunSim} disabled={isLoading || !project} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isLoading ? 'Simulating...' : 'Find Best Option'}
                    </Button>
                </div>

                {result && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                         <h4 className="font-semibold text-center text-primary">AI Recommendation</h4>
                         <div className="p-3 bg-muted rounded-lg space-y-2">
                            <p className="font-bold text-lg">{result.option_name}</p>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Est. APR</span>
                                <span className="font-medium">{result.apr}%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Monthly Payment</span>
                                <span className="font-medium">{formatCurrency(result.monthly_payment)}</span>
                            </div>
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Payment Buffer</span>
                                <span className="font-medium text-green-600">{formatCurrency(result.buffer)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground pt-2">{result.notes}</p>
                         </div>
                         <Button onClick={handleExport} disabled={isExporting} className="w-full" variant="secondary">
                            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                            {isExporting ? 'Exporting...' : 'Export plan (PDF)'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default FinanceSimCard;