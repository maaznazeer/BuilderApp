import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Shield, Clock, Users } from 'lucide-react';

const PricingFeatures = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock support for Premium users, priority support for Basic"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Seamless collaboration tools for teams of any size"
    },
    {
      icon: CreditCard,
      title: "Flexible Billing",
      description: "Monthly or annual billing with easy cancellation"
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose <span className="gradient-text">ALPHA Builder</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            More than just pricing - we provide value that helps you succeed in your construction projects.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-orange-500 rounded-2xl flex items-center justify-center mx-auto">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingFeatures;