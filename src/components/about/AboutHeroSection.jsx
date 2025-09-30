import React from 'react';
import { motion } from 'framer-motion';
import { Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutHeroSection = () => {
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-24 pb-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 overflow-hidden">
      <div className="absolute inset-0 hero-pattern opacity-20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Built by Expatriates,
              <br />
              <span className="text-yellow-300">for Expatriates</span>
            </h1>
            
            <p className="text-xl text-blue-100 leading-relaxed">
              We understand the unique challenges of managing construction projects from thousands of miles away. That's why we created ALPHA Builder - to bridge the gap between distance and dreams.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 text-lg font-semibold rounded-full"
                onClick={() => handleScrollTo('our-story')}
              >
                Our Story
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                className="border-white bg-white/20 text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg font-semibold rounded-full"
                onClick={() => handleScrollTo('meet-the-team')}
              >
                Meet the Team
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <img  
              className="w-full h-96 object-cover rounded-2xl shadow-2xl" 
              alt="Bright, modern living room with wood floors and white shutters, showcasing interior design and space." 
              src="https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/523e734a6ef94d917a2387a103d4cb79.jpg" />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">500+ Projects</div>
                  <div className="text-sm text-gray-600">Successfully Managed</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutHeroSection;