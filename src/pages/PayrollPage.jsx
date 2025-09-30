import React from 'react';
    import { Helmet } from 'react-helmet-async';
    import { useTranslation } from 'react-i18next';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { FileSpreadsheet, Users, Upload, DollarSign, BarChart2, FileText } from 'lucide-react';
    import WorkersPage from '@/pages/WorkersPage';
    import PayrollGridWidget from '@/components/payroll/PayrollGridWidget';
    import TradeSummaryWidget from '@/components/payroll/TradeSummaryWidget';
    import PayslipGeneratorWidget from '@/components/payroll/PayslipGeneratorWidget';

    const PayrollPage = () => {
        const { t, i18n } = useTranslation();

        const tabs = [
            { value: 'summary', label: t('payroll.tabs.summary'), icon: BarChart2, component: <TradeSummaryWidget /> },
            { value: 'grid', label: t('payroll.tabs.grid'), icon: FileSpreadsheet, component: <PayrollGridWidget /> },
            { value: 'payslips', label: t('payroll.tabs.payslips'), icon: FileText, component: <PayslipGeneratorWidget /> },
            { value: 'workers', label: t('payroll.tabs.workers'), icon: Users, component: <WorkersPage /> },
            { value: 'import', label: t('payroll.tabs.import'), icon: Upload, component: <div>{t('payroll.tabs.import_placeholder')}</div> },
            { value: 'payments', label: t('payroll.tabs.payments'), icon: DollarSign, component: <div>{t('payroll.tabs.payments_placeholder')}</div> },
        ];

        return (
            <>
                <Helmet>
                    <html lang={i18n.language} />
                    <title>{t('payroll.page_title')} - DomusBuilder Hub</title>
                    <meta name="description" content={t('payroll.page_description')} />
                </Helmet>
                <div className="h-full flex flex-col p-4 md:p-6 space-y-4">
                    <header>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t('payroll.header')}</h1>
                        <p className="text-gray-600 mt-1">{t('payroll.subheader')}</p>
                    </header>
                    <Tabs defaultValue="summary" className="flex-grow flex flex-col">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                            {tabs.map(tab => (
                                <TabsTrigger key={tab.value} value={tab.value}>
                                    <tab.icon className="mr-2 h-4 w-4" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <div className="flex-grow mt-4 overflow-y-auto">
                            {tabs.map(tab => (
                                <TabsContent key={tab.value} value={tab.value} className="h-full">
                                    {tab.component}
                                </TabsContent>
                            ))}
                        </div>
                    </Tabs>
                </div>
            </>
        );
    };

    export default PayrollPage;