import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, MessageSquare, MapPin, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const OperationsSection = () => {
  const { toast } = useToast();
  const { t } = useTranslation('home');
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const operations = [
    {
      icon: BarChart3,
      title: t('operations.dashboard'),
      description: t('operations.dashboardDesc'),
      color: "from-primary to-cyan-500",
      path: '/dashboard?tab=overview'
    },
    {
      icon: DollarSign,
      title: t('operations.financial'),
      description: t('operations.financialDesc'),
      color: "from-green-500 to-emerald-500",
      path: '/dashboard?tab=finance'
    },
    {
      icon: MessageSquare,
      title: t('operations.communication'),
      description: t('operations.communicationDesc'),
      color: "from-orange-500 to-pink-500",
      path: '/dashboard?tab=communication'
    },
    {
      icon: MapPin,
      title: t('operations.logistics'),
      description: t('operations.logisticsDesc'),
      color: "from-orange-500 to-red-500",
      path: '/dashboard?tab=sourcing'
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
            <span className="gradient-text">{t('operations.title')}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('operations.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {operations.map((operation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg card-hover cursor-pointer"
              onClick={() => handleNavigation(operation.path)}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${operation.color} rounded-2xl flex items-center justify-center mb-6`}>
                <operation.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{operation.title}</h3>
              <p className="text-gray-600 leading-relaxed">{operation.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OperationsSection;