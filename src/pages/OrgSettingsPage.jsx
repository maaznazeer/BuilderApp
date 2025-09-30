import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { hasMinRole, hasScopeIfIntegrator } from '@/lib/rbac.js';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const OrgSettingsPage = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { profile } = useAuth();
    const navigate = useNavigate();

    const editorRef = useRef(null);
    const saveBtnRef = useRef(null);
    const statusElRef = useRef(null);
    const badgeRef = useRef(null);

    useEffect(() => {
        const runPageLogic = async () => {
            if (!profile) return;

            const canView = hasMinRole(profile.app_role, 'viewer');

            if (!canView) {
                toast({ variant: 'destructive', title: 'Permission Denied' });
                navigate('/dashboard');
                return;
            }

            const canEdit = hasMinRole(profile.app_role, 'manager') || 
                            (profile.app_role === 'integrator' && hasScopeIfIntegrator(profile.app_role, profile.scopes, 'settings'));

            const editor = editorRef.current;
            const saveBtn = saveBtnRef.current;
            const statusEl = statusElRef.current;
            const badge = badgeRef.current;

            if (!editor || !saveBtn || !statusEl || !badge) return;

            if (!canEdit) {
                saveBtn.style.display = 'none';
                editor.readOnly = true;
                badge.textContent = 'Read-only';
            } else {
                 badge.textContent = 'Editable';
            }
            
            try {
                const { data: settingsData, error: settingsError } = await supabase.from('app_settings').select('key, value');
                
                if(settingsError) throw settingsError;

                const settingsObj = settingsData.reduce((acc, { key, value }) => {
                    acc[key] = value;
                    return acc;
                }, {});

                editor.value = JSON.stringify(settingsObj ?? {}, null, 2);

            } catch(error) {
                toast({ variant: 'destructive', title: 'Error loading settings', description: error.message });
            }
        };

        runPageLogic();

    }, [profile, toast, navigate]);

    const handleSave = async () => {
        const editor = editorRef.current;
        const statusEl = statusElRef.current;
        if (!editor || !statusEl) return;
        
        statusEl.textContent = 'Saving...';
        let payload;
        try {
            payload = JSON.parse(editor.value);
        } catch {
            statusEl.textContent = 'Invalid JSON. Please fix and try again.';
            return;
        }

        const updates = Object.entries(payload).map(([key, value]) => 
            supabase.from('app_settings').upsert({ key, value }, { onConflict: 'key' })
        );

        try {
            await Promise.all(updates);
            statusEl.textContent = 'Settings updated ✓';
            toast({ title: 'Settings saved successfully!' });
            setTimeout(() => { statusEl.textContent = ''; }, 3000);
        } catch(error) {
            const updateError = error.details || error.message;
            statusEl.textContent = `Error: ${updateError}`;
            toast({ variant: 'destructive', title: 'Error saving settings', description: updateError });
        }
    };


    return (
        <>
            <Helmet>
                <title>{t('orgSettingsPage.title', 'Organization Settings')} - DomusBuilder Hub</title>
                <meta name="description" content={t('orgSettingsPage.description', 'Manage your organization settings.')} />
            </Helmet>
            <motion.div 
                className="p-4 sm:p-6 lg:p-8"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }}
            >
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Organization Settings <small id="settings-badge" ref={badgeRef} className="text-sm font-medium text-gray-500 ml-2"></small>
                    </h2>
                    <textarea 
                        id="settings-json" 
                        ref={editorRef}
                        rows="18" 
                        className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Loading settings..."
                    ></textarea>
                    <button 
                        id="settings-save"
                        ref={saveBtnRef}
                        onClick={handleSave}
                        data-action="edit-settings" 
                        className="mt-3 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                    >
                        Save Settings
                    </button>
                    <div id="settings-status" ref={statusElRef} className="mt-2 text-sm text-gray-600 min-h-[20px]"></div>
                </div>
            </motion.div>
        </>
    );
};

export default OrgSettingsPage;