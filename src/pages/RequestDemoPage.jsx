import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import RequestDemoForm from '@/components/demo/RequestDemoForm';
import { CheckCircle, Users, Clock } from 'lucide-react';

const RequestDemoPage = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Personalized Walkthrough",
      description: "Get a live demo tailored to your specific business needs and workflow."
    },
    {
      icon: Users,
      title: "Expert Consultation",
      description: "Our specialists will answer all your questions and show you how to get the most out of our platform."
    },
    {
      icon: CheckCircle,
      title: "No-Obligation",
      description: "Explore all the features with no commitment. See the value for yourself before deciding."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Request a Demo - DomusBuilder Hub</title>
        <meta name="description" content="Schedule a personalized demo of the DomusBuilder Hub platform and see how it can transform your construction projects." />
      </Helmet>
      <div className="bg-gray-50">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 hero-pattern opacity-10"></div>
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                See DomusBuilder in Action
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600">
                Schedule a free, personalized demo with one of our product experts to see how our platform can streamline your construction management process.
              </p>
            </motion.div>
          </div>
        </div>

        <main className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <RequestDemoForm />
                </motion.div>
              </div>
              <div className="mt-12 lg:mt-0 lg:col-span-5">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="space-y-10"
                >
                  <h2 className="text-3xl font-bold text-gray-900">What to expect in your demo:</h2>
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          <benefit.icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{benefit.title}</h3>
                        <p className="mt-2 text-base text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <p className="text-lg font-semibold text-gray-900">"The demo was incredibly insightful. It showed us exactly how DomusBuilder could solve our project tracking headaches."</p>
                    <p className="mt-4 text-base text-gray-600">- Alex Johnson, Project Manager at BuildWell Inc.</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default RequestDemoPage;