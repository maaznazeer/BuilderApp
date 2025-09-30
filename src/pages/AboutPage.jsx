import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AboutHeroSection from '@/components/about/AboutHeroSection';
import MissionSection from '@/components/about/MissionSection';
import StatsSection from '@/components/about/StatsSection';
import TimelineSection from '@/components/about/TimelineSection';
import TeamSection from '@/components/about/TeamSection';
import VisionSection from '@/components/about/VisionSection';

const AboutPage = () => {
  const navigate = useNavigate();

  const handleStartProjectClick = () => {
    navigate('/signup');
  };

  const handleContactClick = () => {
    navigate('/contact');
  };

  return (
    <>
      <Helmet>
        <title>About Us - ALPHA Home Builder Platform</title>
        <meta name="description" content="Learn about ALPHA Builder's mission to empower expatriates in managing construction projects remotely. Founded by expatriates, for expatriates worldwide." />
      </Helmet>

      <AboutHeroSection />
      <div id="our-story">
        <MissionSection />
      </div>
      <StatsSection />
      <TimelineSection />
      <div id="meet-the-team">
        <TeamSection />
      </div>
      <VisionSection />

      {/* CTA Section */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Join Our Mission
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Be part of a community that's revolutionizing how expatriates manage construction projects. Your success story could be next.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="btn-primary text-white px-8 py-4 text-lg font-semibold rounded-full"
                onClick={handleStartProjectClick}
              >
                Start Your Project
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-full"
                onClick={handleContactClick}
              >
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;