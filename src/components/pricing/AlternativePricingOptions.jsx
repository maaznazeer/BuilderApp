import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Milestone, Wallet, CalendarClock, Users } from 'lucide-react';

const optionsData = [
  {
    icon: Milestone,
    title: 'Pay only at construction stages',
    description: 'Pay for a bundle of services at each key stage.',
    caption: 'Bundle: $199',
    link: '/checkout?plan=alt-milestone-stage-1',
    cta: 'Select Stage',
  },
  {
    icon: Wallet,
    title: 'Use credits, like airtime',
    description: 'Top up your wallet and spend as you go.',
    caption: 'Credits: 100 / 300',
    link: '/checkout?plan=alt-wallet-100',
    cta: 'Top Up Wallet',
  },
  {
    icon: CalendarClock,
    title: 'Quarterly subscription (salaried)',
    description: 'Align payments with your salary schedule.',
    caption: 'Lite: $40 / Standard: $80',
    link: '/signup?plan=alt-quarterly-standard',
    cta: 'Choose Quarterly',
  },
  {
    icon: Users,
    title: 'Family subscription for diaspora builds',
    description: 'Pool funds with family or co-op members.',
    caption: 'Per Project Billing',
    link: '/checkout?plan=family-coop-per-project',
    cta: 'Start a Pool',
  },
];

const AlternativePricingOptions = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Alternative Options
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Capture irregular cash-flow without confusion.
          </p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {optionsData.map((option) => (
            <motion.div
              key={option.title}
              variants={cardVariants}
              className="flex flex-col text-center p-6 rounded-2xl shadow-lg border border-gray-200 bg-white hover:shadow-primary/20 transition-shadow duration-300"
            >
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary">
                  <option.icon className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
              <div className="flex-1 mt-4">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">{option.title}</h3>
                <p className="mt-2 text-base text-gray-600 min-h-[64px]">{option.description}</p>
                <p className="mt-3 text-sm font-medium text-primary">{option.caption}</p>
              </div>
              <div className="mt-6">
                <Button asChild className="w-full" variant="outline">
                  <Link to={option.link}>
                    {option.cta}
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AlternativePricingOptions;