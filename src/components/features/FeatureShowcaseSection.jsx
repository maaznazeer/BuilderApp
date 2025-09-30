import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
const FeatureShowcaseSection = () => {
  const navigate = useNavigate();
  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };
  return <section className="section-padding bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{
          opacity: 0,
          x: -30
        }} whileInView={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8
        }} className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              See Your Project Progress in Real-Time
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Get instant updates, track milestones, and monitor your construction project's progress from anywhere in the world with our comprehensive dashboard.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-yellow-300" />
                <span className="text-blue-100">Live progress tracking with photo documentation</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-yellow-300" />
                <span className="text-blue-100">Budget monitoring with real-time cost updates</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-yellow-300" />
                <span className="text-blue-100">Team communication and task management</span>
              </div>
            </div>
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 text-lg font-semibold rounded-full" onClick={handleNavigateToDashboard}>
              Explore Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          x: 30
        }} whileInView={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8
        }} className="relative">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-8 border border-white/20">
              <img className="w-full h-auto object-cover rounded-xl mb-6 shadow-2xl" alt="Construction project dashboard interface showing charts and progress bars" src="https://images.unsplash.com/photo-1639060015191-9d83063eab2a" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">Project Progress</span>
                  <span className="text-yellow-300 font-bold">78%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{
                  width: '78%'
                }}></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">$45K</div>
                    <div className="text-blue-100 text-sm">Budget Used</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">23</div>
                    <div className="text-blue-100 text-sm">Days Left</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
};
export default FeatureShowcaseSection;