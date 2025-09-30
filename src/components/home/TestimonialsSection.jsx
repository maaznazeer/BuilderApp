import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TestimonialsSection = () => {
  const { t } = useTranslation('home');

  const testimonials = [
    {
      name: "Kwame Asante",
      role: "Expatriate in Germany",
      content: "DomusBuilder Hub helped me manage my family home construction in Ghana remotely. The real-time updates and budget tracking saved me thousands!",
      rating: 5
    },
    {
      name: "Amina Hassan",
      role: "Professional in Canada",
      content: "As someone living abroad, this platform gave me peace of mind. I could monitor every aspect of my home renovation from Toronto.",
      rating: 5
    },
    {
      name: "Joseph Okafor",
      role: "Contractor in Nigeria",
      content: "The communication features are incredible. My clients abroad can see progress in real-time and approve changes instantly.",
      rating: 5
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
            {t('testimonials.title').split(' ').slice(0, -1).join(' ')} <span className="gradient-text">{t('testimonials.title').split(' ').slice(-1).join(' ')}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('testimonials.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg card-hover"
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;