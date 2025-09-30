import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, File, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const UploadBar = ({ projectId, onUploadComplete, tag }) => {
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const onDrop = useCallback((acceptedFiles) => {
        const newFiles = acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            id: uuidv4()
        }));
        setFiles(prev => [...prev, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'video/mp4': [],
            'video/quicktime': []
        }
    });

    const handleUpload = async () => {
        if (!projectId) {
            toast({
                title: "No Project Selected",
                description: "Please select a project before uploading files.",
                variant: "destructive",
            });
            return;
        }

        if (files.length === 0) {
            toast({
                title: "No Files Selected",
                description: "Please select files to upload.",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);

        const uploadPromises = files.map(file => {
            const pathSegments = [projectId];
            if (tag) pathSegments.push(tag);
            pathSegments.push(`${uuidv4()}-${file.name}`);
            const filePath = pathSegments.join('/');

            return supabase.storage
                .from('site_media')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type,
                })
                .then(({ data, error }) => {
                    if (error) throw error;
                    
                    setUploadProgress(prev => ({ ...prev, [file.id]: 100 }));
                    
                    const { data: { publicUrl } } = supabase.storage.from('site_media').getPublicUrl(filePath);

                    return { ...data, fileId: file.id, publicUrl };
                })
                .catch(error => {
                    console.error(`Error uploading ${file.name}:`, error);
                    setUploadProgress(prev => ({ ...prev, [file.id]: 'error' }));
                    return { error, fileId: file.id };
                });
        });

        const results = await Promise.all(uploadPromises);

        setIsUploading(false);
        

        const successfulUploads = results.filter(r => !r.error);
        const failedUploads = results.filter(r => r.error);
        const successfulUrls = successfulUploads.map(r => r.publicUrl);

        if (successfulUploads.length > 0) {
            toast({
                title: "Upload Complete",
                description: `${successfulUploads.length} file(s) uploaded successfully. Ready for analysis.`,
                variant: "success",
            });
            onUploadComplete(successfulUrls);
        }
        if (failedUploads.length > 0) {
            toast({
                title: "Upload Failed",
                description: `${failedUploads.length} file(s) failed to upload.`,
                variant: "destructive",
            });
        }
        setFiles([]);
        setUploadProgress({});
    };
    
    const removeFile = (fileId) => {
        setFiles(files.filter(file => file.id !== fileId));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UploadCloud className="h-5 w-5" />
                    1. Upload Media
                </CardTitle>
                <CardDescription>Drop photos or videos here, or click to select files. Media must be uploaded before analysis can begin.</CardDescription>
            </CardHeader>
            <CardContent>
                <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/50'}`}>
                    <input {...getInputProps()} />
                    <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
                {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {files.map(file => (
                            <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                <div className="flex items-center gap-3">
                                    <File className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isUploading && uploadProgress[file.id] !== undefined && uploadProgress[file.id] !== 'error' && (
                                        <div className="w-24">
                                            <Progress value={uploadProgress[file.id]} />
                                        </div>
                                    )}
                                    {isUploading && !uploadProgress[file.id] && <Loader2 className="h-5 w-5 animate-spin" />}
                                    <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)} disabled={isUploading}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter>
                 <Button onClick={handleUpload} disabled={isUploading || files.length === 0}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload {files.length} File(s)
                </Button>
            </CardFooter>
        </Card>
    );
};

export default UploadBar;