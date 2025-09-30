import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call to send reset link
    setTimeout(() => {
      // In a real app, you would check if the email exists and is an admin.
      // For this mock, we'll always show success to prevent email enumeration.
      toast({
        title: t('forgot_password.toast_title'),
        description: t('forgot_password.toast_description', { email }),
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>{t('forgot_password.title')} - DomusBuilder Hub</title>
        <meta name="description" content={t('forgot_password.description')} />
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <Mail className="mx-auto h-12 w-auto text-blue-600" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              {t('forgot_password.title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('forgot_password.subtitle')}
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email_label')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            
            <div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('forgot_password.loading') : t('forgot_password.submit')}
              </Button>
            </div>
          </form>
          <div className="text-center">
            <Link to="/admin-login" className="font-medium text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('forgot_password.back_to_login')}
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;