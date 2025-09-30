import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SettingsCard from '@/components/settings/SettingsCard';
import SettingsRow from '@/components/settings/SettingsRow';
import { Bell, Palette, Globe, Shield, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState({
    emailSummary: true,
    taskUpdates: true,
    newComments: false,
    projectMilestones: true,
  });

  const [appearance, setAppearance] = useState({
    theme: 'system',
    accentColor: 'blue',
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAppearanceChange = (key, value) => {
    setAppearance(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveChanges = () => {
    toast({
      title: "Settings Saved!",
      description: "Your preferences have been updated successfully.",
    });
  };
  
  const handleNotImplemented = () => {
    toast({
        title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <title>{t('settingsPage.title')} - DomusBuilder Hub</title>
        <meta name="description" content={t('settingsPage.description')} />
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t('settingsPage.title')}</h1>
          <p className="mt-2 text-lg text-gray-600">{t('settingsPage.description')}</p>
        </div>

        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <SettingsCard
              icon={Palette}
              title={t('settingsPage.appearance.title')}
              description={t('settingsPage.appearance.description')}
            >
              <SettingsRow label={t('settingsPage.appearance.theme')}>
                <Select value={appearance.theme} onValueChange={(v) => handleAppearanceChange('theme', v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>
              <SettingsRow label={t('settingsPage.appearance.accentColor')} isLast>
                <div className="flex items-center gap-2">
                  {['blue', 'green', 'purple', 'orange'].map(color => (
                    <button
                      key={color}
                      onClick={() => handleAppearanceChange('accentColor', color)}
                      className={`w-8 h-8 rounded-full border-2 ${appearance.accentColor === color ? 'border-primary' : 'border-transparent'}`}
                    >
                      <div className={`w-full h-full rounded-full bg-${color}-500`}></div>
                    </button>
                  ))}
                </div>
              </SettingsRow>
            </SettingsCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SettingsCard
              icon={Bell}
              title={t('settingsPage.notifications')}
              description={t('settingsPage.notificationsDesc')}
            >
              <SettingsRow label={t('settingsPage.emailSummary')} description={t('settingsPage.emailSummaryDesc')}>
                <Switch checked={notifications.emailSummary} onCheckedChange={() => handleNotificationChange('emailSummary')} />
              </SettingsRow>
              <SettingsRow label={t('settingsPage.taskUpdates')} description={t('settingsPage.taskUpdatesDesc')}>
                <Switch checked={notifications.taskUpdates} onCheckedChange={() => handleNotificationChange('taskUpdates')} />
              </SettingsRow>
              <SettingsRow label={t('settingsPage.newComments')} description={t('settingsPage.newCommentsDesc')}>
                <Switch checked={notifications.newComments} onCheckedChange={() => handleNotificationChange('newComments')} />
              </SettingsRow>
              <SettingsRow label={t('settingsPage.projectMilestones')} description={t('settingsPage.projectMilestonesDesc')} isLast>
                <Switch checked={notifications.projectMilestones} onCheckedChange={() => handleNotificationChange('projectMilestones')} />
              </SettingsRow>
            </SettingsCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SettingsCard
              icon={Globe}
              title={t('settingsPage.language.title')}
              description={t('settingsPage.language.description')}
            >
              <SettingsRow label={t('settingsPage.language.displayLanguage')}>
                <Select defaultValue={i18n.language} onValueChange={(lang) => i18n.changeLanguage(lang)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="sw">Kiswahili</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>
              <SettingsRow label={t('settingsPage.language.timezone')} isLast>
                <Button variant="outline" onClick={handleNotImplemented}>Change Timezone</Button>
              </SettingsRow>
            </SettingsCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SettingsCard
              icon={Shield}
              title={t('settingsPage.security.title')}
              description={t('settingsPage.security.description')}
            >
              <SettingsRow label={t('settingsPage.security.changePassword')}>
                <Button variant="outline" onClick={handleNotImplemented}>Change Password</Button>
              </SettingsRow>
              <SettingsRow label={t('settingsPage.security.twoFactor')} description={t('settingsPage.security.twoFactorDesc')} isLast>
                <Button variant="outline" onClick={handleNotImplemented}>Enable 2FA</Button>
              </SettingsRow>
            </SettingsCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-destructive">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-destructive/10 text-destructive rounded-full flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-destructive">{t('settingsPage.dangerZone.title')}</CardTitle>
                    <CardDescription>{t('settingsPage.dangerZone.description')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button variant="destructive" onClick={handleNotImplemented}>{t('settingsPage.dangerZone.button')}</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex justify-end pt-4">
            <Button size="lg" onClick={handleSaveChanges}>
              {t('settingsPage.saveChanges')}
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SettingsPage;