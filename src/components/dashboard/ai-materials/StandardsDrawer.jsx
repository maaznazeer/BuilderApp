import React, { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { BookOpen, FlaskConical, Loader2, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const StandardsDrawer = ({ category }) => {
    const [standards, setStandards] = useState([]);
    const [testAdvice, setTestAdvice] = useState(null);
    const [isStandardsLoading, setIsStandardsLoading] = useState(false);
    const [isTestsLoading, setIsTestsLoading] = useState(false);
    const [useCase, setUseCase] = useState('');
    const { toast } = useToast();

    const fetchStandards = useCallback(async () => {
        if (!category) return;
        setIsStandardsLoading(true);
        try {
            const { data, error } = await supabase
                .from('standards_refs')
                .select('spec_code, description, url')
                .eq('category', category)
                .limit(10);
            
            if (error) throw error;
            setStandards(data);
        } catch (err) {
            toast({ title: 'Error fetching standards', description: err.message, variant: 'destructive' });
            setStandards([]);
        } finally {
            setIsStandardsLoading(false);
        }
    }, [category, toast]);

    const handleGetTestAdvice = async () => {
        if (!category || !useCase) {
            toast({ title: 'Missing Information', description: 'Please select a material category and a use case.', variant: 'destructive' });
            return;
        }
        setIsTestsLoading(true);
        setTestAdvice(null);
        try {
            const { data, error } = await supabase.functions.invoke('material-tests-advice', {
                body: { category, use_case: useCase }
            });
            if (error) throw error;
            setTestAdvice(data.test_set);
            toast({ title: 'Test Advice Received', description: `Found ${data.test_set.length} recommended tests.` });
        } catch (err) {
            toast({ title: 'Error getting test advice', description: err.message, variant: 'destructive' });
        } finally {
            setIsTestsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchStandards();
    }, [fetchStandards]);
    
    const useCaseOptions = {
        cement: [{value: "foundation", label: "Foundation"}, {value: "general", label: "General Purpose"}],
        steel: [{value: "structural_beam", label: "Structural Beam"}, {value: "general", label: "General Purpose"}],
        tile: [{value: "high_traffic_floor", label: "High-Traffic Floor"}, {value: "wall", label: "Wall Application"}],
        timber: [{value: "structural", label: "Structural Framing"}, {value: "exterior", label: "Exterior Use"}],
    };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
            <BookOpen className="mr-2 h-4 w-4" /> View Compliance Standards
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><BookOpen/> Material & QA Standards</SheetTitle>
          <SheetDescription>
            Reference key industry standards and get AI advice on durability tests for your selected material category.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-4 flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-4">
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2 capitalize">{category || "All"} Standards</h3>
                        {isStandardsLoading ? (
                             <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : standards.length > 0 ? (
                            <div className="space-y-3">
                                {standards.map(standard => (
                                    <a key={standard.spec_code} href={standard.url} target="_blank" rel="noopener noreferrer" className="block p-3 border rounded-lg hover:bg-muted transition-colors">
                                        <div className="flex justify-between items-start">
                                          <Badge>{standard.spec_code}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{standard.description}</p>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">No standards found for this category or category not selected.</p>
                        )}
                    </div>

                    <div className="border-t pt-6 space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><FlaskConical/> AI Durability Test Advisor</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select value={useCase} onValueChange={setUseCase}>
                                <SelectTrigger disabled={!category}>
                                    <SelectValue placeholder="Select Use Case..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {(useCaseOptions[category] || []).map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                    {!useCaseOptions[category] && <SelectItem value="general" disabled>Select category first</SelectItem>}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleGetTestAdvice} disabled={isTestsLoading || !category || !useCase}>
                                {isTestsLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Search className="h-4 w-4 mr-2" />}
                                Get Test Advice
                            </Button>
                        </div>
                        {testAdvice && (
                             <Alert>
                                <FlaskConical className="h-4 w-4"/>
                                <AlertTitle>Recommended Tests</AlertTitle>
                                <AlertDescription>
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        {testAdvice.map(test => (
                                            <li key={test.name}>
                                                <strong>{test.name}:</strong> <span className="text-muted-foreground">{test.threshold}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StandardsDrawer;