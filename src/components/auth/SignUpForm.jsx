import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Chrome, Eye, EyeOff, Loader2 } from 'lucide-react';
import GoogleIcon from '@/components/icons/GoogleIcon';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [role, setRole] = useState('homeowner');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, signInWithOAuth } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  }

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!agreed) {
        toast({ title: "Agreement Required", description: "You must agree to the terms and privacy policy.", variant: "destructive" });
        return;
    }
    if (formData.password.length < 8) {
        toast({ title: "Password Too Short", description: "Password must be at least 8 characters long.", variant: "destructive" });
        return;
    }
    if (formData.password !== formData.confirmPassword) {
        toast({ title: "Passwords Do Not Match", description: "Please ensure your passwords match.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    await signUp(formData.fullName, formData.email, formData.password, role, formData.phone);
    setIsLoading(false);
  };
  
  const handleOAuthLogin = async (provider) => {
    // Pre-prompt role selection then continue to OAuth
    navigate(`/select-role?next=oauth&provider=${encodeURIComponent(provider)}&pref=${encodeURIComponent(role)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <form onSubmit={handleSignUp} className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
          <div className="lg:col-span-2 text-center mb-4">
              <Link to="/" className="inline-block mb-4 text-3xl font-bold text-gray-800">
                  DOMUS <span className="text-primary">builder</span>
              </Link>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  Create Your Account
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                  {t('signup.description')}
              </p>
          </div>
          
          <div className="flex flex-col space-y-6">
              <div className="space-y-2">
                  <Label htmlFor="fullName">{t('signup.name_label')}</Label>
                  <Input id="fullName" name="fullName" type="text" required value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="py-6" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="email">{t('signup.email_label')}</Label>
                  <Input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} placeholder="you@example.com" className="py-6" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="role">I am a...</Label>
                  <Select onValueChange={setRole} defaultValue={role}>
                      <SelectTrigger id="role" className="py-6">
                          <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="homebuilder">Homebuilder</SelectItem>
                          <SelectItem value="homeowner">Homeowner</SelectItem>
                          <SelectItem value="subcontractor">Subcontractor</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
          </div>

          <div className="flex flex-col space-y-6">
              <div className="space-y-2">
                  <Label htmlFor="password">{t('signup.password_label')}</Label>
                  <div className="relative">
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange} placeholder="Minimum 8 characters" className="pr-10 py-6" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700">
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} required value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" className="py-6"/>
              </div>
              <div className="flex items-start space-x-3 pt-2">
                  <Checkbox id="terms" checked={agreed} onCheckedChange={setAgreed} className="mt-1" />
                  <label htmlFor="terms" className="text-sm font-normal text-gray-700">
                      {t('signup.agree_terms')}{' '}
                      <a href="#" className="font-medium text-blue-600 hover:underline">{t('signup.terms_link')}</a> {t('signup.and')}{' '}
                      <a href="#" className="font-medium text-blue-600 hover:underline">{t('signup.privacy_link')}</a>.
                  </label>
              </div>
              <div className="pt-2">
                  <Button type="submit" size="lg" className="w-full py-6 text-base" disabled={isLoading || !agreed}>
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('signup.loading')}</> : 'Create Account'}
                  </Button>
              </div>
          </div>
          
          <div className="lg:col-span-2">
              <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                  <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">{t('signup.or_signup_with')}</span></div>
              </div>
              <div className="w-full">
                  <Button variant="outline" className="w-full py-6" onClick={() => handleOAuthLogin('google')} disabled={isLoading}>Sign up with Google <GoogleIcon className="h-5 w-5 ml-5" /></Button>
              </div>
               <p className="mt-6 text-center text-sm text-gray-500">
                  {t('signup.has_account')}{' '}
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  {t('signup.signin_link')}
                  </Link>
              </p>
          </div>
      </form>
    </motion.div>
  );
};

export default SignUpForm;
