import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const OnboardingPage = () => {
  const { t, i18n } = useTranslation();
  const { user, updateUser, refreshSession } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    phone: '',
  });
  const [requestedRole, setRequestedRole] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || user.user_metadata?.full_name || '',
        company: user.company || '',
        phone: user.phone || user.user_metadata?.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !requestedRole) {
      toast({
        variant: 'destructive',
        title: t('onboarding.form.validation.title'),
        description: t('onboarding.form.validation.description'),
      });
      return;
    }
    setLoading(true);

    try {
      await updateUser(formData);

      toast({
        title: t('onboarding.success.title'),
        description: t('onboarding.success.description'),
      });
      
      await refreshSession();

    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        variant: 'destructive',
        title: t('onboarding.error.title'),
        description: error.message || t('onboarding.error.description'),
      });
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <title>{t('onboarding.meta.title')}</title>
        <meta name="description" content={t('onboarding.meta.description')} />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">{t('onboarding.header.title')}</CardTitle>
              <CardDescription className="text-center">{t('onboarding.header.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('onboarding.form.fullName.label')}</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder={t('onboarding.form.fullName.placeholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestedRole">{t('onboarding.form.role.label')}</Label>
                  <Select onValueChange={setRequestedRole} value={requestedRole} required>
                    <SelectTrigger id="requestedRole">
                      <SelectValue placeholder={t('onboarding.form.role.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Homeowner">{t('roles.homeowner')}</SelectItem>
                      <SelectItem value="Homebuilder">{t('roles.homebuilder')}</SelectItem>
                      <SelectItem value="Subcontractor">{t('roles.subcontractor')}</SelectItem>
                      <SelectItem value="Auditor">{t('roles.auditor')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">{t('onboarding.form.company.label')}</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder={t('onboarding.form.company.placeholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('onboarding.form.phone.label')}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('onboarding.form.phone.placeholder')}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {t('onboarding.form.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default OnboardingPage;