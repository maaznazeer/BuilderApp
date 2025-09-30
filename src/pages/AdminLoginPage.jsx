import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const loggedInUser = await login(email, password);
    setIsLoading(false);
    
    if (loggedInUser && loggedInUser.role === 'admin') {
      navigate('/admin');
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid credentials or not an admin account.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('admin_login.title')} - DomusBuilder Hub</title>
        <meta name="description" content={t('admin_login.description')} />
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <Shield className="mx-auto h-12 w-auto text-blue-600" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              {t('admin_login.title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('admin_login.subtitle')}
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('login.password_label')}</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="text-sm text-right">
              <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                {t('login.forgot_password')}
              </Link>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('login.loading') : t('login.submit')}
              </Button>
            </div>
          </form>
           <p className="pt-4 text-center text-sm text-gray-500">
            {t('admin_login.not_admin')}{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              {t('admin_login.user_login_link')}
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default AdminLoginPage;