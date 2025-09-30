import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PricingHeroSection = () => {
  const bulletPoints = [
    'Start free • No credit card required',
    'Switch plans anytime',
    'Designed for diaspora/co-ops',
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-50 to-orange-100 py-16 sm:py-24 lg:py-32">
      <div className="absolute inset-0 z-0 opacity-30">
        <img  className="w-full h-full object-cover" alt="Abstract geometric pattern background" src="https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/3717ac3f2d540fa7070d5ae45ba5ca22.jpg" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold text-primary uppercase tracking-wide"
          >
            Flexible pricing for real-world builds
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl leading-tight"
          >
            One platform. Many ways to pay.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg text-gray-600 max-w-xl mx-auto lg:mx-0"
          >
            Regular monthly/quarterly/annual plans in the center. Flexible alternatives below (milestone, wallet/credits, quarterly, family/coop).
          </motion.p>
          <ul className="mt-8 space-y-3 text-left max-w-xl mx-auto lg:mx-0">
            {bulletPoints.map((point, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="flex items-center text-gray-700"
              >
                <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                {point}
              </motion.li>
            ))}
          </ul>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
          >
            <Button asChild className="px-8 py-3 text-lg font-medium rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 bg-primary hover:bg-primary/90 text-white">
              <Link to="/signup?plan=hybrid_free">Get started free</Link>
            </Button>
            <Button asChild variant="outline" className="px-8 py-3 text-lg font-medium rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 border-primary text-primary hover:bg-primary/10 hover:text-primary">
              <Link to="/contact">Talk to sales</Link>
            </Button>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 lg:mt-0 flex justify-center lg:justify-end"
        >
          <img  
            className="w-full max-w-md lg:max-w-none h-auto rounded-lg shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
            alt="Couple reviewing architectural blueprints for their new home build" src="https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/415be16265fe5f60781c510ba08fef5a.jpg" />
        </motion.div>
      </div>
    </section>
  );
};

export default PricingHeroSection;