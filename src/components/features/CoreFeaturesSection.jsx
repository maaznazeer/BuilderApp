import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, DollarSign, MessageSquare, Camera, Calendar, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CoreFeaturesSection = () => {
  const navigate = useNavigate();

  const handleFeatureClick = (path) => {
    navigate(path);
  };

  const coreFeatures = [
    {
      key: "dashboard",
      icon: BarChart3,
      title: "Project Management Dashboard",
      description: "Comprehensive dashboard to plan, track, and complete projects with ease. Visual progress tracking and milestone management.",
      features: ["Gantt Charts", "Task Assignment", "Progress Tracking", "Milestone Management"],
      color: "from-blue-500 to-cyan-500",
      path: "/dashboard?tab=projects",
      implemented: true,
    },
    {
      key: "budget",
      icon: DollarSign,
      title: "Smart Budget & Financial Tracking",
      description: "Advanced financial management tools to improve cash flow and boost your bottom line with real-time budget monitoring.",
      features: ["Budget Segmentation", "Expense Tracking", "Cost Overrun Alerts", "Financial Reports"],
      color: "from-green-500 to-emerald-500",
      path: "/dashboard?tab=budget",
      implemented: true,
    },
    {
      key: "communication",
      icon: MessageSquare,
      title: "Communication Hub",
      description: "Keep your team, clients, and subcontractors connected in real-time with integrated messaging and collaboration tools.",
      features: ["Real-time Chat", "File Sharing", "Video Calls", "Team Notifications"],
      color: "from-purple-500 to-pink-500",
      path: "/dashboard?tab=communication",
      implemented: true,
    },
    {
      key: "monitoring",
      icon: Camera,
      title: "Remote Site Monitoring",
      description: "Upload images and videos by site supervisors with weekly logs and timestamps for complete project visibility.",
      features: ["Photo Documentation", "Video Updates", "Progress Reports", "Quality Control"],
      color: "from-orange-500 to-red-500",
      path: "/dashboard?tab=site-monitoring",
      implemented: true,
    },
    {
      key: "planning",
      icon: Calendar,
      title: "Milestone-Based Planning",
      description: "Predefined construction phase templates with visual color-coded progress bars and task assignments.",
      features: ["Phase Templates", "Visual Progress", "Task Assignment", "Deadline Tracking"],
      color: "from-indigo-500 to-purple-500",
      path: "/dashboard/planner",
      implemented: true,
    },
    {
      key: "risk",
      icon: Shield,
      title: "Risk & Contingency Management",
      description: "Simulate risks such as delays, inflation, and material costs. Set and manage contingency thresholds effectively.",
      features: ["Risk Assessment", "Contingency Planning", "Cost Simulation", "Alert System"],
      color: "from-red-500 to-pink-500",
      path: "/dashboard?tab=risk",
      implemented: true,
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
            Core <span className="gradient-text">Features</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools designed to address every aspect of remote construction management.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {coreFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 flex flex-col"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed flex-grow">{feature.description}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {feature.features.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => handleFeatureClick(feature.path)}
                className="mt-auto w-full font-semibold btn-primary text-white"
              >
                Explore Feature
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreFeaturesSection;