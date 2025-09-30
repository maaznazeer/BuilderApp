import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { BarChart, Scale, Loader2, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/lib/customSupabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const PriceBenchmarker = () => {
    const { toast } = useToast();
    const [itemType, setItemType] = useState('labor');
    const [city, setCity] = useState('douala');
    const [details, setDetails] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [benchmarkResult, setBenchmarkResult] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const laborOptions = [
        { value: 'mason', label: 'Mason (per day)' },
        { value: 'electrician', label: 'Electrician (per day)' },
        { value: 'plumber', label: 'Plumber (per day)' },
        { value: 'carpenter', label: 'Carpenter (per day)' },
        { value: 'painter', label: 'Painter (per day)' },
    ];

    const materialOptions = [
        { value: 'cement', label: 'Cement (per bag)' },
        { value: 'steel', label: 'Steel (per ton)' },
        { value: 'timber', label: 'Timber (per m³)' },
        { value: 'sand', label: 'Sand (per m³)' },
        { value: 'gravel', label: 'Gravel (per m³)' },
    ];

    const handleBenchmark = async () => {
        if (!city || !itemType || !details) {
            toast({ title: "Missing Information", description: "Please select a city, item type, and specific item.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        setBenchmarkResult(null);
        try {
            const { data, error } = await supabase.functions.invoke('price-benchmark', {
                body: { city, item_type: itemType, details }
            });
            if (error) throw error;
            setBenchmarkResult(data);
            toast({ title: "Benchmark Complete!", description: "Fair market price range has been calculated." });
        } catch (err) {
            toast({ title: "Benchmark Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
    };

    const getEmailTemplate = () => {
        if (!benchmarkResult) return '';
        const itemLabel = [...laborOptions, ...materialOptions].find(opt => opt.value === details)?.label || details;
        return `Subject: Offer for ${itemLabel}

Dear [Contractor/Supplier Name],

Thank you for your quote regarding the ${itemLabel}.

After reviewing the local market rates for ${city}, we've found that a fair price range is typically between ${formatCurrency(benchmarkResult.fair_range_low, benchmarkResult.currency)} and ${formatCurrency(benchmarkResult.fair_range_high, benchmarkResult.currency)}.

Based on this, we would like to propose an offer of ${formatCurrency(benchmarkResult.median, benchmarkResult.currency)}. We believe this is a competitive and fair price that reflects the current market.

We are eager to move forward and look forward to your response.

Best regards,
[Your Name]`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(getEmailTemplate());
        toast({ title: "Copied to clipboard!" });
    };

    return (
        <>
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5 text-primary" />
                        AI Negotiation Support
                    </CardTitle>
                    <CardDescription>
                        Benchmark local prices for labor and materials to ensure fair quotes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Item Type</Label>
                            <Select value={itemType} onValueChange={(val) => { setItemType(val); setDetails(''); setBenchmarkResult(null); }}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="labor">Labor</SelectItem>
                                    <SelectItem value="material">Material</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Select value={city} onValueChange={(val) => { setCity(val); setBenchmarkResult(null); }}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="douala">Douala</SelectItem>
                                    <SelectItem value="yaounde">Yaoundé</SelectItem>
                                    <SelectItem value="nairobi">Nairobi</SelectItem>
                                    <SelectItem value="lagos">Lagos</SelectItem>
                                    <SelectItem value="accra">Accra</SelectItem>
                                    <SelectItem value="abidjan">Abidjan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Specific Item</Label>
                        <Select value={details} onValueChange={(val) => { setDetails(val); setBenchmarkResult(null); }}>
                            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent>
                                {(itemType === 'labor' ? laborOptions : materialOptions).map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <AnimatePresence>
                        {benchmarkResult && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="pt-4 space-y-3"
                            >
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Fair Market Price</p>
                                    <p className="text-2xl font-bold text-primary">{formatCurrency(benchmarkResult.median, benchmarkResult.currency)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Range: {formatCurrency(benchmarkResult.fair_range_low, benchmarkResult.currency)} - {formatCurrency(benchmarkResult.fair_range_high, benchmarkResult.currency)}
                                    </p>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2.5">
                                    <div className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                                <p className="text-xs text-muted-foreground italic text-center px-2">{benchmarkResult.notes}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                    <Button className="w-full" onClick={handleBenchmark} disabled={isLoading || !details}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Benchmarking...' : 'Benchmark Price'}
                    </Button>
                    {benchmarkResult && (
                        <Button variant="outline" className="w-full" onClick={() => setIsModalOpen(true)}>
                            <Mail className="mr-2 h-4 w-4" /> Create Offer Email
                        </Button>
                    )}
                </CardFooter>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Create Offer Email</DialogTitle>
                        <DialogDescription>
                            Copy this pre-filled template to start your negotiation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted/50 p-4 rounded-md border max-h-[50vh] overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap font-sans">{getEmailTemplate()}</pre>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
                        <Button type="button" onClick={copyToClipboard}>Copy Template</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PriceBenchmarker;