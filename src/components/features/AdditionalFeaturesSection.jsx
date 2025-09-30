import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Smartphone, Users, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AdditionalFeaturesSection = () => {
  const { toast } = useToast();

  const handleFeatureClick = () => {
    toast({
      title: "🚧 Feature Coming Soon!",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const additionalFeatures = [
    {
      icon: Globe,
      title: "Multi-language Support",
      description: "Available in English and French to serve expatriates across different regions.",
      highlight: "English/French"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Optimized for mobile devices to manage projects on the go from anywhere in the world.",
      highlight: "iOS/Android"
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Secure admin features to manage users, assign roles, and control team access levels.",
      highlight: "Role-Based Access"
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Push notifications and real-time updates to keep everyone informed of project changes.",
      highlight: "Instant Alerts"
    }
  ];

  return (
    <section className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Additional <span className="gradient-text">Capabilities</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enhanced features that make DomusBuilder Hub the complete solution for expatriate construction management.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {additionalFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md card-hover text-center cursor-pointer"
              onClick={handleFeatureClick}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">{feature.description}</p>
              
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                {feature.highlight}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdditionalFeaturesSection;