import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useDropzone } from 'react-dropzone';
import { Loader2, Camera, Upload, Share2, ArrowLeft, ArrowRight, ClipboardCopy, ClipboardCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

const RenderPreview = ({ project, selectedLayout, onUpload }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [visualization, setVisualization] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const { toast } = useToast();

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length > 0) {
            setUploadedFile(acceptedFiles[0]);
            setVisualization(null);
            if (onUpload) {
                onUpload();
            }
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
        multiple: false
    });

    useEffect(() => {
        if(selectedLayout) {
            setUploadedFile(null); // Clear uploaded file if a layout is selected
            setVisualization(null); // Clear previous results
        }
    }, [selectedLayout]);

    const handleCreate3D = async () => {
        if (!project) {
            toast({ title: "Project Required", description: "Please select a project first.", variant: "destructive" });
            return;
        }
        if (!selectedLayout && !uploadedFile) {
            toast({ title: "Input Required", description: "Please select a saved layout or upload a sketch.", variant: "destructive" });
            return;
        }
        if (selectedLayout && !selectedLayout.id) {
            toast({ title: "Save Layout First", description: "Please save the selected layout before creating a 3D visualization.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setVisualization(null);
        let imageUrl = null;

        try {
            if (uploadedFile) {
                const fileName = `${project.id}/${uuidv4()}-${uploadedFile.name}`;
                const { error: uploadError } = await supabase.storage.from('project-media').upload(fileName, uploadedFile);
                if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
                
                const { data: { publicUrl } } = supabase.storage.from('project-media').getPublicUrl(fileName);
                imageUrl = publicUrl;
            }

            const { data, error } = await supabase.functions.invoke('3d-visualize', {
                body: {
                    project_id: project.id,
                    layout_id: selectedLayout?.id,
                    image_url: imageUrl,
                }
            });

            if (error) throw error;
            setVisualization(data.result);
            toast({ title: "3D Renders Created!", description: "Your design has been visualized." });

        } catch (err) {
            toast({ title: "Visualization Failed", description: err.message || "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleShare = () => {
        if (!visualization?.share_token) return;
        const link = `${window.location.origin}/share/visualization/${visualization.share_token}`;
        navigator.clipboard.writeText(link);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast({ title: "Link Copied!", description: "Shareable link is now on your clipboard." });
    };

    const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % (visualization?.render_urls?.length || 1));
    const prevImage = () => setCurrentImageIndex(prev => (prev - 1 + (visualization?.render_urls?.length || 1)) % (visualization?.render_urls?.length || 1));

    const sourceName = selectedLayout?.name || uploadedFile?.name || 'your design';
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    3D Render Preview
                </CardTitle>
                <CardDescription>{selectedLayout ? `Layout: ${selectedLayout.name}` : uploadedFile ? `File: ${uploadedFile.name}` : 'Select a layout or upload a sketch'}</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="font-semibold">AI is creating 3D renders for {sourceName}...</p>
                        <p className="text-sm text-muted-foreground">This can take up to a minute.</p>
                    </div>
                ) : visualization?.render_urls ? (
                    <div className="space-y-2">
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentImageIndex}
                                    src={visualization.render_urls[currentImageIndex]}
                                    alt={`Render view ${currentImageIndex + 1}`}
                                    className="w-full h-auto rounded-md object-cover aspect-video bg-muted"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </AnimatePresence>
                            {visualization.render_urls.length > 1 && (
                                <>
                                    <Button onClick={prevImage} variant="outline" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
                                    <Button onClick={nextImage} variant="outline" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8"><ArrowRight className="h-4 w-4" /></Button>
                                </>
                            )}
                        </div>
                        <Button variant="ghost" className="w-full" onClick={handleShare}>
                            {isCopied ? <ClipboardCheck className="mr-2 h-4 w-4 text-green-500" /> : <Share2 className="mr-2 h-4 w-4" />}
                            {isCopied ? "Copied!" : "Share to Contractor"}
                        </Button>
                    </div>
                ) : (
                    <div {...getRootProps()} className={cn(
                        "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors",
                        isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/30 hover:border-primary"
                    )}>
                        <input {...getInputProps()} />
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        {uploadedFile ? (
                             <p className="font-semibold text-primary">{uploadedFile.name}</p>
                        ) : selectedLayout ? (
                             <p className="font-semibold text-primary">Selected: {selectedLayout.name}</p>
                        ): (
                            <>
                                <p className="font-semibold">Drop a sketch here, or click to upload</p>
                                <p className="text-sm text-muted-foreground">Or, select a saved layout from the gallery above.</p>
                            </>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button className="w-full" onClick={handleCreate3D} disabled={isLoading || (!selectedLayout && !uploadedFile) || (selectedLayout && !selectedLayout.id)}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                    Create 3D Renders
                </Button>
            </CardFooter>
        </Card>
    );
};

export default RenderPreview;