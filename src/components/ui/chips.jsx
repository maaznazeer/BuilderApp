import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const Chips = ({ id, options, value, onChange }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="flex items-center space-x-1 rounded-full bg-muted p-1"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {options.map((option) => (
        <motion.button
          key={option.value}
          variants={itemVariants}
          onClick={() => onChange(value === option.value ? null : option.value)}
          className={cn(
            'relative rounded-full px-3 py-1 text-sm font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            value === option.value && 'text-foreground'
          )}
        >
          {value === option.value && (
            <motion.span
              layoutId={`chip-background-${id}`}
              className="absolute inset-0 z-0 rounded-full bg-background shadow"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{option.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default Chips;