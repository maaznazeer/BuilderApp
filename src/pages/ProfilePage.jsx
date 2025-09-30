import React, { useState, useEffect, useRef } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { useTranslation } from 'react-i18next';
    import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
    import { supabase } from '@/lib/customSupabaseClient';
    import { UploadCloud } from 'lucide-react';
    
    const ProfilePage = () => {
      const { t, i18n } = useTranslation('custom');
      const { user, profile, updateUser, loading } = useAuth();
      const { toast } = useToast();
      
      const [fullName, setFullName] = useState('');
      const [phone, setPhone] = useState('');
      const [avatarUrl, setAvatarUrl] = useState(null);
      const [uploading, setUploading] = useState(false);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const fileInputRef = useRef(null);
    
      useEffect(() => {
        if (profile) {
          setFullName(profile.full_name || '');
          setPhone(profile.phone || '');
          setAvatarUrl(profile.avatar_url || null);
        } else if (user) {
          setFullName(user.user_metadata?.full_name || '');
          setPhone(user.user_metadata?.phone || '');
          setAvatarUrl(user.user_metadata?.avatar_url || null);
        }
      }, [user, profile]);
    
      const getInitials = (name) => {
        if (!name) return 'DB';
        const names = name.split(' ');
        if (names.length > 1) {
          return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      };
    
      const handleAvatarClick = () => {
        fileInputRef.current.click();
      };
    
      const uploadAvatar = async (event) => {
        try {
          setUploading(true);
          if (!event.target.files || event.target.files.length === 0) {
            throw new Error('You must select an image to upload.');
          }
    
          const file = event.target.files[0];
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}.${fileExt}`;
          const filePath = `public/${fileName}`;
    
          let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
            upsert: true,
          });
    
          if (uploadError) {
            throw uploadError;
          }
    
          const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
          const publicUrl = data.publicUrl;
          
          await updateUser({ avatar_url: publicUrl });
          setAvatarUrl(publicUrl);
          toast({ title: "Avatar updated successfully!" });
    
        } catch (error) {
          toast({ title: "Error uploading avatar", description: error.message, variant: "destructive" });
        } finally {
          setUploading(false);
        }
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await updateUser({ full_name: fullName, phone });
        setIsSubmitting(false);
      };
    
      if (loading) {
        return (
          <div className="flex items-center justify-center h-full p-8">
            <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
          </div>
        );
      }
    
      return (
        <>
          <Helmet>
            <html lang={i18n.language} />
            <title>{t('profilePage.title')} - DomusBuilder Hub</title>
            <meta name="description" content={t('profilePage.description')} />
          </Helmet>
          
          <div className="p-6 sm:p-8">
            <CardHeader>
              <CardTitle>{t('profilePage.title')}</CardTitle>
              <CardDescription>{t('profilePage.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex items-center space-x-6">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 text-3xl cursor-pointer" onClick={handleAvatarClick}>
                      <AvatarImage src={avatarUrl} alt={fullName} />
                      <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <UploadCloud className="w-8 h-8 text-white" />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={uploadAvatar}
                      disabled={uploading}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{fullName || 'User'}</h3>
                    <p className="text-sm text-gray-500 capitalize">{profile?.app_role || 'N/A'}</p>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleAvatarClick} disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Change Photo'}
                    </Button>
                  </div>
                </div>
    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('profilePage.email')}</Label>
                    <Input id="email" type="email" value={user?.email || ''} disabled className="bg-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('profilePage.fullName')}</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('profilePage.fullNamePlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('profilePage.phone')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('profilePage.phonePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                      <Label>{t('profilePage.role')}</Label>
                      <Input value={profile?.app_role || 'N/A'} disabled className="bg-gray-100 capitalize" />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={isSubmitting || uploading}>
                    {isSubmitting ? t('profilePage.saving') : t('profilePage.saveChanges')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </div>
        </>
      );
    };
    
    export default ProfilePage;