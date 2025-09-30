import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Users, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    role: 'homeowner',
    message: '',
    agreeToTerms: false,
  });

  const { toast } = useToast();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      toast({
        title: "Terms and Conditions",
        description: "You must agree to the terms and conditions to proceed.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "🚧 Contact Form Coming Soon!",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const subjectTopics = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'sales', label: 'Sales & Pricing' },
    { value: 'support', label: 'Technical Support' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'feedback', label: 'Feedback' }
  ];

  const projectRoles = [
    { value: 'homeowner', label: 'Homeowner' },
    { value: 'home_builder', label: 'Home Builder' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'other_inquiry', label: 'Other Inquiry' },
    { value: 'other', label: 'Other' },
  ];

  const supportOptions = [
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Get instant help with our live chat support",
      availability: "Available 24/7 for Premium users",
      action: "Start Chat"
    },
    {
      icon: Users,
      title: "Community Forum",
      description: "Connect with other users and share experiences",
      availability: "Active community discussions",
      action: "Join Forum"
    },
    {
      icon: Headphones,
      title: "Phone Support",
      description: "Speak directly with our technical experts",
      availability: "Business hours: 9 AM - 6 PM EST",
      action: "Schedule Call"
    }
  ];

  const offices = [
    {
      region: "North America",
      address: "123 Tech Street, Toronto, ON M5V 3A8, Canada",
      phone: "+1 (555) 123-4567",
      email: "na@domusbuilderhub.com"
    },
    {
      region: "Europe",
      address: "456 Innovation Ave, Berlin, 10115, Germany",
      phone: "+49 30 12345678",
      email: "eu@domusbuilderhub.com"
    },
    {
      region: "Africa",
      address: "789 Business District, Lagos, Nigeria",
      phone: "+234 1 234 5678",
      email: "africa@domusbuilderhub.com"
    }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            <p className="text-gray-600 mb-8">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="your@email.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Your phone number" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <select name="subject" value={formData.subject} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                    {subjectTopics.map((topic) => (<option key={topic.value} value={topic.value}>{topic.label}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role in Project</label>
                <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                  {projectRoles.map((role) => (<option key={role.value} value={role.value}>{role.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                <textarea name="message" value={formData.message} onChange={handleInputChange} required rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none" placeholder="Please provide details about your inquiry..."></textarea>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" name="agreeToTerms" checked={formData.agreeToTerms} onCheckedChange={(checked) => handleInputChange({ target: { name: 'agreeToTerms', type: 'checkbox', checked } })} />
                <label htmlFor="terms" className="text-sm text-gray-600">I agree to the <a href="#" className="underline text-blue-600 hover:text-blue-800">Terms and Conditions</a>.</label>
              </div>
              <Button type="submit" className="w-full btn-primary text-white py-3 text-lg font-semibold rounded-lg">
                Send Message
                <Send className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Other Ways to Get Help</h2>
              <p className="text-gray-600 mb-8">Prefer a different way to connect? We offer multiple support channels to meet your needs.</p>
            </div>
            <div className="space-y-6">
              {supportOptions.map((option, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 card-hover cursor-pointer" onClick={() => toast({ title: "🚧 Support Feature Coming Soon!", description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" })}>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <option.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{option.title}</h3>
                      <p className="text-gray-600 mb-2">{option.description}</p>
                      <p className="text-sm text-blue-600 font-semibold mb-3">{option.availability}</p>
                      <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">{option.action}</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Global Presence</h3>
              <div className="space-y-4">
                {offices.map((office, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">{office.region}</h4>
                    <p className="text-sm text-gray-600">{office.address}</p>
                    <p className="text-sm text-blue-600">{office.phone} • {office.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;