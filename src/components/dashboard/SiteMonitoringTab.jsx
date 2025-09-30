import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Upload, Filter, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import MediaCard from './site-monitoring/MediaCard';
import MediaViewer from './site-monitoring/MediaViewer';
import UploadMediaDialog from './site-monitoring/UploadMediaDialog';

const SiteMonitoringTab = ({ projects, updateProjects }) => {
  const [filters, setFilters] = useState({
    project: 'all',
    type: 'all',
    status: 'all',
  });
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const allMedia = useMemo(() => {
    return projects.flatMap(p => 
      (p.siteMediaUploads || []).map(m => ({ ...m, projectName: p.name, projectId: p.id }))
    ).sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));
  }, [projects]);

  const filteredMedia = useMemo(() => {
    return allMedia.filter(media => {
      const projectMatch = filters.project === 'all' || media.projectId.toString() === filters.project;
      const typeMatch = filters.type === 'all' || media.media_type === filters.type;
      const statusMatch = filters.status === 'all' || media.status === filters.status;
      return projectMatch && typeMatch && statusMatch;
    });
  }, [allMedia, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleSelectMedia = (media) => {
    setSelectedMedia(media);
    setIsViewerOpen(true);
  };

  const handleUpdateStatus = (mediaId, newStatus) => {
    const updatedProjects = projects.map(p => {
      const mediaIndex = (p.siteMediaUploads || []).findIndex(m => m.media_id === mediaId);
      if (mediaIndex > -1) {
        const updatedMedia = [...p.siteMediaUploads];
        updatedMedia[mediaIndex].status = newStatus;
        return { ...p, siteMediaUploads: updatedMedia };
      }
      return p;
    });
    updateProjects(updatedProjects);
    toast({ title: "Status Updated", description: `Media status changed to ${newStatus}.` });
    setSelectedMedia(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const handleAddComment = (mediaId, commentText) => {
    const newComment = {
      id: Date.now(),
      author: user?.full_name || 'You',
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    const updatedProjects = projects.map(p => {
      const mediaIndex = (p.siteMediaUploads || []).findIndex(m => m.media_id === mediaId);
      if (mediaIndex > -1) {
        const updatedMediaList = [...p.siteMediaUploads];
        const targetMedia = { ...updatedMediaList[mediaIndex] };
        targetMedia.comments = [...(targetMedia.comments || []), newComment];
        updatedMediaList[mediaIndex] = targetMedia;
        return { ...p, siteMediaUploads: updatedMediaList };
      }
      return p;
    });
    updateProjects(updatedProjects);
    setSelectedMedia(prev => prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : null);
  };

  const handleUpload = (formData) => {
    const updatedProjects = projects.map(p => {
      if (p.id.toString() === formData.project_id) {
        const newMedia = {
          media_id: Date.now(),
          uploader_id: 1, // Assuming current user
          site_location: formData.site_location,
          media_type: formData.media_type,
          media_file_or_link: formData.media_file_or_link,
          notes: formData.notes,
          upload_date: new Date().toISOString(),
          week_number: 1, // Placeholder
          status: 'Pending Review',
          comments: [],
        };
        const siteMediaUploads = [...(p.siteMediaUploads || []), newMedia];
        return { ...p, siteMediaUploads };
      }
      return p;
    });
    updateProjects(updatedProjects);
    toast({ title: "Media Uploaded!", description: "Your new media has been added for review." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Media Logs</h2>
          <p className="text-gray-500">Visual timeline of your project's progress.</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Media
        </Button>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-sm border flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-semibold">Filters:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow">
          <Select value={filters.project} onValueChange={(v) => handleFilterChange('project', v)}>
            <SelectTrigger><SelectValue placeholder="All Projects" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}>
            <SelectTrigger><SelectValue placeholder="All Media Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Media Types</SelectItem>
              <SelectItem value="Photo">Photo</SelectItem>
              <SelectItem value="Video">Video</SelectItem>
              <SelectItem value="WhatsApp Link">WhatsApp Link</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
            <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Pending Review">Pending Review</SelectItem>
              <SelectItem value="Flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedia.map(media => (
            <MediaCard key={media.media_id} media={media} onSelect={handleSelectMedia} />
          ))}
        </div>
      </AnimatePresence>

      {filteredMedia.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Camera className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No media found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or upload new media.</p>
        </div>
      )}

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
        projects={projects}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default SiteMonitoringTab;