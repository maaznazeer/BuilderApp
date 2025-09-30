import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { ShieldAlert } from 'lucide-react';
import PricingHeroSection from '@/components/pricing/PricingHeroSection';
import PricingCards from '@/components/pricing/PricingCards';
import PricingComparison from '@/components/pricing/PricingComparison';
import PricingFeatures from '@/components/pricing/PricingFeatures';
import FaqSection from '@/components/pricing/FaqSection';
import SpecialOffers from '@/components/pricing/SpecialOffers';
import FreeBaselineBanner from '@/components/pricing/FreeBaselineBanner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

const PricingPage = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const { toast } = useToast();

    useEffect(() => {
        if (location.state?.unauthorized) {
            toast({
                variant: 'destructive',
                title: (
                    <div className="flex items-center">
                        <ShieldAlert className="mr-2 h-5 w-5" />
                        <span>Access Denied</span>
                    </div>
                ),
                description: `Your current plan does not include access to the ${location.state.featureName || 'requested feature'}. Please upgrade your plan.`,
                duration: 8000,
            });
        }
    }, [location.state, toast]);

    return (
        <>
            <Helmet>
                <html lang={i18n.language} />
                <title>{t('pricingPage.title')}</title>
                <meta name="description" content={t('pricingPage.meta_description')} />
                <meta property="og:title" content={t('pricingPage.og_title')} />
                <meta property="og:description" content={t('pricingPage.og_description')} />
            </Helmet>
            <div className="flex flex-col">
                {location.state?.unauthorized && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="container max-w-4xl mx-auto pt-8"
                    >
                        <Alert variant="destructive" className="border-2 border-red-500/50 bg-red-50 dark:bg-red-900/20">
                           <ShieldAlert className="h-5 w-5 !text-red-500" />
                           <AlertTitle className="font-bold text-red-800 dark:text-red-300">Upgrade Required</AlertTitle>
                           <AlertDescription className="text-red-700 dark:text-red-400">
                               The feature you tried to access, <strong>{location.state.featureName || 'AI Toolkit'}</strong>, requires a higher tier plan. Please review the options below to upgrade your account and unlock this feature.
                           </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
                <PricingHeroSection />
                <FreeBaselineBanner />
                <PricingCards />
                <PricingComparison />
                <PricingFeatures />
                <SpecialOffers />
                <div data-pricing-footer>
                    <FaqSection />
                </div>
            </div>
        </>
    );
};

export default PricingPage;