import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Upload, Image as ImageIcon, Video, Calendar as CalendarIcon, Filter, X, Trash2, Zap } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { usePlan } from '@/hooks/usePlan';
import { Link } from 'react-router-dom';
import UploadMediaDialog from '@/components/dashboard/site-monitoring/UploadMediaDialog';
import MediaViewer from '@/components/dashboard/site-monitoring/MediaViewer';
import { useProject } from '@/contexts/ProjectContext';

const MediaCard = ({ media, onSelect, onDelete }) => {
  const isVideo = media.type.startsWith('video');
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="relative group overflow-hidden rounded-lg shadow-md bg-card cursor-pointer"
    >
      <div onClick={() => onSelect(media)} className="w-full h-48">
        {isVideo ? (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <Video className="w-12 h-12 text-white/80" />
          </div>
        ) : (
          <img src={media.file_url} alt={media.notes || 'Project media'} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
          <p className="text-white text-xs truncate">{formatDistanceToNow(parseISO(media.created_at), { addSuffix: true })}</p>
        </div>
      </div>
       <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onDelete(media.id, media.file_url)}>
         <Trash2 className="h-4 w-4" />
       </Button>
    </motion.div>
  );
};

const MediaTab = ({ project }) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { projects } = useProject();
  const { plan, features } = usePlan();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: { from: null, to: null },
  });

  const fetchMedia = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_project_media', {
        p_project_id: project.id
      });

      if (rpcError) throw rpcError;
      setMedia(data || []);
    } catch (err) {
      setError('Failed to load media. Please try again.');
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setLoading(false);
    }
  }, [project?.id, toast]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);
  
  const canUpload = true;

  const filteredMedia = useMemo(() => {
    return media.filter(item => {
      const typeMatch = filters.type === 'all' || item.type.startsWith(filters.type);
      const date = parseISO(item.created_at);
      const fromMatch = !filters.dateRange.from || date >= filters.dateRange.from;
      const toMatch = !filters.dateRange.to || date <= filters.dateRange.to;
      return typeMatch && fromMatch && toMatch;
    });
  }, [media, filters]);
  
  const handleSelectMedia = (mediaItem) => {
      setSelectedMedia(mediaItem);
      setIsViewerOpen(true);
  };

  const handleUpdateStatus = async (mediaId, newStatus) => {
    const { error } = await supabase
      .from('media')
      .update({ status: newStatus })
      .eq('id', mediaId);

    if (error) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status Updated", description: `Media status changed to ${newStatus}.` });
      fetchMedia();
      setSelectedMedia(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleAddComment = async (mediaId, commentText) => {
    const { data: currentMedia, error: fetchError } = await supabase
      .from('media')
      .select('comments')
      .eq('id', mediaId)
      .single();

    if (fetchError) {
      toast({ title: "Error fetching comments", description: fetchError.message, variant: "destructive" });
      return;
    }

    const newComment = {
      id: uuidv4(),
      author: profile?.full_name || user?.email || 'Anonymous',
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    const updatedComments = [...(currentMedia.comments || []), newComment];

    const { error: updateError } = await supabase
      .from('media')
      .update({ comments: updatedComments })
      .eq('id', mediaId);

    if (updateError) {
      toast({ title: "Error adding comment", description: updateError.message, variant: "destructive" });
    } else {
      toast({ title: "Comment Added", description: "Your comment has been added." });
      fetchMedia();
      setSelectedMedia(prev => prev ? { ...prev, comments: updatedComments } : null);
    }
  };

  const handleDeleteMedia = async (mediaId, fileUrl) => {
    if (!window.confirm('Are you sure you want to delete this media? This action cannot be undone.')) return;
    
    try {
        const filePath = new URL(fileUrl).pathname.split('/site_media/').pop();
        const { error: storageError } = await supabase.storage.from('site_media').remove([filePath]);
        if (storageError) {
            console.error("Storage error, but proceeding to delete DB record:", storageError.message);
        }

        const { error: dbError } = await supabase.from('media').delete().eq('id', mediaId);
        if (dbError) throw dbError;

        toast({ title: 'Success', description: 'Media deleted successfully.'});
        fetchMedia();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: `Failed to delete media: ${error.message}`});
    }
  };

  const handleUpload = async (formData, file) => {
    if (!user) return;
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${project.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('site_media')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from('site_media')
            .getPublicUrl(filePath);
        
        const { error: insertError } = await supabase.from('media').insert({
            project_id: project.id,
            file_url: urlData.publicUrl,
            type: file.type,
            uploaded_by: user.id,
            site_location: formData.site_location,
            notes: formData.notes,
            status: 'Pending Review',
            comments: []
        });

        if (insertError) throw insertError;
        
        toast({ title: 'Upload Complete', description: `${file.name} has been uploaded.` });
        fetchMedia();

    } catch (error) {
        toast({ variant: 'destructive', title: 'Upload Failed', description: `Could not upload ${file.name}: ${error.message}` });
    }
};

  if (loading) {
    return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
    </div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {!canUpload && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertTitle>Upload Limit Reached</AlertTitle>
          <AlertDescription>
            You've reached the upload limit for your current plan.
            <Button asChild variant="link" className="p-0 h-auto ml-1">
              <Link to="/pricing">Upgrade your plan</Link>
            </Button> to upload more files.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <Select value={filters.type} onValueChange={type => setFilters(f => ({...f, type}))}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by type..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="image">Images</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                    </SelectContent>
                </Select>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateRange?.from ? (
                                filters.dateRange.to ? (
                                    `${format(filters.dateRange.from, "LLL dd, y")} - ${format(filters.dateRange.to, "LLL dd, y")}`
                                ) : (
                                    format(filters.dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={filters.dateRange}
                            onSelect={dateRange => setFilters(f => ({...f, dateRange: dateRange || { from: null, to: null }}))}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
          <Button onClick={() => setIsUploadOpen(true)} disabled={!canUpload}><Upload className="mr-2 h-4 w-4" /> Upload Media</Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {filteredMedia.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMedia.map(item => (
                <MediaCard key={item.id} media={item} onSelect={handleSelectMedia} onDelete={handleDeleteMedia} />
            ))}
            </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Media Found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or upload new media to get started.</p>
            </div>
        )}
        </AnimatePresence>

      <MediaViewer 
        media={selectedMedia} 
        open={isViewerOpen} 
        onOpenChange={setIsViewerOpen}
        onUpdateStatus={handleUpdateStatus}
        onAddComment={handleAddComment}
      />
      <UploadMediaDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        project={project}
        onUpload={handleUpload}
      />
    </motion.div>
  );
};

export default MediaTab;