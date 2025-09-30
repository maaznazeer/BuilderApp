import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Languages, ArrowRightLeft, Mic, Volume2, Loader2, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/customSupabaseClient';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';

const Translator = () => {
    const { toast } = useToast();
    const { selectedProject } = useProject();
    const { user } = useAuth();

    const [sourceLang, setSourceLang] = useState('en');
    const [targetLang, setTargetLang] = useState('fr');
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSwapLanguages = () => {
        const tempLang = sourceLang;
        setSourceLang(targetLang);
        setTargetLang(tempLang);
        setInputText(translatedText);
        setTranslatedText(inputText);
    };

    const handleTranslate = async () => {
        if (!inputText.trim()) {
            toast({ title: "Input is empty", description: "Please enter some text to translate.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        setTranslatedText('');
        try {
            const { data, error } = await supabase.functions.invoke('translate', {
                body: { source: sourceLang, target: targetLang, content: inputText }
            });

            if (error) throw error;

            setTranslatedText(data.translatedContent);
            toast({ title: "Translation successful!" });
        } catch (err) {
            toast({ title: "Translation failed", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostToChat = async () => {
        if (!translatedText.trim() || !selectedProject || !user) {
            toast({ title: "Cannot post message", description: "Ensure you have translated text and a project selected.", variant: "destructive" });
            return;
        }

        try {
            let { data: chat, error: chatError } = await supabase
                .from('chats')
                .select('id')
                .eq('project_id', selectedProject.id)
                .eq('title', 'General')
                .single();

            if (chatError && chatError.code !== 'PGRST116') {
                throw chatError;
            }

            if (!chat) {
                const { data: newChat, error: newChatError } = await supabase
                    .from('chats')
                    .insert({ project_id: selectedProject.id, title: 'General' })
                    .select('id')
                    .single();
                if (newChatError) throw newChatError;
                chat = newChat;
            }

            const messageContent = `(Translated from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()})\n\n**Original:**\n${inputText}\n\n**Translation:**\n${translatedText}`;
            
            const { error: messageError } = await supabase
                .from('messages')
                .insert({
                    chat_id: chat.id,
                    sender_id: user.id,
                    content: messageContent
                });

            if (messageError) throw messageError;

            toast({
                title: "Message Posted",
                description: "The translation has been posted to the project's General chat.",
            });

        } catch (err) {
            toast({ title: "Failed to post message", description: err.message, variant: "destructive" });
        }
    };

    const handleMic = () => {
        toast({
            title: "🚧 Feature in development",
            description: "Voice input isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
        });
    };
    
    const handleSpeaker = () => {
        toast({
            title: "🚧 Feature in development",
            description: "Text-to-speech isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
        });
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Languages className="h-6 w-6 text-primary" />
                    AI Translation Helper
                </CardTitle>
                <CardDescription>
                    Translate technical terms and conversations. Post results directly to your project chat.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_auto_2fr] items-center gap-2">
                    <Select value={sourceLang} onValueChange={setSourceLang}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={handleSwapLanguages}>
                        <ArrowRightLeft className="h-5 w-5" />
                    </Button>
                    <Select value={targetLang} onValueChange={setTargetLang}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                    <div className="relative">
                        <Textarea 
                            placeholder="Enter text to translate..." 
                            className="h-full resize-none" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <Button variant="ghost" size="icon" className="absolute bottom-2 right-2" onClick={handleMic}>
                            <Mic className="h-4 w-4"/>
                        </Button>
                    </div>
                    <div className="relative bg-muted/50 p-4 rounded-md border min-h-[150px]">
                        <Textarea
                            placeholder={isLoading ? "Translating..." : "Translation will appear here..."}
                            className="h-full resize-none bg-transparent border-0 focus-visible:ring-0 p-0"
                            readOnly
                            value={translatedText}
                        />
                        <Button variant="ghost" size="icon" className="absolute bottom-2 right-2" onClick={handleSpeaker}>
                            <Volume2 className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button className="w-full sm:w-auto flex-grow" onClick={handleTranslate} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Translating...' : 'Translate'}
                </Button>
                <Button 
                    variant="outline" 
                    className="w-full sm:w-auto flex-grow" 
                    onClick={handlePostToChat}
                    disabled={!translatedText.trim() || !selectedProject}
                >
                    <MessageSquarePlus className="mr-2 h-4 w-4" /> Post to Project Chat
                </Button>
            </CardFooter>
        </Card>
    );
};

export default Translator;