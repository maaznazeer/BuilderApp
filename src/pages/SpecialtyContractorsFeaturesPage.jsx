import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/components/ui/Breadcrumb';

const SpecialtyContractorsFeaturesPage = () => {
  const { t, i18n } = useTranslation('home');
  const currentLang = i18n.language;

  const features = t('builderTypes.types.2.features', { returnObjects: true });

  return (
    <>
      <Helmet>
        <html lang={currentLang} />
        <title>{t('builderTypes.types.2.title')} - Features | DomusBuilder</title>
        <meta name="description" content={t('builderTypes.types.2.description')} />
      </Helmet>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <Breadcrumb />
        <div className="mt-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            {t('builderTypes.types.2.title')}
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {t('builderTypes.types.2.description')}
          </p>
        </div>

        <div className="mt-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(features) && features.map((feature, index) => (
              <div key={index} className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-primary to-blue-600 rounded-md shadow-lg">
                         <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.iconPath} />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.name}</h3>
                    <p className="mt-5 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SpecialtyContractorsFeaturesPage;