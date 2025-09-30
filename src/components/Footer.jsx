import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Footer = () => {
  const { t } = useTranslation(['translation']);
  const { user } = useAuth();

  const quickLinks = [
    { name: t('navbar.home'), path: '/' },
    { name: t('navbar.features'), path: '/features' },
    { name: t('navbar.pricing'), path: '/pricing' },
    { name: t('navbar.contact'), path: '/contact' },
  ];
  
  const legalLinks = [
    { name: t('footer.privacy'), path: '#' },
    { name: t('footer.terms'), path: '#' },
  ];

  if (user) {
    legalLinks.push({ name: 'View AI Log', path: '/dashboard/ai-log' });
  }

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center">
                 <Link to="/" className="flex items-baseline space-x-1 flex-shrink-0">
                    <span className="font-poppins text-xl lg:text-2xl font-bold text-gray-900">DOMUS</span>
                    <span className="font-poppins text-xl lg:text-2xl font-light text-primary">builder</span>
                </Link>
            </div>
            <div className="flex items-center space-x-6">
              {quickLinks.map((link, index) => (
                <Link key={index} to={link.path} className="text-sm text-slate-600 hover:text-primary transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
             <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="text-slate-400 hover:text-primary transition-colors duration-200"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500 gap-4">
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center space-x-6">
            {legalLinks.map((link, index) => (
                <Link key={index} to={link.path} className="hover:text-primary transition-colors">
                  {link.name}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;