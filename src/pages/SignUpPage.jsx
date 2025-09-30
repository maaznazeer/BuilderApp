import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '@/components/ui/breadcrumbs.jsx';
import { Card } from '@/components/ui/card';
import SignUpForm from '@/components/auth/SignUpForm.jsx';

const SignUpPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Sign Up', path: '/signup' }
  ];

  return (
    <>
      <Helmet>
        <html lang={currentLang} />
        <title>Sign Up - DomusBuilder Hub</title>
        <meta name="description" content={t('signup.description')} />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col flex-grow">
            <div className="py-6">
                <Breadcrumbs items={breadcrumbItems} />
            </div>
            <div className="flex-grow flex items-center justify-center">
                 <Card className="w-full grid grid-cols-1 md:grid-cols-3 overflow-hidden shadow-2xl rounded-3xl my-8">
                    <div className="md:col-span-2 p-8 lg:p-12 bg-white flex items-center justify-center">
                        <div className="w-full max-w-2xl">
                           <SignUpForm />
                        </div>
                    </div>
                    <div className="hidden md:block md:col-span-1 relative">
                        <img className="absolute inset-0 w-full h-full object-cover" alt="A modern building under construction" src="https://images.unsplash.com/photo-1638724834295-59e9f1c432f7" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-8 left-8 text-white">
                            <h3 className="text-3xl font-bold">Build Your Future.</h3>
                            <p className="mt-2 text-lg">Join a community of forward-thinking builders.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;