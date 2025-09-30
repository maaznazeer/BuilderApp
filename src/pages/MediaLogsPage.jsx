import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient';
import SiteMonitoringTab from '@/components/dashboard/site-monitoring/SiteMonitoringTab.jsx';
import { useOutletContext } from 'react-router-dom';

const MediaLogsPage = () => {
  const { onProjectAdded } = useOutletContext();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoadingProjects(true);
    const { data, error } = await supabase
        .from('projects')
        .select('id, name') // Only fetch id and name for project filter
        .eq('owner_id', user.id) // Assuming owner_id is the user's id
        .order('created_at', { ascending: false });

    if (error) {
        toast({ title: "Error fetching projects", description: error.message, variant: "destructive" });
        setProjects([]);
    } else {
        setProjects(data);
    }
    setLoadingProjects(false);
  }, [user, toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, onProjectAdded]);

  return (
    <>
      <Helmet>
        <html lang={currentLang} />
        <title>Media Logs - DomusBuilder Hub</title>
        <meta name="description" content="View timestamped photos and videos from your construction sites." />
        <meta property="og:title" content="Media Logs - DomusBuilder Hub" />
        <meta property="og:description" content="View timestamped photos and videos from your construction sites." />
      </Helmet>
      <SiteMonitoringTab projects={projects} />
    </>
  );
};

export default MediaLogsPage;