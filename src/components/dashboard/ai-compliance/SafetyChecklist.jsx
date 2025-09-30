import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { ShieldCheck, ListChecks, Upload, Loader2, CheckCircle, XCircle, AlertTriangle, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useDropzone } from 'react-dropzone';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/lib/customSupabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const ChecklistItem = ({ item }) => (
    <motion.li
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start space-x-3"
    >
        {item.is_pass ? (
            <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
        ) : (
            <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
        )}
        <div className="flex-1">
            <p className="font-medium">{item.check_item}</p>
            <p className="text-sm text-muted-foreground">{item.details}</p>
            <p className="text-xs text-muted-foreground">Confidence: {(item.confidence * 100).toFixed(0)}%</p>
        </div>
    </motion.li>
);

const SafetyChecklist = () => {
    const { toast } = useToast();
    const { selectedProject } = useProject();
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [results, setResults] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        })));
        setResults(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 5,
    });

    const handleEvaluate = async () => {
        if (!selectedProject) {
            toast({ title: "No Project Selected", description: "Please select a project first.", variant: "destructive" });
            return;
        }
        if (files.length === 0) {
            toast({ title: "No Photos Uploaded", description: "Please upload site photos to evaluate.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setResults(null);
        setUploadProgress(0);

        try {
            const uploadedUrls = [];
            for (const file of files) {
                const filePath = `${selectedProject.id}/${uuidv4()}-${file.name}`;
                const { error: uploadError } = await supabase.storage.from('site_media').upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    onUploadProgress: (event) => {
                        setUploadProgress((event.loaded / event.total) * 100);
                    }
                });
                if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
                
                const { data: { publicUrl } } = supabase.storage.from('site_media').getPublicUrl(filePath);
                uploadedUrls.push(publicUrl);
            }
            
            setUploadProgress(100);

            const { data, error: functionError } = await supabase.functions.invoke('safety-check', {
                body: { project_id: selectedProject.id, media_urls: uploadedUrls }
            });

            if (functionError) throw new Error(`AI Evaluation Error: ${functionError.message}`);
            
            setResults(data);
            toast({
                title: "Safety Evaluation Complete!",
                description: `${data.results.length} checks performed. ${data.issues_created} issues logged.`
            });

        } catch (err) {
            toast({ title: "Evaluation Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const removeFile = (fileName) => {
        setFiles(files.filter(file => file.name !== fileName));
    };

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    AI Safety Checklist
                </CardTitle>
                <CardDescription>
                    Upload site photos and let the AI scan for common safety hazards.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                    <input {...getInputProps()} />
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    {isDragActive ? (
                        <p>Drop the photos here...</p>
                    ) : (
                        <p>Drag & drop site photos here, or click to select files (max 5)</p>
                    )}
                </div>
                
                {files.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {files.map(file => (
                            <div key={file.name} className="relative group">
                                <img src={file.preview} alt={file.name} className="h-24 w-full object-cover rounded-md" />
                                <button onClick={() => removeFile(file.name)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                <AnimatePresence>
                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                            <p className="text-sm font-medium text-center">{uploadProgress < 100 ? `Uploading...` : 'Evaluating safety...'}</p>
                            <Progress value={uploadProgress} className="w-full" />
                        </motion.div>
                    )}
                    {results && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                             <h3 className="font-semibold text-lg">Evaluation Results</h3>
                             <ul className="space-y-3">
                                 {results.results.map(item => <ChecklistItem key={item.id} item={item} />)}
                             </ul>
                             {results.issues_created > 0 && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start space-x-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0"/>
                                    <p className="text-sm text-yellow-800">
                                        {results.issues_created} high-priority safety task{results.issues_created > 1 ? 's have' : ' has'} been automatically added to your project's To-Do list for immediate attention.
                                    </p>
                                </div>
                             )}
                        </motion.div>
                    )}
                     {!isLoading && !results && files.length === 0 && (
                         <div className="flex flex-col items-center justify-center text-center p-6 min-h-[150px] space-y-4">
                            <FileImage className="h-12 w-12 text-muted-foreground" />
                             <p className="text-sm text-muted-foreground">Upload photos to begin your AI safety analysis.</p>
                        </div>
                    )}
                </AnimatePresence>

            </CardContent>
            <CardFooter>
                 <Button onClick={handleEvaluate} disabled={isLoading || files.length === 0} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Analyzing...' : 'Evaluate Safety'}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default SafetyChecklist;