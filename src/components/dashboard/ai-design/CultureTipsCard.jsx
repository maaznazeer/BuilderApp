import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Globe, Lightbulb } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const CultureTipsCard = ({ requirements, project }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [tips, setTips] = useState([]);
    const { toast } = useToast();

    const handleGetTips = async () => {
        if (!requirements || !project) {
            toast({
                title: "Information Required",
                description: "Please fill out the requirements form first.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        setTips([]);

        try {
            const { data, error } = await supabase.functions.invoke('cultural-advice', {
                body: {
                    region: project.region || 'Global',
                    climate: requirements.climate_zone,
                    family_profile: parseInt(requirements.bedrooms, 10) > 2 ? 'family' : 'single',
                }
            });

            if (error) throw error;
            setTips(data.tips);
            toast({ title: "Localized Tips Generated!", description: "AI has provided cultural and climate-specific design advice." });
        } catch (err) {
            toast({ title: "Failed to Get Tips", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Cultural Style Advisor
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
                <div>
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-40 text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="font-semibold">Generating localized advice...</p>
                        </div>
                    )}
                    <AnimatePresence>
                        {tips.length > 0 && (
                            <motion.ul 
                                className="space-y-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {tips.map((tip, index) => (
                                    <motion.li
                                        key={index}
                                        className="flex items-start gap-3 text-sm"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Lightbulb className="h-5 w-5 mt-0.5 text-yellow-400 flex-shrink-0" />
                                        <span>{tip}</span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                    {!isLoading && tips.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center h-40">
                             <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="font-semibold">Get AI-powered insights</p>
                            <p className="text-sm text-muted-foreground">Click the button below to generate tips based on your requirements.</p>
                        </div>
                    )}
                </div>
                <Button 
                    onClick={handleGetTips} 
                    disabled={isLoading || !requirements} 
                    className="w-full mt-4"
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Generating...' : 'Get Localized Tips'}
                </Button>
            </CardContent>
        </Card>
    );
};

export default CultureTipsCard;