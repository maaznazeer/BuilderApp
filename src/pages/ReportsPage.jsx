import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useDashboard } from '@/contexts/DashboardContext.jsx';
import MaterialsPivotWidget from '@/components/reports/MaterialsPivotWidget.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportsPage = () => {
    const { projectIds, hasFeature } = useDashboard();
    const navigate = useNavigate();

    const canViewAdvancedReports = hasFeature('advanced_reports');
    
    if (!canViewAdvancedReports) {
        return (
            <>
                <Helmet>
                    <title>Reports - Upgrade Required</title>
                </Helmet>
                <div className="p-4 sm:p-6 lg:p-8">
                    <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[60vh]">
                        <EyeOff className="h-16 w-16 text-muted-foreground mb-4" />
                        <CardHeader>
                            <CardTitle className="text-2xl">Advanced Reporting is a Premium Feature</CardTitle>
                            <CardDescription className="max-w-md mx-auto mt-2">
                                Unlock powerful, in-depth reports to gain deeper insights into your project's financial and operational performance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button size="lg" onClick={() => navigate('/pricing')}>
                                <Zap className="mr-2 h-5 w-5" />
                                Upgrade to Unlock Reports
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }
    

    return (
        <>
            <Helmet>
                <title>Reports | DomusBuilder</title>
                <meta name="description" content="Generate and view reports for your projects." />
            </Helmet>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                        <p className="text-muted-foreground">Analyze project data and generate insights.</p>
                    </div>
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