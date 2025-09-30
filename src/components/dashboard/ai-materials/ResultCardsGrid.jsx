import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import MaterialRecognitionCard from './MaterialRecognitionCard';
import DefectDetectionCard from './DefectDetectionCard';
import AiQualityAdvisorCard from './AiQualityAdvisorCard';

const ResultCard = ({ title, icon, children, ctaText, ctaAction }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {children}
        {ctaText && ctaAction && (
          <Button onClick={ctaAction} size="sm" className="mt-4 w-full">
            {ctaText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};


const ResultCardsGrid = ({ mediaUrls, spec, project, onCategoryChange }) => {
    const { toast } = useToast();
    const handleAnalyze = () => {
        if (!spec || !mediaUrls || mediaUrls.length === 0) {
            toast({
                title: "Cannot Analyze",
                description: "Please upload media and select a material specification first.",
                variant: "destructive"
            });
            return;
        }
        toast({
            title: "🚧 Feature Not Implemented",
            description: "The AI analysis for materials is coming soon! You can request it in your next prompt.",
        });
    };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MaterialRecognitionCard mediaUrls={mediaUrls} project={project} />
        <DefectDetectionCard mediaUrls={mediaUrls} project={project} />
        <AiQualityAdvisorCard project={project} onCategoryChange={onCategoryChange} />
        <ResultCard 
            title="Technical Spec Match"
            icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
            ctaText="Analyze Now"
            ctaAction={handleAnalyze}
        >
            <div className="text-2xl font-bold text-yellow-600">Warning</div>
            <p className="text-xs text-muted-foreground">Color/texture analysis suggests a possible deviation from specs.</p>
        </ResultCard>
    </div>
  );
};

export default ResultCardsGrid;