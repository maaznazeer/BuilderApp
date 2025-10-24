import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import CurrencyProvider from '@/contexts/CurrencyProvider.jsx';
import CurrencySelect from '@/components/currency/CurrencySelect.jsx';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { hasFullAccess } from '@/lib/rolePermissions.js';

function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  const crumbs = parts.map((p, i) => ({
    label: p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    to: '/' + parts.slice(0, i + 1).join('/')
  }));

  return (
    <div className="text-xs text-muted-foreground">
      {crumbs.map((c, i) => (
        <span key={c.to}>
          {i > 0 && ' / '}
          <Link to={c.to} className="hover:underline">
            {c.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export default function DashboardShell({ children, active }) {
  const { profile } = useAuth();
  const canSeeFinancials = profile?.app_role?.toLowerCase() === 'homeowner' || profile?.app_role?.toLowerCase() === 'homebuilder';
  
  const items = [
    ['Overview', '/dashboard/overview'],
    ['Projects', '/dashboard/projects'],
    // ['Workforce', '/dashboard/workforce'],
    canSeeFinancials && ['Financials', '/dashboard/financials'],
    // ['Supply Chain', '/dashboard/supply-chain'],
    ['Alerts', '/dashboard/alerts'],
  ].filter(Boolean);

  return (
    <CurrencyProvider>
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <nav className="flex gap-2 text-sm">
            {items.map(([label, href]) => (
              <Link
                key={href}
                to={href}
                className={`rounded-full px-3 py-1 ${active === href ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <CurrencySelect />
        </div>
        <div className="mt-2">
          <Breadcrumbs />
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </CurrencyProvider>
  );
}