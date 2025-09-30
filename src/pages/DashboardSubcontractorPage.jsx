import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import DashboardPage from './DashboardPage';

const DashboardSubcontractorPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <>
      <Helmet>
        <html lang={currentLang} />
        <title>Subcontractor Dashboard - DomusBuilder Hub</title>
        <meta name="description" content="Dashboard for Subcontractors on DomusBuilder Hub." />
      </Helmet>
       {/* For now, we render the generic dashboard. This can be customized later. */}
       <DashboardPage />
    </>
  );
};

export default DashboardSubcontractorPage;