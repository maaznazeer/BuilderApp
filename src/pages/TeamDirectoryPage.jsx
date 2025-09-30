import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import DashboardPage from './DashboardPage';

const TeamDirectoryPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <>
      <Helmet>
        <html lang={currentLang} />
        <title>Team Directory - DomusBuilder Hub</title>
        <meta name="description" content="Manage your team members, contractors, and their roles." />
      </Helmet>
      <DashboardPage />
    </>
  );
};

export default TeamDirectoryPage;