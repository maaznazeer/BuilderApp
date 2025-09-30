import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import ContactHero from '@/components/contact/ContactHero';
import ContactInfo from '@/components/contact/ContactInfo';
import ContactForm from '@/components/contact/ContactForm';
import ContactFaq from '@/components/contact/ContactFaq';

const ContactPage = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us - DomusBuilder Hub Platform</title>
        <meta name="description" content="Get in touch with DomusBuilder Hub team. We're here to help with your construction management needs. Contact us via email, phone, or live chat." />
      </Helmet>

      <ContactHero />
      <ContactInfo />
      <ContactForm />
      <ContactFaq />
    </>
  );
};

export default ContactPage;