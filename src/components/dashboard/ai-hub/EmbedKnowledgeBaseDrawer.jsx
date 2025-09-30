import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, UploadCloud, File as FileIcon, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from 'react-query';
import { useAiHub } from '@/hooks/useAiHub';

const acceptedFileTypes = {
    'text/plain': ['.txt'],
    'text/markdown': ['.md'],
    'application/pdf': ['.pdf'],
};

const FilePicker = ({ onFileChange, file, setFile }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const { toast } = useToast();

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);
            setUploading(true);
            setUploadError(null);

            try {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${uuidv4()}.${fileExt}`;
                const filePath = `kb-sources/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('project-media')
                    .upload(filePath, selectedFile);

                if (uploadError) throw uploadError;
                
                const { data } = supabase.storage
                    .from('project-media')
                    .getPublicUrl(filePath);

                if (!data.publicUrl) throw new Error("Could not get public URL for the uploaded file.");

                onFileChange(data.publicUrl);
                toast({ title: 'File uploaded successfully!' });
            } catch (error) {
                setUploadError(`Upload failed: ${error.message}`);
                onFileChange(null);
                toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
            } finally {
                setUploading(false);
            }
        }
    }, [onFileChange, toast, setFile]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedFileTypes,
        multiple: false,
    });

    const removeFile = () => {
        setFile(null);
        onFileChange(null);
    };

    return (
        <div className="space-y-2">
            {!file ? (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600 hover:border-primary'}`}
                >
                    <input {...getInputProps()} />
                    {uploading ? (
                        <div className="flex flex-col items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="mt-2 text-sm">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center">
                            <UploadCloud className="h-8 w-8 text-gray-500" />
                            <p className="mt-2 text-sm">
                                {isDragActive ? 'Drop the file here ...' : "Drag 'n' drop a file here, or click to select"}
                            </p>
                            <p className="text-xs text-gray-400">.txt, .md, .pdf</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-between p-2 border rounded-md bg-muted">
                    <div className="flex items-center gap-2">
                        <FileIcon className="h-5 w-5 text-gray-500" />
                        <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={removeFile} className="h-6 w-6">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
             {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
        </div>
    );
};

const embedSchema = z.object({
  src_title: z.string().min(3, "Title must be at least 3 characters long."),
  src_slug: z.string().min(3, "Slug must be at least 3 characters long.").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  src_lang: z.string().default('en'),
  src_url: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  src_text: z.string().optional(),
  src_file_url: z.string().optional().nullable(),
}).refine(data => data.src_text || data.src_file_url, {
    message: "You must provide either a file or some text content.",
    path: ["src_file_url"],
});

const EmbedKnowledgeBaseDrawer = ({ open, onOpenChange }) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [file, setFile] = useState(null);
    const { embedContent, isEmbedding } = useAiHub();

    const form = useForm({
        resolver: zodResolver(embedSchema),
        defaultValues: {
            src_title: '',
            src_slug: '',
            src_lang: 'en',
            src_url: '',
            src_text: '',
            src_file_url: null,
        },
    });

    const handleOpenChange = (isOpen) => {
        if (!isOpen) {
            form.reset();
            setFile(null);
        }
        onOpenChange(isOpen);
    };

    const onSubmit = async (values) => {
        const result = await embedContent({
            source: {
                title: values.src_title,
                slug: values.src_slug,
                lang: values.src_lang,
                url: values.src_url || null,
            },
            text: values.src_text || null,
            file_url: values.src_file_url || null,
        });

        if (result) {
            toast({
                title: 'Success!',
                description: `${result.inserted_count} document chunks embedded into knowledge base.`,
            });
            queryClient.invalidateQueries('kbSources');
            queryClient.invalidateQueries('kbStats');
            handleOpenChange(false);
        }
    };
    
    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Embed to Knowledge Base</SheetTitle>
                    <SheetDescription>
                        Add a new document, text, or URL to the AI's knowledge base.
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                        <FormField
                            control={form.control}
                            name="src_title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Guide to Concrete Mixing" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="src_slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., concrete-mixing-guide" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="src_lang"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Language</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a language" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="fr">French</SelectItem>
                                            <SelectItem value="local">Local</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="src_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Source URL (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com/doc.pdf" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="src_file_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>File (Optional)</FormLabel>
                                     <FormControl>
                                        <FilePicker onFileChange={field.onChange} file={file} setFile={setFile} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="src_text"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Text Content (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Or paste text content directly here..."
                                            rows={8}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </SheetClose>
                            <Button type="submit" disabled={isEmbedding}>
                                {isEmbedding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Embed
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
};

export default EmbedKnowledgeBaseDrawer;