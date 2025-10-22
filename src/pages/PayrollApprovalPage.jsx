import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import PayrollApprovalWidget from '@/components/construction-management/PayrollApprovalWidget';

const PayrollApprovalPage = () => {
    const { t } = useTranslation(['custom']);

    return (
        <>
            <Helmet>
                <html lang={useTranslation().i18n.language} />
                <title>{t('Payroll Approval')} - DomusBuilder Hub</title>
                <meta name="description" content={t('Review and approve payroll entries for construction workers.')} />
            </Helmet>
            <div className="h-full flex flex-col p-4 md:p-6">
                <div className="mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{t('Payroll Approval')}</h1>
                        <p className="text-gray-500 mt-1">{t('Review and approve payroll entries for construction workers.')}</p>
                    </div>
                </div>
                <div className="flex-grow">
                    <PayrollApprovalWidget />
                </div>
            </div>
        </>
    );
};

export default PayrollApprovalPage;
