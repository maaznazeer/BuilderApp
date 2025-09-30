import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PlanSelection from '@/components/checkout/PlanSelection';
import PaymentMethods from '@/components/checkout/PaymentMethods';
import OrderSummary from '@/components/checkout/OrderSummary';

const CheckoutPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const location = useLocation();

  const plans = {
    freemium: { name: 'Freemium', price: { monthly: 0, yearly: 0 }, trial: '1-month' },
    basic: { name: 'Basic', price: { monthly: 15, yearly: 150 } },
    premium: { name: 'Premium', price: { monthly: 30, yearly: 300 } },
    lifetime: { name: 'Lifetime', price: { monthly: 299, yearly: 299 } },
  };
  
  const initialPlan = location.state?.plan || 'basic';
  const initialBillingCycle = location.state?.isAnnual ? 'yearly' : 'monthly';

  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [billingCycle, setBillingCycle] = useState(initialBillingCycle);

  return (
    <>
      <Helmet>
        <html lang={currentLang} />
        <title>Checkout - DomusBuilder Hub</title>
        <meta name="description" content="Complete your subscription to DomusBuilder Hub. Select your plan, billing cycle, and payment method." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#002B5B] sm:text-5xl">
              Complete Your Order
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              You're just one step away from unlocking powerful building tools.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-8">
              <PlanSelection
                plans={plans}
                selectedPlan={selectedPlan}
                setSelectedPlan={setSelectedPlan}
                billingCycle={billingCycle}
                setBillingCycle={setBillingCycle}
              />
              <PaymentMethods />
            </div>
            
            <div className="lg:col-span-1">
              <OrderSummary
                plan={plans[selectedPlan]}
                billingCycle={billingCycle}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default CheckoutPage;