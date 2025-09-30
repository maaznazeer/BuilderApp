import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

const VisionSection = () => {
  return (
    <section className="section-padding bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-300" />
              <span className="text-yellow-300 font-semibold text-lg">Our Vision</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              A World Where Distance Doesn't Limit Dreams
            </h2>
            
            <p className="text-xl text-blue-100 leading-relaxed">
              We envision a future where every expatriate can confidently build their dream home in their homeland, supported by technology that bridges geographical gaps and cultural understanding.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-300 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-blue-100">Expanding to serve expatriate communities in every continent</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-300 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-blue-100">Building partnerships with local contractors and suppliers worldwide</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-300 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-blue-100">Developing AI-powered tools for predictive project management</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <img  
              className="w-full h-96 object-cover rounded-2xl shadow-2xl" 
              alt="Global construction management vision"
             src="https://images.unsplash.com/photo-1477426691505-4bf455d0e04e" />
            
            <div className="absolute -top-6 -right-6 bg-yellow-400 rounded-xl p-4 shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">2025</div>
                <div className="text-sm text-gray-700">Global Launch</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;