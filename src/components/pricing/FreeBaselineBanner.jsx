import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const FreeBaselineBanner = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground pt-4 px-6 rounded-lg shadow-sm max-w-4xl mx-auto my-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 text-center sm:text-left"
    >
      <div className="flex-1">
        <h2 className="text-lg font-bold">Free (Basic)</h2>
        <p className="mt-1 text-sm">
          Get started today — budget + simple tasks
        </p>
      </div>
      <Link to="/signup?plan=free-baseline">
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-md">
          Start free
        </Button>
      </Link>
    </motion.section>
  );
};

export default FreeBaselineBanner;