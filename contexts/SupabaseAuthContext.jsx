// import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
//     import { supabase } from '@/lib/customSupabaseClient';
//     import { useToast } from '@/components/ui/use-toast';
//     import { useNavigate } from 'react-router-dom';

//     const AuthContext = createContext(undefined);

//     export const AuthProvider = ({ children }) => {
//       const { toast } = useToast();
//       const navigate = useNavigate();

//       const [user, setUser] = useState(null);
//       const [profile, setProfile] = useState(null);
//       const [session, setSession] = useState(null);
//       const [loading, setLoading] = useState(true);
//       const [plan, setPlan] = useState(null);
//       const [features, setFeatures] = useState({});
//       const [limits, setLimits] = useState({});
//       const [trialStatus, setTrialStatus] = useState({ is_active: false, days_left: 0 });
//       const [initializationError, setInitializationError] = useState(null);

//       const clearState = useCallback(() => {
//           setUser(null);
//           setProfile(null);
//           setSession(null);
//           setPlan(null);
//           setFeatures({});
//           setLimits({});
//           setTrialStatus({ is_active: false, days_left: 0 });
//           setInitializationError(null);
//           setLoading(false);
//       }, []);

//       const initializeUserSession = useCallback(async (currentSession) => {
//         setLoading(true);
//         setInitializationError(null);

//         if (!currentSession?.user) {
//           clearState();
//           return;
//         }

//         try {
//           setSession(currentSession);
          
//           const { data: profileData, error: ensureError } = await supabase.rpc('ensure_profile');
//           if (ensureError) {
//             if (ensureError.message.toLowerCase().includes('bad jwt')) {
//               signOut();
//               throw new Error('Your session has expired. Please log in again.');
//             }
//             throw new Error(`Initialization Failed: ${ensureError.message}`);
//           }
          
//           const ensuredProfileResult = profileData[0];
//           console.log('=== PROFILE INITIALIZATION DEBUG ===');
//           console.log('Raw profile data from ensure_profile:', ensuredProfileResult);
//           console.log('User metadata from session:', currentSession.user.user_metadata);
//           console.log('Raw user data:', currentSession.user);
          
//           // Fix: app_role should be the user's selected role, role should be 'member'
//           const userSelectedRole = ensuredProfileResult.profile_role || 'homeowner';
//           const appRole = userSelectedRole; // app_role gets the user's selected role
//           const role = 'member'; // role is always 'member' for internal permissions
          
//           console.log('Extracted userSelectedRole:', userSelectedRole);
//           console.log('Set appRole to:', appRole);
//           console.log('Set role to:', role);
          
//           const ensuredProfile = {
//             id: ensuredProfileResult.profile_id,
//             email: ensuredProfileResult.profile_email,
//             full_name: ensuredProfileResult.profile_full_name,
//             app_role: appRole, // This should be the user's selected role (homebuilder, homeowner, subcontractor)
//             role: role, // This should always be 'member' for internal permissions
//             plan_tier: ensuredProfileResult.profile_plan_tier
//           };
//           console.log('Final profile object before correction:', ensuredProfile);

//           // Additional check: If the app_role is not what we expect, try to update it
//           if (ensuredProfile.app_role === 'freemium' || !ensuredProfile.app_role || ensuredProfile.app_role === 'member') {
//             console.log('=== ROLE CORRECTION NEEDED ===');
//             console.log('Current app_role:', ensuredProfile.app_role);
//             console.log('Current role:', ensuredProfile.role);
            
//             // Try to get the role from the user metadata
//             const userSelectedRole = currentSession.user.user_metadata?.role || 'homeowner';
//             console.log('User metadata role:', currentSession.user.user_metadata?.role);
//             console.log('Attempting to set app_role to:', userSelectedRole);
            
//             // Update the profile with the correct roles
//             const updateData = { 
//               app_role: userSelectedRole, // User's selected role
//               role: 'member' // Always member for internal permissions
//             };
//             console.log('Update data:', updateData);
            
//             const { error: updateError } = await supabase
//               .from('profiles')
//               .update(updateData)
//               .eq('id', currentSession.user.id);
              
