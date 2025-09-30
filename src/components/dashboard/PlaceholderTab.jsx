import React from 'react';
import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PlaceholderTab = ({ tabName, handleFeatureClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Wrench className="w-12 h-12 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {tabName.charAt(0).toUpperCase() + tabName.slice(1)} Module Coming Soon
      </h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        This feature is currently under development. We're working hard to bring you comprehensive {tabName} management tools.
      </p>
      <Button 
        className="btn-primary text-white"
        onClick={() => handleFeatureClick(`${tabName} Module`)}
      >
        Request Early Access
      </Button>
    </motion.div>
  );
};

export default PlaceholderTab;