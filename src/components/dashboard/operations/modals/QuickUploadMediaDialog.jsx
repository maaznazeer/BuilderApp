import React, { useState, useCallback } from 'react';
    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import * as z from 'zod';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Loader2, Upload } from 'lucide-react';
    import { useProject } from '@/contexts/ProjectContext';
    import { useDropzone } from 'react-dropzone';
    import { v4 as uuidv4 } from 'uuid';

    const uploadSchema = z.object({
      project_id: z.string().uuid({ message: 'Please select a project.' }),
    });

    const QuickUploadMediaDialog = ({ isOpen, onOpenChange, onSuccess }) => {
      const { user } = useAuth();
      const { projects } = useProject();
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [files, setFiles] = useState([]);

      const form = useForm({ resolver: zodResolver(uploadSchema) });

      const onDrop = useCallback((acceptedFiles) => {
        setFiles(prev => [...prev, ...acceptedFiles.slice(0, 5 - prev.length)]);
      }, []);

      const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png'], 'video/*': ['.mp4', '.mov'] },
        maxSize: 25 * 1024 * 1024,
        maxFiles: 5,
      });

      const onSubmit = async (values) => {
        if (files.length === 0) {
          return;
        }
        setIsSubmitting(true);
        try {
          for (const file of files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `${values.project_id}/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('site_media').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('site_media').getPublicUrl(filePath);
            await supabase.from('media').insert({ project_id: values.project_id, file_url: urlData.publicUrl, type: file.type, uploaded_by: user.id });
          }
          form.reset();
          setFiles([]);
          onSuccess(`${files.length} file(s) uploaded.`);
        } catch (error) {
          console.error("Upload failed:", error);
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quick Upload Media</DialogTitle>
              <DialogDescription>Upload images or videos to a project.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField control={form.control} name="project_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger></FormControl>
                      <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormItem>
                  <FormLabel>Files</FormLabel>
                  <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}>
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground"/>
                    <p className="mt-2 text-sm text-muted-foreground">Drag & drop up to 5 files here.</p>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-2 space-y-1">{files.map((f, i) => <div key={i} className="text-sm text-muted-foreground">{f.name}</div>)}</div>
                  )}
                </FormItem>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting || files.length === 0}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Upload
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      );
    };

    export default QuickUploadMediaDialog;