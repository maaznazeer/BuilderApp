import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Navigate } from 'react-router-dom';
import OverviewPage from '@/pages/OverviewPage';

function DashboardPage() {
  const { tab } = useParams();

  // If there's a tab param, it's likely an old URL or a sub-page.
  // For now, we redirect any such case to the new overview page.
  if (tab) {
    return <Navigate to="/dashboard/overview" replace />;
  }
  
  // This component now acts as a router for the main dashboard content area.
  // As per the latest request, it will render the OverviewPage.
  return <OverviewPage />;
}

export default DashboardPage;