import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { cn } from '@/lib/utils';
import { dashboardConfig } from './dashboardConfig';

const DashboardTabs = ({ isMobile = false }) => {
  const { t } = useTranslation();
  const { user, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const allTabs = dashboardConfig.map(item => ({
    ...item,
    href: `/dashboard/${item.id}`,
    name: t(item.label, { defaultValue: item.label })
  }));

  const isTrialActive = () => {
    if (!user || !user.trial_ends_at) return true;
    return new Date(user.trial_ends_at) > new Date();
  };

  const availableTabs = allTabs.filter(tab => hasPermission(tab.permission));

  if (!isTrialActive()) {
    return (
      <div className="bg-red-100 border-b border-red-300 text-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          Your trial has expired. Please upgrade your plan to continue using Domus Builder.
        </div>
      </div>
    );
  }

  const handleTabClick = (tab) => {
    navigate(tab.href);
  };

  const checkIsActive = (tab, currentPath) => {
    return currentPath.startsWith(tab.href);
  };

  if (isMobile) {
    return (
      <nav className="flex flex-col space-y-1 px-2">
        {availableTabs.map((tab) => (
          <button
            key={tab.href}
            onClick={() => handleTabClick(tab)}
            className={cn(
              'flex items-center space-x-3 p-3 rounded-md text-sm font-medium',
              checkIsActive(tab, location.pathname)
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            {tab.Icon && <tab.icon className="w-5 h-5" />}
            <span>{tab.name}</span>
          </button>
        ))}
      </nav>
    );
  }

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {availableTabs.map((tab) => (
            <button
              key={tab.href}
              onClick={() => handleTabClick(tab)}
              className={`whitespace-nowrap flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                checkIsActive(tab, location.pathname)
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default DashboardTabs;