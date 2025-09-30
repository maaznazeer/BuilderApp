import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, Camera, Video as VideoIcon, Link as LinkIcon } from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useToast } from '@/components/ui/use-toast';

const statusConfig = {
    'Approved': { color: 'bg-green-100 text-green-800 border-green-200', icon: () => '✅' },
    'Pending Review': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: () => '⏳' },
    'Flagged': { color: 'bg-red-100 text-red-800 border-red-200', icon: () => '🚩' },
};

const MediaViewer = ({ media, open, onOpenChange, onUpdateStatus, onAddComment }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();

  if (!media) return null;

  const status = statusConfig[media.status] || statusConfig['Pending Review'];
  const isVideo = media.type.startsWith('video');

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(media.id, newComment);
      setNewComment('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 relative h-96 md:h-[80vh] bg-black flex items-center justify-center">
            {isVideo ? (
                <video src={media.file_url} controls autoPlay className="max-h-full max-w-full" />
            ) : (
                <img src={media.file_url} alt={media.notes || 'Project media'} className="max-h-full max-w-full object-contain" />
            )}
          </div>
          <div className="p-6 flex flex-col h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{media.site_location || 'Media Details'}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4 flex-grow overflow-y-auto pr-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Notes</p>
                <p className="text-gray-800">{media.notes || 'No notes provided.'}</p>
              </div>
              <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <Badge variant="outline" className={`${status.color}`}>
                      {status.icon()} {media.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Uploaded On</p>
                    <p className="text-gray-800">{format(parseISO(media.created_at), 'PPP')}</p>
                  </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Uploaded By</p>
                <p className="text-gray-800">{media.uploader_full_name || 'Unknown'}</p>
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Comments</h4>
                <div className="space-y-3">
                  {(media.comments || []).map((comment, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{comment.author?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{comment.author} <span className="text-xs text-gray-400 ml-1">{formatDistanceToNow(parseISO(comment.timestamp), { addSuffix: true })}</span></p>
                        <p className="text-sm text-gray-700 bg-gray-100 p-2 rounded-lg">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                  {(media.comments || []).length === 0 && <p className="text-xs text-gray-500">No comments yet.</p>}
                </div>
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="relative">
                <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." className="pr-20" />
                <div className="absolute right-2 top-2 flex items-center">
                  <Button size="icon" variant="ghost" onClick={() => toast({ title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" })}><Mic className="w-4 h-4" /></Button>
                  <Button size="sm" onClick={handleAddComment}>Send</Button>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Select onValueChange={(value) => onUpdateStatus(media.id, value)} defaultValue={media.status}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Approved">Approve</SelectItem>
                    <SelectItem value="Pending Review">Mark as Pending</SelectItem>
                    <SelectItem value="Flagged">Flag for Review</SelectItem>
                  </SelectContent>
                </Select>
              </DialogFooter>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaViewer;