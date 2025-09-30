import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const token = searchParams.get('token');
    // Simulate token validation. In a real app, this would be an API call.
    if (token === 'VALID_RESET_TOKEN') {
      setIsValidToken(true);
    } else {
      setIsValidToken(false);
      toast({
        title: "Invalid or Expired Link",
        description: "The password reset link is not valid. Please request a new one.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password Too Short", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords Do Not Match", description: "Please ensure your passwords match.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    // Simulate API call to reset password
    setTimeout(() => {
      toast({
        title: "Password Reset Successfully",
        description: "You can now log in with your new password.",
      });
      setIsLoading(false);
      navigate('/admin-login');
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>{t('reset_password.title')} - DomusBuilder Hub</title>
        <meta name="description" content={t('reset_password.description')} />
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <KeyRound className="mx-auto h-12 w-auto text-blue-600" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              {t('reset_password.title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('reset_password.subtitle')}
            </p>
          </div>
          {isValidToken ? (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="password">{t('profile.new_password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
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
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('reset_password.loading') : t('reset_password.submit')}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700">This link is invalid or has expired.</p>
                <Link to="/forgot-password">
                    <Button variant="link" className="mt-2">Request a new link</Button>
                </Link>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ResetPasswordPage;