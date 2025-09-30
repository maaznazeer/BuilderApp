import React from 'react';

export default function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
      <div className="mb-3 text-sm font-medium text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}