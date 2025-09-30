import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { useNavigate } from 'react-router-dom';
    import i18n from '@/i18n';

    const AuthContext = createContext(undefined);

    export const AuthProvider = ({ children }) => {
      const { toast } = useToast();
      const navigate = useNavigate();

      const [user, setUser] = useState(null);
      const [profile, setProfile] = useState(null);
      const [session, setSession] = useState(null);
      const [loading, setLoading] = useState(true);
      const [plan, setPlan] = useState(null);
      const [features, setFeatures] = useState({});
      const [limits, setLimits] = useState({});
      const [trialStatus, setTrialStatus] = useState({ is_active: false, days_left: 0 });
      const [initializationError, setInitializationError] = useState(null);

      const clearState = useCallback(() => {
          setUser(null);
          setProfile(null);
          setSession(null);
          setPlan(null);
          setFeatures({});
          setLimits({});
          setTrialStatus({ is_active: false, days_left: 0 });
          setInitializationError(null);
          setLoading(false);
      }, []);
      
      const signOut = useCallback(async () => {
        setLoading(true);
        await supabase.auth.signOut();
        clearState();
        navigate('/login', { replace: true });
        setLoading(false);
      }, [clearState, navigate]);

      const initializeUserSession = useCallback(async (currentSession) => {
        setLoading(true);
        setInitializationError(null);

        if (!currentSession?.user) {
          clearState();
          setLoading(false);
          return;
        }

        try {
          setSession(currentSession);
          
          const { data: profileData, error: ensureError } = await supabase.rpc('ensure_profile');
          if (ensureError) {
            if (ensureError.message.toLowerCase().includes('jwt expired')) {
                await signOut();
                throw new Error('Your session has expired. Please log in again.');
            }
            throw new Error(`Initialization Failed: ${ensureError.message}`);
          }
          
          const ensuredProfileResult = profileData[0];
          if (!ensuredProfileResult) {
            throw new Error('Could not retrieve user profile after ensuring it exists.');
          }
          
          const fullProfile = {
            id: ensuredProfileResult.profile_id,
            email: ensuredProfileResult.profile_email,
            full_name: ensuredProfileResult.profile_full_name,
            app_role: ensuredProfileResult.profile_app_role,
            role: ensuredProfileResult.profile_role,
            plan_tier: ensuredProfileResult.profile_plan_tier,
            preferred_language: ensuredProfileResult.preferred_language
          };

          // If we came from pre-auth role selection for OAuth, apply it once here
          const pendingRole = localStorage.getItem('pendingOAuthRole');
          const pendingSource = localStorage.getItem('pendingOAuthSource');
          if (pendingRole && pendingSource === 'signup') {
            const enumMap = { homebuilder: 'Homebuilder', homeowner: 'Homeowner', subcontractor: 'Subcontractor' };
            const appRoleEnum = enumMap[String(pendingRole)] || 'Homeowner';
            try {
              await supabase.auth.updateUser({ data: { app_role: appRoleEnum } });
              await supabase
                .from('profiles')
                .update({ app_role: appRoleEnum, role: 'member' })
                .eq('id', currentSession.user.id);
              fullProfile.app_role = appRoleEnum;
              fullProfile.role = 'member';
            } catch {}
            localStorage.removeItem('pendingOAuthRole');
            localStorage.removeItem('pendingOAuthSource');
          }

          const fullUser = { ...currentSession.user, ...fullProfile };
          setUser(fullUser);
          setProfile(fullProfile);

          if (fullProfile.preferred_language && i18n.language !== fullProfile.preferred_language) {
            i18n.changeLanguage(fullProfile.preferred_language);
          }

          const [planResult, trialResult] = await Promise.all([
            supabase.rpc('get_user_plan', { p_user_id: currentSession.user.id }),
            supabase.rpc('is_on_active_trial', { p_user_id: currentSession.user.id })
          ]);

          const { data: planData, error: planError } = planResult;
          if (planError) throw new Error(`Failed to load plan: ${planError.message}`);
          
          if (planData && planData.length > 0) {
            const userPlan = planData[0];
            setPlan(userPlan.plan_name?.toLowerCase());
            setFeatures(userPlan.features || {});
            setLimits(userPlan.limits || {});
          } else {
            setPlan('freemium');
            setFeatures({});
            setLimits({});
          }

          const { data: trialData, error: trialError } = trialResult;
          if (trialError) {
            console.error("Failed to load trial status:", trialError.message);
            setTrialStatus({ is_active: false, days_left: 0 });
          } else {
            setTrialStatus(trialData[0] || { is_active: false, days_left: 0 });
          }

          await supabase.rpc('sync_profile_email');

        } catch (error) {
          console.error("Error during user initialization:", error);
          setInitializationError(error.message);
          toast({
            variant: "destructive",
            title: "Initialization Failed",
            description: error.message,
          });
        } finally {
          setLoading(false);
        }
      }, [toast, clearState, signOut]);

      useEffect(() => {
        const checkInitialSession = async () => {
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          if (initialSession) {
            await initializeUserSession(initialSession);
            // If coming from signup OAuth and a role was chosen, apply it once
            const pendingRole = localStorage.getItem('pendingOAuthRole');
            const pendingSource = localStorage.getItem('pendingOAuthSource');
            if (pendingRole && pendingSource === 'signup') {
              try {
                const enumMap = { homebuilder: 'Homebuilder', homeowner: 'Homeowner', subcontractor: 'Subcontractor' };
                const appRoleEnum = enumMap[pendingRole] || 'Homeowner';
                await supabase.auth.updateUser({ data: { app_role: appRoleEnum } });
                await supabase.from('profiles').update({ app_role: appRoleEnum, role: 'member' }).eq('id', initialSession.user.id);
              } catch {}
              localStorage.removeItem('pendingOAuthRole');
              localStorage.removeItem('pendingOAuthSource');
            }
          } else {
            setLoading(false);
          }
        };
        
        checkInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (_event === 'SIGNED_OUT') {
                clearState();
                navigate('/login', { replace: true });
            } else if (session && (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED' || _event === "USER_UPDATED")) {
                await initializeUserSession(session);
                const pendingRole2 = localStorage.getItem('pendingOAuthRole');
                const pendingSource2 = localStorage.getItem('pendingOAuthSource');
                if (pendingRole2 && pendingSource2 === 'signup') {
                  try {
                    const enumMap = { homebuilder: 'Homebuilder', homeowner: 'Homeowner', subcontractor: 'Subcontractor' };
                    const appRoleEnum = enumMap[pendingRole2] || 'Homeowner';
                    await supabase.auth.updateUser({ data: { app_role: appRoleEnum } });
                    await supabase.from('profiles').update({ app_role: appRoleEnum, role: 'member' }).eq('id', session.user.id);
                  } catch {}
                  localStorage.removeItem('pendingOAuthRole');
                  localStorage.removeItem('pendingOAuthSource');
                }
            }
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      }, [initializeUserSession, clearState, navigate]);
      
      const signUp = useCallback(async (fullName, email, password, role, phone) => {
        setLoading(true);
        const selectedRole = (role ? String(role) : 'homeowner').toLowerCase();
        const signupMeta = {
          full_name: fullName,
          // app_role is the selected user role we care about
          app_role: selectedRole,
          // role is the internal permission baseline
          role: 'member',
          phone: phone,
        };
        console.log('=== SIGNUP (src/contexts) sending metadata ===', signupMeta);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: signupMeta
          }
        });
        setLoading(false);

        if (error) {
          toast({
            variant: "destructive",
            title: "Sign up Failed",
            description: error.message || "An unknown error occurred.",
          });
          return null;
        } 

        if (data.user && data.user.identities && data.user.identities.length === 0) {
          toast({
            variant: "destructive",
            title: "Sign up Failed",
            description: "This email address is already in use.",
          });
          return null;
        }

        toast({
            title: "Success!",
            description: "Check your email for the confirmation link.",
        });

        return data.user;
      }, [toast]);

      const signIn = useCallback(async (email, password) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          setLoading(false);
          toast({
            variant: "destructive",
            title: "Sign in Failed",
            description: error.message || "Something went wrong",
          });
          return null;
        }
        return data.user;
      }, [toast]);
      
      const signInWithOAuth = useCallback(async (provider) => {
        setLoading(true);
        try {
          await supabase.auth.signInWithOAuth({ provider });
        } finally {
          setLoading(false);
        }
      }, []);
      
      const updateUser = useCallback(async (profileData) => {
        if (!user) return;
        
        const updateData = {...profileData};

        const { data, error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "Something went wrong",
          });
        } else {
          setProfile(prev => ({...prev, ...data}));
          setUser(prev => ({...prev, ...data}));
          toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
          });
        }
      }, [user, toast]);

      const hasPermission = useCallback((requiredPermission) => {
        if (!profile) return false;
        if (profile.app_role === 'admin') return true;
        return false;
      }, [profile]);

      const deleteUser = useCallback(async (userIdToDelete) => {
        const { data, error } = await supabase.functions.invoke('delete-user', {
          body: { userIdToDelete },
        });

        if (error) {
          toast({
            variant: "destructive",
            title: "Delete User Failed",
            description: error.message || "Something went wrong",
          });
        } else {
          toast({
            title: "User Deleted",
            description: "The user has been successfully deleted.",
          });
        }
        return { data, error };
      }, [toast]);

      const value = useMemo(() => ({
        user,
        profile,
        session,
        loading,
        plan,
        features,
        limits,
        trialStatus,
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        updateUser,
        deleteUser,
        hasPermission,
        initializationError,
        setUserAndProfile: (user, profile) => { setUser(user); setProfile(profile); },
      }), [user, profile, session, loading, plan, features, limits, trialStatus, signUp, signIn, signInWithOAuth, signOut, updateUser, deleteUser, hasPermission, initializationError]);

      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };

    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    };