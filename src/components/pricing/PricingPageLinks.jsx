import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, Mail, Zap, ArrowRight } from 'lucide-react';

const PricingPageLinks = () => {
  const links = [
    { label: 'Explore Features', path: '/features', icon: Zap },
    { label: 'Contact Sales', path: '/contact', icon: Mail },
    { label: 'Billing Docs', path: '/docs/billing', icon: Book },
  ];

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl"
        >
          Need More Information?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true, amount: 0.5 }}
          className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          Dive deeper into our features, get in touch with our team, or browse our documentation.
        </motion.p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {links.map((link, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.5 }}
              className="group"
            >
              <Link to={link.path} className="block bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out">
                <div className="flex flex-col items-center text-center">
                   <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary to-orange-600 text-white mb-6 group-hover:scale-110 transition-transform">
                      <link.icon className="h-8 w-8" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 dark:text-white">{link.label}</h3>
                   <div className="mt-4 flex items-center text-primary dark:text-primary-foreground font-semibold">
                       <span>Learn more</span>
                       <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                   </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPageLinks;