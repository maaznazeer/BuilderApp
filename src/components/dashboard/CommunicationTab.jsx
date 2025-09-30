import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Video, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CommunicationTab = ({ projects, handleFeatureClick }) => {
  // Mock data for communication channels
  const channels = projects.map(p => ({
    id: p.id,
    name: `${p.name} Channel`,
    lastMessage: 'John: How is the foundation work progressing?',
    timestamp: '2 hours ago',
    unread: p.id === 1,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">Channels</h2>
        <div className="space-y-2">
          {channels.map(channel => (
            <div
              key={channel.id}
              className={`p-3 rounded-lg cursor-pointer ${channel.unread ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => handleFeatureClick('Open Channel')}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-800">{channel.name}</p>
                {channel.unread && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
              </div>
              <p className="text-sm text-gray-600 truncate">{channel.lastMessage}</p>
              <p className="text-xs text-gray-400 text-right">{channel.timestamp}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-lg">Family Home - Lagos Channel</h3>
          <p className="text-sm text-gray-500">John, Mary, David, and You</p>
        </div>
        <div className="flex-grow p-6 space-y-6 overflow-y-auto">
          {/* Mock chat messages */}
          <div className="flex items-start space-x-3">
            <img  className="w-10 h-10 rounded-full" alt="Profile of John" src="https://images.unsplash.com/photo-1532586539-30f58a60677a" />
            <div>
              <p className="font-semibold text-sm">John <span className="text-xs text-gray-400 ml-2">10:30 AM</span></p>
              <div className="bg-gray-100 p-3 rounded-lg mt-1">
                <p>How is the foundation work progressing?</p>
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3 flex-row-reverse space-x-reverse">
            <img  className="w-10 h-10 rounded-full" alt="Your profile picture" src="https://images.unsplash.com/photo-1652841190565-b96e0acbae17" />
            <div>
              <p className="font-semibold text-sm text-right">You <span className="text-xs text-gray-400 ml-2">10:32 AM</span></p>
              <div className="bg-blue-500 text-white p-3 rounded-lg mt-1">
                <p>Good progress, we should be done by tomorrow. I've uploaded new photos.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full pl-4 pr-24 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
              <Button size="icon" variant="ghost" onClick={() => handleFeatureClick('Attach File')}><Paperclip className="w-5 h-5" /></Button>
              <Button size="icon" variant="ghost" onClick={() => handleFeatureClick('Start Video Call')}><Video className="w-5 h-5" /></Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommunicationTab;