import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const BillingPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const isTrialActive = user && user.trial_ends_at && new Date(user.trial_ends_at) > new Date();

  const invoiceHistory = [
    { id: 'INV-2024-003', date: '2024-07-01', amount: '$99.00', status: 'Paid' },
    { id: 'INV-2024-002', date: '2024-06-01', amount: '$99.00', status: 'Paid' },
    { id: 'INV-2024-001', date: '2024-05-01', amount: '$99.00', status: 'Paid' },
  ];

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <title>{t('billingPage.title')} - DomusBuilder Hub</title>
        <meta name="description" content={t('billingPage.description')} />
      </Helmet>
        <div className="p-6 sm:p-8">
            <CardHeader>
                <CardTitle>{t('billingPage.title')}</CardTitle>
                <CardDescription>{t('billingPage.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('billingPage.currentPlan')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                        <p className="text-lg font-semibold">DomusBuilder Pro</p>
                        {isTrialActive ? (
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="success">Trial Period</Badge>
                                <p className="text-sm text-gray-600">
                                    Ends on {format(new Date(user.trial_ends_at), 'PPP')}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">$99.00 / month</p>
                        )}
                        </div>
                        <Button variant="outline">{t('billingPage.changePlan')}</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('billingPage.paymentMethod')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <img  alt="Visa Card" className="w-12 h-auto" src="https://images.unsplash.com/photo-1654714009937-acf4ffba1202" />
                            <div>
                                <p className="font-medium">Visa ending in 1234</p>
                                <p className="text-sm text-gray-500">Expires 12/2026</p>
                            </div>
                        </div>
                        <Button variant="outline">{t('billingPage.updatePayment')}</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('billingPage.invoiceHistory')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoiceHistory.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.id}</TableCell>
                                        <TableCell>{invoice.date}</TableCell>
                                        <TableCell>{invoice.amount}</TableCell>
                                        <TableCell>
                                            <Badge variant={invoice.status === 'Paid' ? 'success' : 'default'}>{invoice.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">Download</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </CardContent>
        </div>
    </>
  );
};

export default BillingPage;