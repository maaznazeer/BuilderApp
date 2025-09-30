import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

const UploadMediaDialog = ({ open, onOpenChange, project, onUpload }) => {
  const [formData, setFormData] = useState({ site_location: '', notes: '' });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles].slice(0, 5)); // Limit to 5 files
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: { 'image/*': ['.jpeg', '.png', '.gif'], 'video/*': ['.mp4', '.mov', '.avi'] },
      maxSize: 25 * 1024 * 1024,
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast({ title: 'No files selected', description: 'Please select at least one file to upload.', variant: 'destructive' });
      return;
    }
    if (!project?.id) {
        toast({ title: 'No project selected', description: 'Cannot upload without a project context.', variant: 'destructive' });
        return;
    }

    setUploading(true);

    const uploadPromises = files.map(file => onUpload(formData, file));
    await Promise.all(uploadPromises);

    setUploading(false);
    setFiles([]);
    setFormData({ site_location: '', notes: '' });
    onOpenChange(false);
  };
  
  const removeFile = (index) => {
    setFiles(currentFiles => currentFiles.filter((_, i) => i !== index));
  }

  const handleOpenChange = (isOpen) => {
    if(!isOpen) {
        setFiles([]);
        setFormData({ site_location: '', notes: '' });
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload New Media to "{project?.name}"</DialogTitle>
          <DialogDescription>Add new photos or videos to this project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpload} className="space-y-4 pt-4">
          <div {...getRootProps()} className={`mt-4 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}>
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground"/>
              <p className="mt-2 text-sm text-muted-foreground">Drag & drop files here, or click to select.</p>
              <p className="text-xs text-muted-foreground">Images and videos up to 25MB each.</p>
          </div>

          {files.length > 0 && (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                  {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                          <span className="truncate">{file.name}</span>
                          <Button variant="ghost" size="icon" type="button" onClick={() => removeFile(i)}>
                              <X className="h-4 w-4"/>
                          </Button>
                      </div>
                  ))}
              </div>
          )}

          <div>
            <label htmlFor="site_location" className="block text-sm font-medium text-gray-700">Site Location / Tag</label>
            <Input id="site_location" value={formData.site_location} onChange={e => setFormData(d => ({ ...d, site_location: e.target.value }))} placeholder="e.g., Kitchen, 2nd Floor" />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
            <Textarea id="notes" value={formData.notes} onChange={e => setFormData(d => ({ ...d, notes: e.target.value }))} placeholder="Add a description for all uploaded media..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={uploading || files.length === 0}>
                {uploading ? `Uploading ${files.length} files...` : `Upload ${files.length} File(s)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadMediaDialog;