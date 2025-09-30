import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const InfoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Only show the banner in development environment
    if (process.env.NODE_ENV !== 'development') {
      setIsVisible(false);
      return;
    }
    
    const dismissed = sessionStorage.getItem('trials_info_banner_dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('trials_info_banner_dismissed', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Card className="relative p-4 bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">
              Trials are feature-gates only. RLS/tenancy still enforced. API ceilings & AI token caps apply.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-blue-100 transition-colors"
          >
            <X className="h-4 w-4 text-blue-600" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default InfoBanner;