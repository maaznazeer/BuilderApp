import React, { useState, useEffect, useCallback, useRef } from 'react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Card, CardContent } from '@/components/ui/card';
    import { Skeleton } from '@/components/ui/skeleton';
    import { format, isToday, isYesterday } from 'date-fns';
    import { Send, MessageSquare, PlusCircle, Loader2, Users, Lock } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';
    import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
      DialogTrigger,
    } from '@/components/ui/dialog';
    import { usePlan } from '@/hooks/usePlan.js';

    const CreateChatDialog = ({ projectId, onChatCreated }) => {
        const [title, setTitle] = useState('');
        const [loading, setLoading] = useState(false);
        const [isOpen, setIsOpen] = useState(false);
        const { toast } = useToast();

        const handleCreateChat = async () => {
            if (!title.trim()) {
                toast({ variant: 'destructive', title: 'Title is required' });
                return;
            }
            setLoading(true);
            const { data, error } = await supabase
                .from('chats')
                .insert({ project_id: projectId, title: title.trim() })
                .select('id, title, project_id, created_at')
                .single();
            
            setLoading(false);
            if (error) {
                toast({ variant: 'destructive', title: 'Error creating chat', description: error.message });
            } else {
                toast({ title: 'Chat created!', description: `Channel "${data.title}" is now available.` });
                onChatCreated(data);
                setIsOpen(false);
                setTitle('');
            }
        };

        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                        <PlusCircle className="mr-2 h-4 w-4" /> New Channel
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Chat Channel</DialogTitle>
                        <DialogDescription>Start a new conversation topic for this project.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input 
                            placeholder="e.g., Electrical Planning" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateChat} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    const CommunicationTab = ({ project }) => {
        const { user } = useAuth();
        const { toast } = useToast();
        const navigate = useNavigate();
        const { hasFeature } = usePlan();
        const [chats, setChats] = useState([]);
        const [activeChat, setActiveChat] = useState(null);
        const [messages, setMessages] = useState([]);
        const [newMessage, setNewMessage] = useState('');
        const [loading, setLoading] = useState(true);
        const [sending, setSending] = useState(false);
        const messagesEndRef = useRef(null);

        const isChatEnabled = hasFeature('chat');

        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        };

        useEffect(scrollToBottom, [messages]);

        const fetchChats = useCallback(async () => {
            if (!project?.id || !isChatEnabled) { setLoading(false); return; }
            setLoading(true);
            const { data, error } = await supabase
                .from('chats')
                .select('id, title, project_id, created_at')
                .eq('project_id', project.id)
                .order('created_at', { ascending: true });

            if (error) {
                toast({ variant: 'destructive', title: 'Error fetching chats', description: error.message });
            } else {
                if (data.length === 0) {
                    const { data: newChat, error: createError } = await supabase
                        .from('chats')
                        .insert({ project_id: project.id, title: 'General' })
                        .select('id, title, project_id, created_at')
                        .single();
                    if (createError) {
                        toast({ variant: 'destructive', title: 'Error creating default chat', description: createError.message });
                    } else {
                        setChats([newChat]);
                        setActiveChat(newChat);
                    }
                } else {
                    setChats(data);
                    if (!activeChat) {
                        setActiveChat(data[0]);
                    }
                }
            }
            setLoading(false);
        }, [project?.id, toast, activeChat, isChatEnabled]);

        useEffect(() => {
            fetchChats();
        }, [fetchChats]);

        const fetchMessages = useCallback(async () => {
            if (!activeChat?.id || !isChatEnabled) return;
            const { data, error } = await supabase
                .from('v_messages_client')
                .select('message_id:id, chat_id, sender_id, content, created_at, sender:profiles(full_name, avatar_url)')
                .eq('chat_id', activeChat.id)
                .order('created_at', { ascending: true });

            if (error) {
                toast({ variant: 'destructive', title: 'Error fetching messages', description: error.message });
            } else {
                setMessages(data);
            }
        }, [activeChat?.id, toast, isChatEnabled]);

        useEffect(() => {
            if (!isChatEnabled) return;
            
            fetchMessages();

            const channel = supabase
                .channel(`chat-${activeChat?.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${activeChat?.id}`
                }, async (payload) => {
                     const { data: newMessageData, error } = await supabase
                        .from('v_messages_client')
                        .select('message_id:id, chat_id, sender_id, content, created_at, sender:profiles(full_name, avatar_url)')
                        .eq('message_id', payload.new.id)
                        .single();

                    if (!error && newMessageData) {
                         setMessages(existingMessages => [...existingMessages, newMessageData]);
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }, [activeChat, fetchMessages, isChatEnabled]);

        const handleSendMessage = async (e) => {
            e.preventDefault();
            if (!newMessage.trim() || !user || !activeChat) return;

            setSending(true);
            const { error } = await supabase.from('messages').insert({
                chat_id: activeChat.id,
                sender_id: user.id,
                content: newMessage.trim(),
            });
            setSending(false);

            if (error) {
                toast({ variant: 'destructive', title: 'Error sending message', description: error.message });
            } else {
                setNewMessage('');
            }
        };
        
        const formatMessageTimestamp = (timestamp) => {
            const date = new Date(timestamp);
            if (isToday(date)) return format(date, 'p');
            if (isYesterday(date)) return `Yesterday ${format(date, 'p')}`;
            return format(date, 'MMM d, p');
        };

        if (!isChatEnabled) {
            return (
                 <Card className="h-[75vh] flex flex-col items-center justify-center text-center p-8">
                    <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold">Real-time Chat is a Premium Feature</h2>
                    <p className="text-muted-foreground max-w-md mt-2 mb-6">
                        Upgrade your plan to unlock instant messaging with your project team, right here in the app.
                    </p>
                    <Button onClick={() => navigate('/pricing')}>View Upgrade Options</Button>
                </Card>
            );
        }

        if (loading) {
            return (
                <div className="flex h-[75vh]">
                    <div className="w-1/4 border-r p-4 space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="w-3/4 flex flex-col p-4">
                        <div className="flex-grow space-y-4">
                            <Skeleton className="h-12 w-1/2" />
                            <Skeleton className="h-12 w-1/2 ml-auto" />
                            <Skeleton className="h-12 w-1/2" />
                        </div>
                        <Skeleton className="h-10 w-full mt-4" />
                    </div>
                </div>
            );
        }

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="h-[75vh] flex overflow-hidden">
                    <div className="w-1/3 lg:w-1/4 border-r flex flex-col">
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-semibold flex items-center"><Users className="mr-2 h-5 w-5"/> Channels</h2>
                        </div>
                        <div className="flex-grow overflow-y-auto p-2 space-y-1">
                            {chats.map(chat => (
                                <button
                                    key={chat.id}
                                    onClick={() => setActiveChat(chat)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${activeChat?.id === chat.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted'}`}
                                >
                                    # {chat.title}
                                </button>
                            ))}
                        </div>
                        <div className="p-2 border-t">
                            <CreateChatDialog projectId={project.id} onChatCreated={(newChat) => setChats(c => [...c, newChat])} />
                        </div>
                    </div>
                    <div className="w-2/3 lg:w-3/4 flex flex-col bg-muted/30">
                        {activeChat ? (
                            <>
                                <div className="p-4 border-b bg-background">
                                    <h3 className="font-bold text-xl"># {activeChat.title}</h3>
                                </div>
                                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                                    {messages.map(msg => (
                                        <div key={msg.id} className={`flex items-end gap-3 ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                                            {msg.sender_id !== user.id && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={msg.sender?.avatar_url} />
                                                    <AvatarFallback>{msg.sender?.full_name?.charAt(0) || '?'}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div>
                                                {msg.sender_id !== user.id && <p className="text-xs text-muted-foreground mb-1">{msg.sender?.full_name}</p>}
                                                <div className={`max-w-md p-3 rounded-xl ${msg.sender_id === user.id ? 'bg-primary text-primary-foreground' : 'bg-card shadow-sm'}`}>
                                                    <p className="text-sm">{msg.content}</p>
                                                </div>
                                                <p className={`text-xs text-muted-foreground mt-1 ${msg.sender_id === user.id ? 'text-right' : 'text-left'}`}>
                                                    {formatMessageTimestamp(msg.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="p-4 border-t bg-background">
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                        <Input
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            autoComplete="off"
                                            disabled={sending}
                                        />
                                        <Button type="submit" disabled={!newMessage.trim() || sending}>
                                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        </Button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                                <MessageSquare className="h-16 w-16 mb-4" />
                                <h3 className="text-xl font-semibold">Select a channel</h3>
                                <p>Choose a channel from the left to start chatting.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>
        );
    };

    export default CommunicationTab;