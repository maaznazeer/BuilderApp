import React from 'react';
import { motion } from 'framer-motion';
import { Home, Palette, Hammer, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const BuilderTypesSection = () => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();

  const builderTypes = [
    {
      icon: Home,
      title: t('builderTypes.homeBuilders'),
      description: t('builderTypes.homeBuildersDesc'),
      features: ["Project Planning", "Timeline Management", "Quality Control", "Team Coordination"],
      path: '/features/home-builders'
    },
    {
      icon: Palette,
      title: t('builderTypes.renovation'),
      description: t('builderTypes.renovationDesc'),
      features: ["Design Planning", "Material Selection", "Progress Tracking", "Budget Control"],
      path: '/features/renovation-experts'
    },
    {
      icon: Hammer,
      title: t('builderTypes.specialty'),
      description: t('builderTypes.specialtyDesc'),
      features: ["Specialized Tools", "Client Communication", "Project Scheduling", "Invoice Management"],
      path: '/features/specialty-contractors'
    }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('builderTypes.title').split(' ').slice(0, -2).join(' ')} <span className="gradient-text">{t('builderTypes.title').split(' ').slice(-2).join(' ')}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('builderTypes.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {builderTypes.map((type, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="feature-card rounded-2xl p-8 card-hover cursor-pointer flex flex-col"
              onClick={() => navigate(type.path)}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <type.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{type.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed flex-grow">{type.description}</p>
              <ul className="space-y-2">
                {type.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BuilderTypesSection;