import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const PricingSection = () => {
  const { toast } = useToast();
  const { t } = useTranslation('home');

  const handleFeatureClick = () => {
    toast({
      title: "🚧 Feature Coming Soon!",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const pricingPlans = [
    {
      name: t('pricing.freemium'),
      price: t('pricing.freemium_price'),
      duration: t('pricing.freemium_duration'),
      features: ["Basic Dashboard", "Project Templates", "Email Support", "Up to 2 Projects"],
      popular: false
    },
    {
      name: t('pricing.basic'),
      price: t('pricing.basic_price'),
      duration: t('pricing.basic_duration'),
      features: ["Full Dashboard", "Budget Tracker", "Communication Hub", "Up to 10 Projects", "Priority Support"],
      popular: true
    },
    {
      name: t('pricing.premium'),
      price: t('pricing.premium_price'),
      duration: t('pricing.premium_duration'),
      features: ["Everything in Basic", "Logistics Directory", "Advanced Reporting", "Unlimited Projects", "24/7 Support", "API Access"],
      popular: false
    }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('pricing.title').split(' ').slice(0, -1).join(' ')} <span className="gradient-text">{t('pricing.title').split(' ').slice(-1).join(' ')}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pricing.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`pricing-card rounded-2xl p-8 card-hover relative ${
                plan.popular ? 'featured scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-sm block font-semibold">
                    {t('pricing.popular')}
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className={`text-4xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </div>
                <p className={`${plan.popular ? 'text-red-100' : 'text-gray-600'}`}>
                  {plan.duration}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center space-x-3">
                    <CheckCircle className={`w-5 h-5 ${plan.popular ? 'text-yellow-300' : 'text-green-500'}`} />
                    <span className={`${plan.popular ? 'text-white' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                    : 'btn-primary text-white'
                }`}
                onClick={handleFeatureClick}
              >
                {t('pricing.getStarted')}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;