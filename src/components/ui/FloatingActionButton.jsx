import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ArrowRight, Star, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const fabVariants = {
    closed: { rotate: 0 },
    open: { rotate: 45 },
  };

  const itemVariants = {
    closed: { opacity: 0, y: 20, scale: 0.8 },
    open: { opacity: 1, y: 0, scale: 1 },
  };

  const menuItems = [
    {
      label: 'Get Started',
      icon: ArrowRight,
      path: '/signup',
      bgColor: 'bg-green-500 hover:bg-green-600',
    },
    {
      label: 'Features',
      icon: Star,
      path: '/features',
      bgColor: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Contact Us',
      icon: MessageSquare,
      path: '/contact',
      bgColor: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="flex flex-col items-end space-y-3 mb-4"
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: {
                transition: { staggerChildren: 0.07, delayChildren: 0.2 },
              },
              closed: {
                transition: { staggerChildren: 0.05, staggerDirection: -1 },
              },
            }}
          >
            {menuItems.map((item) => (
              <motion.div
                key={item.path}
                className="flex items-center space-x-3"
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
              >
                <span className="bg-gray-800 text-white text-sm px-3 py-1 rounded-md shadow-lg">
                  {item.label}
                </span>
                <Link to={item.path}>
                  <Button
                    size="icon"
                    className={`rounded-full shadow-lg ${item.bgColor}`}
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
        aria-expanded={isOpen}
        aria-label="Toggle action menu"
      >
        <motion.div variants={fabVariants} animate={isOpen ? 'open' : 'closed'}>
          {isOpen ? <X className="h-8 w-8" /> : <Plus className="h-8 w-8" />}
        </motion.div>
      </Button>
    </div>
  );
};

export default FloatingActionButton;