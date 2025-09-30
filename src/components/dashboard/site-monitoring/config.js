import { CheckCircle, AlertTriangle, Clock, Camera, Video, Link as LinkIcon } from 'lucide-react';

export const statusConfig = {
  'Approved': { icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  'Pending Review': { icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  'Flagged': { icon: AlertTriangle, color: 'bg-red-100 text-red-800' },
};

export const mediaTypeConfig = {
  'Photo': { icon: Camera },
  'Video': { icon: Video },
  'WhatsApp Link': { icon: LinkIcon },
};