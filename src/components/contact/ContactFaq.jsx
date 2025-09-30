import React from 'react';
import { motion } from 'framer-motion';

const ContactFaq = () => {
  const faqs = [
    {
      question: "How quickly do you respond to inquiries?",
      answer: "We respond to all inquiries within 24 hours during business days. Premium users get priority support with faster response times."
    },
    {
      question: "Do you offer phone support?",
      answer: "Yes, phone support is available during business hours (9 AM - 6 PM EST) for all users, with 24/7 availability for Premium subscribers."
    },
    {
      question: "Can I schedule a demo?",
      answer: "Absolutely! We offer personalized demos to show you how ALPHA Builder can help with your specific construction management needs."
    },
    {
      question: "Do you provide training?",
      answer: "Yes, we offer comprehensive onboarding and training sessions to help you get the most out of our platform."
    }
  ];

  return (
    <section className="section-padding bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Quick <span className="gradient-text">Answers</span>
          </h2>
          <p className="text-xl text-gray-600">
            Find answers to commonly asked questions before reaching out.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactFaq;