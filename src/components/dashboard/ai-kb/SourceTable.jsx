import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Trash2, RefreshCw, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const fetchSources = async () => {
    const { data, error } = await supabase
        .from('kb_sources')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching sources:', error);
        throw new Error('Failed to fetch sources. ' + error.message);
    }
    return data;
};

const SourceTable = () => {
    const queryClient = useQueryClient();
    const { data: sources, isLoading, isError, error } = useQuery('kbSources', fetchSources);
    const { toast } = useToast();

    const reEmbedMutation = useMutation(
        async (slug) => {
             toast({
                title: '🚧 Feature Not Implemented',
                description: "Re-embedding a source isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
             });
            // This is where you would call your edge function
            // const { error } = await supabase.functions.invoke('ai-assistant-reembed', { body: { slug } });
            // if (error) throw error;
        },
        {
            onSuccess: () => {
                toast({ title: 'Re-embedding started!', description: 'The source is being re-embedded in the background.' });
            },
            onError: (error) => {
                toast({ variant: 'destructive', title: 'Re-embedding Failed', description: error.message });
            },
        }
    );

    const deleteMutation = useMutation(
        async (slug) => {
             toast({
                title: '🚧 Feature Not Implemented',
                description: "Deleting a source isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
            });
            // This is where you would call your edge function
            // const { error } = await supabase.functions.invoke('ai-assistant-delete', { body: { slug } });
            // if (error) throw error;
        },
        {
            onSuccess: () => {
                toast({ title: 'Source deleted successfully!' });
                queryClient.invalidateQueries('kbSources');
                queryClient.invalidateQueries('kbStats');
            },
            onError: (error) => {
                toast({ variant: 'destructive', title: 'Deletion Failed', description: error.message });
            },
        }
    );

    const handleDelete = (slug) => {
        deleteMutation.mutate(slug);
    };

    const handleReEmbed = (slug) => {
        reEmbedMutation.mutate(slug);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Knowledge Sources</CardTitle>
                <CardDescription>
                  Documents, URLs, and text snippets your AI assistant has learned from.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                )}
                {isError && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-4">
                        <AlertCircle className="h-6 w-6 text-destructive"/>
                        <p className="text-sm text-destructive">{error.message}</p>
                    </div>
                )}
                {!isLoading && !isError && (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Language</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sources && sources.length > 0 ? sources.map((source) => (
                                    <TableRow key={source.id}>
                                        <TableCell className="font-medium">{source.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{source.slug}</Badge>
                                        </TableCell>
                                        <TableCell>{source.lang}</TableCell>
                                        <TableCell>
                                            {formatDistanceToNow(new Date(source.created_at), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleReEmbed(source.slug)}>
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                        Re-embed
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                                                <span className="text-destructive">Delete</span>
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete the source and all its data from our servers.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className={deleteMutation.isLoading ? "bg-destructive/80" : "bg-destructive"}
                                                                    onClick={() => handleDelete(source.slug)}
                                                                    disabled={deleteMutation.isLoading}
                                                                >
                                                                    {deleteMutation.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan="5" className="text-center h-24">
                                            No sources found. Embed some knowledge to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SourceTable;