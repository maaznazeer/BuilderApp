import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useDashboard } from '@/contexts/DashboardContext.jsx';
import MaterialsPivotWidget from '@/components/reports/MaterialsPivotWidget.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ReportsPage = () => {
    const { projectIds } = useDashboard();
    

    return (
        <>
            <Helmet>
                <title>Reports | DomusBuilder</title>
                <meta name="description" content="Generate and view reports for your projects." />
            </Helmet>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex justify-between items-start">
                    {/* <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                        <p className="text-muted-foreground">Analyze project data and generate insights.</p>
                    </div> */}
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <MaterialsPivotWidget projectIds={projectIds} />
                    {/* Future reports can be added here */}
                </div>
            </div>
        </>
    );
};

export default ReportsPage;