//             if (updateError) {
//               console.error('Failed to update roles:', updateError);
//             } else {
//               console.log('Successfully updated app_role to:', userSelectedRole, 'and role to member');
//               ensuredProfile.app_role = userSelectedRole;
//               ensuredProfile.role = 'member';
//             }
//           } else {
//             console.log('No role correction needed. App role is:', ensuredProfile.app_role);
//           }
          
//           console.log('Final profile object after correction:', ensuredProfile);
          
//           // Additional check: Let's see what's actually in the database
//           console.log('=== DATABASE VERIFICATION ===');
//           const { data: dbProfile, error: dbError } = await supabase
//             .from('profiles')
//             .select('*')
//             .eq('id', currentSession.user.id)
//             .single();
            
//           if (dbError) {
//             console.error('Error fetching profile from database:', dbError);
//           } else {
//             console.log('Actual database profile:', dbProfile);
//             console.log('Database app_role:', dbProfile.app_role);
//             console.log('Database role:', dbProfile.role);
//           }
//           console.log('=== DATABASE VERIFICATION END ===');
//           console.log('=== PROFILE INITIALIZATION DEBUG END ===');

//           const fullUser = { ...currentSession.user, ...ensuredProfile };
//           setUser(fullUser);
//           setProfile(ensuredProfile);

//           const [planResult, trialResult] = await Promise.all([
//             supabase.rpc('get_user_plan', { p_user_id: currentSession.user.id }),
//             supabase.rpc('is_on_active_trial', { p_user_id: currentSession.user.id })
//           ]);

//           const { data: planData, error: planError } = planResult;
//           if (planError) throw new Error(`Failed to load plan: ${planError.message}`);
          
//           if (planData && planData.length > 0) {
//             const userPlan = planData[0];
//             setPlan(userPlan.plan_name?.toLowerCase());
//             setFeatures(userPlan.features || {});
//             setLimits(userPlan.limits || {});
//           } else {
//             setPlan('freemium');
//             setFeatures({});
//             setLimits({});
//           }

//           const { data: trialData, error: trialError } = trialResult;
//           if (trialError) {
//             console.error("Failed to load trial status:", trialError.message);
//             setTrialStatus({ is_active: false, days_left: 0 });
//           } else {
//             setTrialStatus(trialData[0] || { is_active: false, days_left: 0 });
//           }

//           await supabase.rpc('sync_profile_email');

//         } catch (error) {
//           console.error("Error during user initialization:", error);
//           setInitializationError(error.message);
//           toast({
//             variant: "destructive",
//             title: "Initialization Failed",
//             description: error.message,
//           });
//           // Do not clear state here, as user might be logged in but plan failed
//         } finally {
//           setLoading(false);
//         }
//       }, [toast, clearState, navigate]);

//       useEffect(() => {
//         const { data: { subscription } } = supabase.auth.onAuthStateChange(
//           async (_event, session) => {
//             if (_event === 'SIGNED_OUT') {
//                 clearState();
//                 navigate('/login', { replace: true });
//             } else if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED' || (_event === 'INITIAL_SESSION' && session)) {
//                 await initializeUserSession(session);
//             } else if (!session) {
//                 setLoading(false);
//             }
//           }
//         );
        
//         return () => {
//           subscription.unsubscribe();
//         };
//       }, [initializeUserSession, navigate, clearState]);
      
//       const signUp = useCallback(async (fullName, email, password, role, phone) => {
//         setLoading(true);
//         console.log('=== SIGNUP DEBUG START ===');
//         console.log('SignUp called with role:', role);
//         console.log('Full signup parameters:', { fullName, email, role, phone });
        
//         const selectedRole = role ? role.toLowerCase() : 'homeowner';
//         console.log('Selected role to be stored:', selectedRole);
        
//         const signupData = {
//           full_name: fullName,
//           role: selectedRole, 
//           phone: phone,
//         };
//         console.log('Data being sent to Supabase:', signupData);
        
