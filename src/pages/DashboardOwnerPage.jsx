import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import DashboardPage from './DashboardPage'; // Assuming this has a different view based on user role prop

const DashboardOwnerPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <>
      <Helmet>
        <html lang={currentLang} />
        <title>Homeowner Dashboard - DomusBuilder Hub</title>
        <meta name="description" content="Dashboard for Homeowners on DomusBuilder Hub." />
      </Helmet>
       {/* For now, we render the generic dashboard. This can be customized later. */}
       <DashboardPage />
    </>
  );
};

export default DashboardOwnerPage;