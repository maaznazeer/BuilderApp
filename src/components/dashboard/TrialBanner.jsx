import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const TrialBanner = () => {
  const { trialStatus, loading } = useAuth();
  const [isVisible, setIsVisible] = React.useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('trialBannerDismissed', 'true');
  };

  React.useEffect(() => {
    if (sessionStorage.getItem('trialBannerDismissed') === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (loading || !trialStatus || !trialStatus.is_active || !isVisible) {
    return null;
  }

  const daysLeft = trialStatus.days_left;
  const isEndingSoon = daysLeft <= 7;
  const bannerClasses = `
    relative rounded-2xl p-4 w-full text-sm flex items-center justify-center gap-4
    ${isEndingSoon
      ? 'bg-amber-50 text-amber-900 border border-amber-200'
      : 'bg-indigo-50 text-indigo-900 border border-indigo-200'}
  `;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="mb-6"
        >
          <div className={bannerClasses}>
            {isEndingSoon ? (
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            ) : (
              <Sparkles className="h-5 w-5 text-indigo-600 flex-shrink-0" />
            )}
            <p className="font-medium">
              {isEndingSoon
                ? `Your Premium Trial is ending in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}.`
                : `You have ${daysLeft} days left on your Premium Trial.`}
            </p>
            <Button asChild size="sm" variant={isEndingSoon ? "default" : "outline"} className={isEndingSoon ? "bg-amber-600 hover:bg-amber-700 text-white" : "text-indigo-700 border-indigo-300 hover:bg-indigo-100"}>
              <Link to="/pricing">Upgrade Now</Link>
            </Button>
            <button onClick={handleDismiss} className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors">
               <X className="h-4 w-4" />
               <span className="sr-only">Dismiss</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrialBanner;