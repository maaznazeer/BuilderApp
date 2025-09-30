import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useProjects } from '@/contexts/ProjectContext.jsx';
import { useToast } from '@/components/ui/use-toast';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';

import OverviewTab from '@/components/dashboard/OverviewTab.jsx';
import ProjectsTab from '@/components/dashboard/ProjectsTab.jsx';
import SiteMonitoringTab from '@/components/dashboard/site-monitoring/SiteMonitoringTab.jsx';
import ApprovalsTab from '@/components/dashboard/ApprovalsTab.jsx';
import BudgetTab from '@/components/dashboard/BudgetTab.jsx';
import FinanceTab from '@/components/dashboard/FinanceTab.jsx';
import TeamTab from '@/components/dashboard/TeamTab.jsx';
import ReportsTab from '@/components/dashboard/ReportsTab.jsx';
import SourcingTab from '@/components/dashboard/sourcing/SourcingTab.jsx';
import RiskManagementTab from '@/components/dashboard/RiskManagementTab.jsx';

import SuppliersPage from '@/pages/SuppliersPage.jsx';
import InventoryPage from '@/pages/InventoryPage.jsx';
import MaterialPurchasesPage from '@/pages/MaterialPurchasesPage.jsx';
import GoodsReceivedNotesPage from '@/pages/GoodsReceivedNotesPage.jsx';
import GoodsIssueNotesPage from '@/pages/GoodsIssueNotesPage.jsx';
import StockMovementsPage from '@/pages/StockMovementsPage.jsx';
import ProjectMaterialsPage from '@/pages/ProjectMaterialsPage.jsx';
import FinancialLedgerPage from '@/pages/FinancialLedgerPage.jsx';

const PlaceholderTab = React.lazy(() => import('@/components/dashboard/PlaceholderTab.jsx'));

const DashboardPage = () => {
    const { tab = 'overview' } = useParams();
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const { projects, setProjects, loading: projectsLoading } = useProjects();
    const { profile } = useAuth();

    const handleFeatureClick = (featureName) => {
        toast({
            title: `🚧 ${featureName} is a work in progress!`,
            description: "This feature isn't implemented yet—but stay tuned! 🚀",
        });
    };

    const renderTabContent = () => {
        if (projectsLoading) {
            return <div>Loading...</div>;
        }

        switch (tab) {
            case 'overview':
                return <OverviewTab projects={projects} setActiveTab={(newTab) => window.location.href = `/dashboard/${newTab}`} handleFeatureClick={handleFeatureClick} />;
            case 'projects':
                return <ProjectsTab handleFeatureClick={handleFeatureClick} />;
            case 'approvals':
                return <ApprovalsTab projects={projects} updateProjects={setProjects} />;
            case 'sitemonitoring':
                return <SiteMonitoringTab />;
            case 'budget':
                return <BudgetTab projects={projects} updateProjects={setProjects} handleFeatureClick={handleFeatureClick} setActiveTab={(newTab) => window.location.href = `/dashboard/${newTab}`} />;
            case 'finance':
                return <FinanceTab projects={projects} updateProjects={setProjects} handleFeatureClick={handleFeatureClick} setActiveTab={(newTab) => window.location.href = `/dashboard/${newTab}`} />;
            case 'financial-ledger':
                return <FinancialLedgerPage />;
            case 'suppliers':
                return <SuppliersPage />;
            case 'inventory':
                return <InventoryPage />;
            case 'purchases':
                return <MaterialPurchasesPage />;
            case 'grn':
                return <GoodsReceivedNotesPage />;
            case 'gin':
                return <GoodsIssueNotesPage />;
            case 'stock-movements':
                return <StockMovementsPage />;
            case 'materials':
                return <ProjectMaterialsPage />;
            case 'team':
                return <TeamTab projects={projects} handleFeatureClick={handleFeatureClick} />;
            case 'reports':
                return <ReportsTab projects={projects} handleFeatureClick={handleFeatureClick} />;
            case 'sourcing':
                return <SourcingTab projects={projects} />;
            case 'risk':
                return <RiskManagementTab projects={projects} updateProjects={setProjects} />;
            default:
                return <React.Suspense fallback={<div>Loading...</div>}>
                    <PlaceholderTab tabName={tab} handleFeatureClick={handleFeatureClick} />
                </React.Suspense>;
        }
    };

    return (
        <>
            <Helmet>
                <html lang={i18n.language} />
                <title>{t('dashboard_title', { tab: t(`dashboard_tabs.${tab}`, tab), defaultValue: `${t(`dashboard_tabs.${tab}`, tab)} - DomusBuilder Hub` })}</title>
                <meta name="description" content={t('dashboard_meta_description', { defaultValue: 'Your central hub for managing construction projects, tasks, and resources.' })} />
                <meta property="og:title" content={t('dashboard_title', { tab: t(`dashboard_tabs.${tab}`, tab), defaultValue: `${t(`dashboard_tabs.${tab}`, tab)} - DomusBuilder Hub` })} />
                <meta property="og:description" content={t('dashboard_meta_description', { defaultValue: 'Your central hub for managing construction projects, tasks, and resources.' })} />
            </Helmet>
            <div className="flex-grow">
                <AnimatePresence mode="wait">
                    {renderTabContent()}
                </AnimatePresence>
            </div>
        </>
    );
};

export default DashboardPage;