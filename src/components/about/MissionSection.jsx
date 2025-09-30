import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Heart, Users, Target } from 'lucide-react';

const MissionSection = () => {
  const values = [
    {
      icon: Globe,
      title: "Global Accessibility",
      description: "We believe distance shouldn't be a barrier to building your dream home. Our platform connects expatriates with their construction projects worldwide."
    },
    {
      icon: Heart,
      title: "Empathy-Driven Design",
      description: "Built by expatriates, for expatriates. We understand the unique challenges of managing construction projects from thousands of miles away."
    },
    {
      icon: Users,
      title: "Community First",
      description: "We foster a community of builders, contractors, and expatriates who support each other in achieving their construction goals."
    },
    {
      icon: Target,
      title: "Results-Oriented",
      description: "Every feature is designed with one goal in mind: helping you successfully complete your construction project on time and within budget."
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
            Our <span className="gradient-text">Mission</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            To empower expatriates worldwide with the tools and confidence they need to successfully manage construction projects in their home countries, regardless of distance or time zones.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto">
                <value.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;