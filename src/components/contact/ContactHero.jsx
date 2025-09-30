import React from 'react';
import { motion } from 'framer-motion';

const ContactHero = () => {
  return (
    <section className="relative pt-24 pb-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 overflow-hidden">
      <div className="absolute inset-0 hero-pattern opacity-20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Get in Touch
            <br />
            <span className="text-yellow-300">We're Here to Help</span>
          </h1>
          
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Have questions about managing your construction project remotely? Our team of experts is ready to assist you every step of the way.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactHero;