import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Lightbulb, CheckCircle, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const AiQualityAdvisorCard = ({ project, onCategoryChange }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [formState, setFormState] = useState({ category: '', city: '', budget_tier: '' });
    const { toast } = useToast();

    useEffect(() => {
        if (onCategoryChange) {
            onCategoryChange(formState.category);
        }
    }, [formState.category, onCategoryChange]);

    const handleGetAdvice = async () => {
        if (!formState.category || !formState.city || !formState.budget_tier) {
            toast({ title: "Missing Information", description: "Please fill out all fields to get advice.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('quality-advice', {
                body: formState
            });

            if (error) throw error;
            setResult(data);
            toast({ title: "AI Advice Received!", description: "Here are the top recommendations for your query." });
        } catch (err) {
            toast({
                title: "Failed to get advice",
                description: err.message || "An unexpected error occurred.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSupplier = async (supplier) => {
        const { error } = await supabase.from('approved_suppliers').insert({
            project_id: project?.id, // Optional: link to project
            name: supplier.name,
            category: formState.category,
            city: formState.city,
            score: supplier.score,
            est_price: supplier.est_price,
            notes: supplier.notes,
        });

        if (error) {
            toast({ title: "Save Failed", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Supplier Saved!", description: `${supplier.name} has been added to your approved list.`, variant: "success" });
        }
    };

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5" />AI Quality Advisor</CardTitle>
                <CardDescription>Get local supplier and brand recommendations based on your needs.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Select onValueChange={(v) => setFormState(s => ({ ...s, category: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select Category..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cement">Cement</SelectItem>
                            <SelectItem value="steel">Steel</SelectItem>
                            <SelectItem value="tile">Tile</SelectItem>
                            <SelectItem value="timber">Timber</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input placeholder="Enter City..." value={formState.city} onChange={(e) => setFormState(s => ({ ...s, city: e.target.value }))} />
                    <Select onValueChange={(v) => setFormState(s => ({ ...s, budget_tier: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select Budget Tier..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="economy">Economy</SelectItem>
                            <SelectItem value="mid-range">Mid-Range</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleGetAdvice} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Getting Advice...' : 'Get AI Advice'}
                </Button>

                {result && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Recommended Brands:</h4>
                            <div className="flex flex-wrap gap-2">
                                {result.brand_recos.map(brand => <Badge key={brand} variant="outline">{brand}</Badge>)}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Recommended Suppliers:</h4>
                            <ScrollArea className="h-[200px] border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Supplier</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead>Est. Price</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.supplier_list.map((supplier, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">{supplier.name}</TableCell>
                                                <TableCell><Badge variant={supplier.score > 4.5 ? "success" : "secondary"}>{supplier.score}</Badge></TableCell>
                                                <TableCell>{supplier.est_price}</TableCell>
                                                <TableCell className="text-right">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" onClick={() => handleSaveSupplier(supplier)}>
                                                                    <PlusCircle className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Save to Approved List</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AiQualityAdvisorCard;