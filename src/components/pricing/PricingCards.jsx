import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import AlternativeOptionsPanel from '@/components/pricing/AlternativeOptionsPanel';
import { Label } from '@/components/ui/label';

const PricingCards = () => {
    const { t } = useTranslation('home');
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [activeTab, setActiveTab] = useState('standard');

    const pricing = t('pricing', { returnObjects: true });
    const plans = pricing.plans_v2;

    const getPrice = (plan) => {
        switch (billingCycle) {
            case 'monthly':
                return plan.price.monthly;
            case 'quarterly':
                return plan.price.quarterly;
            case 'annually':
                return plan.price.annually;
            default:
                return plan.price.monthly;
        }
    };

    return (
        <section className="py-20 bg-gray-50" data-pricing-tabs>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                            <TabsTrigger value="standard">{t('pricing.standardPlans')}</TabsTrigger>
                            <TabsTrigger value="alternative">{window.__ALT_OPTIONS_CFG__.labels.tab}</TabsTrigger>
                        </TabsList>
                    </motion.div>

                    <TabsContent value="standard" className="mt-12">
                        <div className="flex justify-center items-center space-x-2 mb-12 bg-gray-200 p-1 rounded-xl w-fit mx-auto">
                            <Button
                                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                                className={`rounded-lg ${billingCycle === 'monthly' ? '' : 'text-gray-500'}`}
                                onClick={() => setBillingCycle('monthly')}
                            >
                                {t('pricing.monthly')}
                            </Button>
                            <Button
                                variant={billingCycle === 'quarterly' ? 'default' : 'ghost'}
                                className={`rounded-lg ${billingCycle === 'quarterly' ? '' : 'text-gray-500'}`}
                                onClick={() => setBillingCycle('quarterly')}
                            >
                                {t('pricing.quarterly')}
                            </Button>
                            <Button
                                variant={billingCycle === 'annually' ? 'default' : 'ghost'}
                                className={`rounded-lg ${billingCycle === 'annually' ? '' : 'text-gray-500'}`}
                                onClick={() => setBillingCycle('annually')}
                            >
                                {t('pricing.annually')}
                                <span className="text-green-600 font-semibold ml-2 hidden sm:inline">({t('pricing.save20')})</span>
                            </Button>
                        </div>
                        <motion.div
                            key="standard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {Array.isArray(plans) && plans.map((plan, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className={`relative flex flex-col rounded-2xl p-8 shadow-lg transition-all duration-300 hover:scale-105 ${plan.popular ? 'border-2 border-primary bg-white' : 'bg-white'}`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                                                {t('pricing.popular')}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex-grow">
                                        <h3 className={`text-2xl font-bold text-center ${plan.popular ? 'text-gray-900' : 'text-gray-900'}`}>{plan.name}</h3>
                                        <div className="mt-4 text-center">
                                            <span className={`text-4xl font-extrabold ${plan.popular ? 'text-gray-900' : 'text-gray-900'}`}>{getPrice(plan)}</span>
                                            <span className="text-base font-medium text-gray-500">{plan.duration}</span>
                                        </div>
                                        <p className="mt-4 text-sm text-center text-gray-500 h-12">{plan.description}</p>
                                        <ul className="mt-8 space-y-4">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start">
                                                    <CheckCircle className={`w-5 h-5 mt-1 mr-3 flex-shrink-0 ${plan.popular ? 'text-primary' : 'text-green-500'}`} />
                                                    <span className={`${plan.popular ? 'text-gray-700' : 'text-gray-700'}`}>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-8">
                                        <Button asChild className={`w-full ${plan.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'btn-secondary'}`} size="lg">
                                            <Link to={plan.ctaLink}>{plan.ctaText}</Link>
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="alternative" className="mt-12">
                         <motion.div
                            key="alternative"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <AlternativeOptionsPanel />
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    );
};

export default PricingCards;