import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot, User, FileText, Link as LinkIcon, Loader2, ChevronRight, Languages } from 'lucide-react';
import { useAiHub } from '@/hooks/useAiHub';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LiveAssistant = ({ projectId }) => {
  const [question, setQuestion] = useState('');
  const [liveData, setLiveData] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [askLang, setAskLang] = useState('en');
  const { askAssistant, isLoading } = useAiHub();
  const { toast } = useToast();
  const { t } = useTranslation('custom');

  const placeholders = {
    en: "Ask about project risks, material specs, or budget status...",
    fr: "Posez des questions sur les risques du projet, les spécifications des matériaux ou l'état du budget...",
    sw: "Uliza kuhusu hatari za mradi, vipimo vya vifaa, au hali ya bajeti..."
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      toast({
        title: "Question is empty",
        description: "Please enter a question to ask the assistant.",
        variant: "destructive",
      });
      return;
    }
    const result = await askAssistant({ question, project_id: projectId, live_data: liveData, lang: askLang });
    if (result) {
      setLastAnswer(result);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <Card className="w-full h-full flex flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
          <Bot className="w-6 h-6 text-primary" />
          <span>Live Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <div className="relative">
          <Textarea
            placeholder={placeholders[askLang]}
            className="w-full pr-24 resize-none bg-white dark:bg-gray-800"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            className="absolute top-1/2 right-3 -translate-y-1/2"
            onClick={handleAsk}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span className="ml-2 hidden sm:inline">Ask</span>
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="live-data" checked={liveData} onCheckedChange={setLiveData} disabled={!projectId} />
            <Label htmlFor="live-data" className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Use Live Project Data
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="language-select" className="text-sm font-medium text-gray-600 dark:text-gray-400">
              <Languages className="w-4 h-4 inline-block mr-1" />
              {t('ai_hub.language')}
            </Label>
            <Select value={askLang} onValueChange={setAskLang}>
              <SelectTrigger id="language-select" className="w-[120px] bg-white dark:bg-gray-800">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="sw">{t('ai_hub.local')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <AnimatePresence>
          {lastAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-grow rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 overflow-y-auto"
            >
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{lastAnswer.answer}</ReactMarkdown>
              </div>
              {lastAnswer.citations && lastAnswer.citations.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {lastAnswer.citations.map((cite) => (
                      <Badge key={cite.chunk_id} variant="secondary" className="font-normal text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                        <FileText className="w-3 h-3 mr-1.5" />
                        {cite.title || `Source ${cite.n}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {lastAnswer.usage && (
                <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-muted-foreground">Tokens: {lastAnswer.usage.total_tokens || 0}</span>
                  <span className="text-muted-foreground">Cost: ${lastAnswer.usage.cost_usd?.toFixed(6) || '0.000000'}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default LiveAssistant;