//         const { data, error } = await supabase.auth.signUp({
//           email,
//           password,
//           options: {
//             data: signupData
//           }
//         });
        
//         console.log('Supabase signup response:', { data, error });
//         console.log('=== SIGNUP DEBUG END ===');
//         setLoading(false);

//         if (error) {
//           toast({
//             variant: "destructive",
//             title: "Sign up Failed",
//             description: error.message || "An unknown error occurred.",
//           });
//           return null;
//         } 

//         if (data.user && data.user.identities && data.user.identities.length === 0) {
//           toast({
//             variant: "destructive",
//             title: "Sign up Failed",
//             description: "This email address is already in use.",
//           });
//           return null;
//         }

//         toast({
//             title: "Success!",
//             description: "Check your email for the confirmation link.",
//         });

//         return data.user;
//       }, [toast]);

//       const signIn = useCallback(async (email, password) => {
//         setLoading(true);
//         const { data, error } = await supabase.auth.signInWithPassword({
//           email,
//           password,
//         });
        
//         if (error) {
//           setLoading(false);
//           toast({
//             variant: "destructive",
//             title: "Sign in Failed",
//             description: error.message || "Something went wrong",
//           });
//           return null;
//         }
//         return data.user;
//       }, [toast]);
      
//       const signInWithOAuth = useCallback(async (provider) => {
//         setLoading(true);
//         await supabase.auth.signInWithOAuth({ provider });
//       }, []);

//       const signOut = useCallback(async () => {
//         setLoading(true);
//         const { error } = await supabase.auth.signOut();
//         if (error) {
//           toast({
//             variant: "destructive",
//             title: "Sign out Failed",
//             description: error.message || "Something went wrong",
//           });
//         }
//         setLoading(false);
//       }, [toast]);
      
//       const updateUser = useCallback(async (profileData) => {
//         if (!user) return;
        
//         const updateData = {...profileData};
//         if(updateData.app_role) {
//           updateData.app_role = updateData.app_role.toLowerCase();
//         }

//         const { data, error } = await supabase
//           .from('profiles')
//           .update(updateData)
//           .eq('id', user.id)
//           .select()
//           .single();

//         if (error) {
//           toast({
//             variant: "destructive",
//             title: "Update Failed",
//             description: error.message || "Something went wrong",
//           });
//         } else {
//           setProfile(prev => ({...prev, ...data}));
//           setUser(prev => ({...prev, ...data}));
//           toast({
//             title: "Profile Updated",
//             description: "Your profile has been successfully updated.",
//           });
//         }
//       }, [user, toast]);

//       const hasPermission = useCallback((requiredPermission) => {
//         if (!profile) return false;
//         if (profile.app_role === 'admin') return true;
//         return false;
//       }, [profile]);

//       const deleteUser = useCallback(async (userIdToDelete) => {
//         const { data, error } = await supabase.functions.invoke('delete-user', {
//           body: { userIdToDelete },
//         });

//         if (error) {
//           toast({
//             variant: "destructive",
//             title: "Delete User Failed",
//             description: error.message || "Something went wrong",
//           });
//         } else {
//           toast({
//             title: "User Deleted",
//             description: "The user has been successfully deleted.",
//           });
//         }
//         return { data, error };
//       }, [toast]);

//       const value = useMemo(() => ({
//         user,
//         profile,
//         session,
//         loading,
//         plan,
//         features,
//         limits,
//         trialStatus,
//         signUp,
//         signIn,
//         signInWithOAuth,
//         signOut,
//         updateUser,
//         deleteUser,
//         hasPermission,
//         initializationError,
//         setUserAndProfile: (user, profile) => { setUser(user); setProfile(profile); },
//       }), [user, profile, session, loading, plan, features, limits, trialStatus, signUp, signIn, signInWithOAuth, signOut, updateUser, deleteUser, hasPermission, initializationError]);

//       return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
//     };

//     export const useAuth = () => {
//       const context = useContext(AuthContext);
//       if (context === undefined) {
//         throw new Error('useAuth must be used within an AuthProvider');
//       }
//       return context;
//     };