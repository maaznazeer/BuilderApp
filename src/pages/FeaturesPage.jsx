import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CoreFeaturesSection from '@/components/features/CoreFeaturesSection';
import AdditionalFeaturesSection from '@/components/features/AdditionalFeaturesSection';
import IntegrationsSection from '@/components/features/IntegrationsSection';
import FeatureShowcaseSection from '@/components/features/FeatureShowcaseSection';
import Breadcrumb from '@/components/ui/Breadcrumb';

const FeaturesPage = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <>
      <Helmet>
        <title>Features - DomusBuilder Hub Platform</title>
        <meta name="description" content="Discover comprehensive features for remote construction management including project dashboards, budget tracking, team communication, and site monitoring tools." />
      </Helmet>
      
      <div className="pt-8 pb-4">
        <Breadcrumb />
      </div>

      <section className="relative pt-20 pb-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 overflow-hidden rounded-lg">
        <div className="absolute inset-0 hero-pattern opacity-20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Powerful Features for
              <br />
              <span className="text-yellow-300">Remote Construction Management</span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Everything you need to successfully manage construction projects from anywhere in the world. Built specifically for expatriates and remote teams.
            </p>
          </motion.div>
        </div>
      </section>

      <CoreFeaturesSection />
      <AdditionalFeaturesSection />
      <IntegrationsSection />
      <FeatureShowcaseSection />

      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Start your free trial today and discover how DomusBuilder Hub can transform your construction project management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="btn-primary text-white px-8 py-4 text-lg font-semibold rounded-full"
                onClick={() => handleNavigate('/pricing')}
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-full"
                onClick={() => handleNavigate('/contact')}
              >
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default FeaturesPage;