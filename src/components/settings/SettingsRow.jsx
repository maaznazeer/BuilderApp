import React from 'react';
import { Separator } from '@/components/ui/separator';

const SettingsRow = ({ label, description, children, isLast = false }) => {
  return (
    <>
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 flex-grow">
          <p className="font-medium text-card-foreground">{label}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex-shrink-0">{children}</div>
      </div>
      {!isLast && <Separator />}
    </>
  );
};

export default SettingsRow;