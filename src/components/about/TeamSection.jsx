import React from 'react';
import { motion } from 'framer-motion';

const TeamSection = () => {
  const team = [
    {
      name: "Kwame Asante",
      role: "Founder & CEO",
      background: "Software Engineer turned entrepreneur after struggling to manage his family home construction in Ghana while working in Germany.",
      image: "Professional African man in business attire with construction background"
    },
    {
      name: "Amina Hassan",
      role: "Head of Product",
      background: "Former project manager with 10+ years in construction, now based in Canada, passionate about solving expatriate challenges.",
      image: "Professional African woman in business attire with architectural plans"
    },
    {
      name: "Joseph Okafor",
      role: "Head of Engineering",
      background: "Tech lead with expertise in mobile-first platforms, understands the importance of accessible technology for global users.",
      image: "Professional African man with engineering background and technology focus"
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
            Meet Our <span className="gradient-text">Team</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Passionate expatriates and industry experts dedicated to solving real-world construction management challenges.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg text-center card-hover"
            >
              <img  
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover" 
                alt={`${member.name} - ${member.role}`}
               src="https://images.unsplash.com/photo-1644424235476-295f24d503d9" />
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
              <p className="text-blue-600 font-semibold mb-4">{member.role}</p>
              <p className="text-gray-600 leading-relaxed">{member.background}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;