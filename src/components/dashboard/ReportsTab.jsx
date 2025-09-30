import React from 'react';
import { motion } from 'framer-motion';
import { FileDown, BarChart2, PieChart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ReportsTab = ({ projects, handleFeatureClick }) => {
  const reportTemplates = [
    { title: "Project Progress Report", icon: BarChart2, description: "Detailed overview of project milestones, tasks, and completion percentage." },
    { title: "Financial Summary", icon: PieChart, description: "Breakdown of budget vs. actual spending, including expense categories." },
    { title: "Monthly Activity Log", icon: Calendar, description: "A log of all activities, updates, and communications for a selected month." },
    { title: "Full Project Archive", icon: FileDown, description: "Comprehensive export of all project data, including files and photos." },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Generate Reports</h2>
        <p className="text-gray-600">Download comprehensive reports for your projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTemplates.map((report, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <report.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{report.title}</h3>
                <p className="text-gray-600 mt-1 mb-4">{report.description}</p>
                <Button onClick={() => handleFeatureClick(`Generate ${report.title}`)}>
                  <FileDown className="mr-2 h-4 w-4" /> Generate Report
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ReportsTab;