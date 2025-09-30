import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { Link, useNavigate, useLocation } from 'react-router-dom';
    import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Chrome, Eye, EyeOff, Loader2 } from 'lucide-react';
    import FacebookIcon from '@/components/icons/FacebookIcon';
    import AppleIcon from '@/components/icons/AppleIcon';
    import { useTranslation } from 'react-i18next';
    import AuthLayout from '@/components/auth/AuthLayout.jsx';
    
    const LoginForm = ({
      email,
      setEmail,
      password,
      setPassword,
      showPassword,
      setShowPassword,
      isLoading,
      handleLogin,
      handleForgotPassword,
      handleOAuthLogin
    }) => {
      const { t } = useTranslation();
      return (
        <motion.div
          key="login-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6 text-2xl font-bold text-gray-800">
                DOMUS <span className="text-primary">builder</span>
            </Link>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome Back!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('login.description')}
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email_label')}</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={'user@example.com'} className="py-6"/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">{t('login.password_label')}</Label>
                <div className="relative">
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pr-10 py-6"/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700" aria-label={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox id="remember-me" />
                <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 font-normal">Remember me</Label>
              </div>
              <button type="button" onClick={handleForgotPassword} className="text-sm font-medium text-primary hover:text-primary/80">{t('login.forgot_password')}</button>
            </div>
    
            <div>
              <Button type="submit" size="lg" className="w-full py-6 text-base" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('login.loading')}</> : t('login.submit')}
              </Button>
            </div>
          </form>
    
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">{t('login.or_continue_with')}</span></div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="py-6" onClick={() => handleOAuthLogin('google')} disabled={isLoading}><Chrome className="h-5 w-5" /></Button>
            <Button variant="outline" className="py-6" onClick={() => handleOAuthLogin('facebook')} disabled={isLoading}><FacebookIcon className="h-5 w-5" /></Button>
            <Button variant="outline" className="py-6" onClick={() => handleOAuthLogin('apple')} disabled={isLoading}><AppleIcon className="h-5 w-5" /></Button>
          </div>
    
           <p className="pt-4 text-center text-sm text-gray-500">
            {t('login.no_account')}{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary/80">
              {t('login.signup_link')}
            </Link>
          </p>
        </motion.div>
      );
    };
    
    const LoginPage = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const navigate = useNavigate();
      const location = useLocation();
      const { signIn, signInWithOAuth, user, loading } = useAuth();
      const [isSubmitting, setIsSubmitting] = useState(false);
      const { t, i18n } = useTranslation();
      const currentLang = i18n.language;
    
      const from = location.state?.from?.pathname || '/dashboard';
    
      useEffect(() => {
        if (user) {
          navigate(from, { replace: true });
        }
      }, [user, navigate, from]);
    
      const handleLogin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await signIn(email, password);
        setIsSubmitting(false);
      };
      
      const handleForgotPassword = () => {
        navigate('/forgot-password');
      };
    
      const handleOAuthLogin = async (provider) => {
        setIsSubmitting(true);
        await signInWithOAuth(provider);
        setIsSubmitting(false);
      };
    
      if (loading && !user) {
        return null;
      }
    
      return (
        <>
          <Helmet>
            <html lang={currentLang} />
            <title>{t('login.title')} - DomusBuilder Hub</title>
            <meta name="description" content={t('login.description')} />
          </Helmet>
          <AuthLayout 
            imageFirst={true}
            imageUrl="https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/d581d01af5038cb1a4c40081b1da9ba6.jpg"
            imageAlt="Modern interior with a white table, chairs, and a laptop, bathed in sunlight"
            title="Build Beyond Limits."
            subtitle="Your vision, managed with precision. Welcome back."
          >
            <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                isLoading={isSubmitting}
                handleLogin={handleLogin}
                handleForgotPassword={handleForgotPassword}
                handleOAuthLogin={handleOAuthLogin}
              />
          </AuthLayout>
        </>
      );
    };
    
    export default LoginPage;