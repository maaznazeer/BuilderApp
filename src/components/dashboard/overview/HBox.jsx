import React from 'react';
import { cn } from '@/lib/utils';

const HBox = ({ children, gap = 4, className, ...props }) => {
  const gapVariants = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
  };

  return (
    <div
      className={cn(
        'flex flex-row items-end',
        gapVariants[gap] || 'gap-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default HBox;