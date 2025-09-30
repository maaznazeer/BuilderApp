import React from 'react';
    import { Helmet } from 'react-helmet-async';
    import HeroSection from '@/components/home/HeroSection';
    import BuilderTypesSection from '@/components/home/BuilderTypesSection';
    import OperationsSection from '@/components/home/OperationsSection';
    import PricingSection from '@/components/home/PricingSection';
    import TestimonialsSection from '@/components/home/TestimonialsSection';
    import CtaSection from '@/components/home/CtaSection';
    import FloatingActionButton from '@/components/ui/FloatingActionButton';
    import { useTranslation } from 'react-i18next';

    const HomePage = () => {
      const { t, i18n } = useTranslation();
      const currentLang = i18n.language;

      const CenteredSection = ({ children }) => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      );

      return (
        <>
          <Helmet>
            <html lang={currentLang} />
            <title>DomusBuilder Hub - Simplify Construction Management from Anywhere</title>
            <meta name="description" content="The ultimate platform for expatriates to manage residential construction projects remotely. Track budgets, monitor progress, and coordinate teams from anywhere in the world." />
            <link rel="alternate" hreflang="en" href="https://yourdomain.com/en" />
            <link rel="alternate" hreflang="fr" href="https://yourdomain.com/fr" />
            <link rel="alternate" hreflang="x-default" href="https://yourdomain.com/en" />
          </Helmet>
          <div className="flex flex-col w-full">
            <HeroSection />
            <CenteredSection><BuilderTypesSection /></CenteredSection>
            <CenteredSection><OperationsSection /></CenteredSection>
            <CenteredSection><PricingSection /></CenteredSection>
            <CenteredSection><TestimonialsSection /></CenteredSection>
            <CtaSection />
          </div>
          <FloatingActionButton />
        </>
      );
    };

    export default HomePage;