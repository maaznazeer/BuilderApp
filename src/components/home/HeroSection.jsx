import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/160d6b05df4396dec133f67366dd7c82.jpg')] bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-primary opacity-80"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }} 
          className="space-y-6 md:space-y-8"
        >
          <motion.h1 
            className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your All-In-One Powerful Construction Management Software
          </motion.h1>
          
          <motion.p 
            className="mt-4 md:mt-6 text-base sm:text-lg lg:text-xl text-red-100 max-w-3xl mx-auto leading-relaxed" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The most affordable and easiest tool that simplifies home construction management from anywhere.
          </motion.p>

          <motion.p 
            className="mt-4 text-sm sm:text-base text-red-100 max-w-3xl mx-auto leading-relaxed" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Empower yourself to efficiently monitor, manage, and collaborate on home construction projects from anywhere in the world with our comprehensive platform designed for expatriates.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link to="/signup">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                Start Building Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;