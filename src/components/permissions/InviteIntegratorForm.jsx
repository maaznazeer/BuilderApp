import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/customSupabaseClient';
import { hasMinRole, hasScopeIfIntegrator } from '@/lib/rbac.js';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const InviteIntegratorForm = () => {
  const formRef = useRef(null);
  const msgRef = useRef(null);
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const form = formRef.current;
    if (!form) return;

    const setupForm = async () => {
      if (!profile) return;
        
      const canInvite = hasMinRole(profile.app_role, 'admin');

      if (!canInvite) {
        if(isMounted) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'You do not have permission to invite integrators.' });
            navigate('/dashboard');
        }
        return;
      }
      
      const { data: orgData, error: orgError } = await supabase.from('orgs').select('id').limit(1).single();
      if (orgError && isMounted) {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not resolve organization.' });
          return;
      }
      const orgId = orgData.id;

      const emailInput = form.querySelector('#inv-email');
      const daysInput = form.querySelector('#inv-days');
      const scopeSettings = form.querySelector('#scope-settings');
      const scopeContent = form.querySelector('#scope-content');
      const scopeUsers = form.querySelector('#scope-users');
      const msg = msgRef.current;

      async function findUserIdByEmail(email) {
        const { data, error } = await supabase.from('profiles').select('id').eq('email', email).single();
        if (error) return null;
        return data?.id ?? null;
      }

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!msg) return;
        msg.textContent = 'Processing...';

        const email = (emailInput.value || '').trim().toLowerCase();
        const days = Math.max(1, Math.min(30, parseInt(daysInput.value || '7', 10)));

        const scopes = {};
        if (scopeSettings.checked) scopes.settings = true;
        if (scopeContent.checked) scopes.content = true;
        if (scopeUsers.checked) scopes.users = true;

        try {
          const userId = await findUserIdByEmail(email);
          if (!userId) {
            msg.textContent = 'User not found. Ask them to sign up first.';
            return;
          }

          const validTo = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

          const { error } = await supabase.from('memberships').insert({ org_id: orgId, user_id: userId, role: 'integrator', valid_to: validTo, scopes });

          if (error) {
            msg.textContent = `Error: ${error.message}`;
          } else {
            msg.textContent = `Success! Integrator invited for ${days} day(s).`;
            form.reset();
          }
        } catch (err) {
          msg.textContent = `Error: ${err.message}`;
        }
      };

      form.addEventListener('submit', handleSubmit);

      return () => {
        if(form) form.removeEventListener('submit', handleSubmit);
      };
    };

    const cleanupPromise = setupForm();

    return () => {
      isMounted = false;
      if (cleanupPromise) {
          cleanupPromise.then(cleanup => {
              if (typeof cleanup === 'function') {
                  cleanup();
              }
          });
      }
    };
  }, [profile, toast, navigate]);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Invite Integrator</CardTitle>
        <CardDescription>
          Grant temporary, scoped access to an external collaborator.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="invite-integrator-form" ref={formRef}>
          <div className="space-y-4">
            <div>
              <label htmlFor="inv-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="inv-email" type="email" placeholder="integrator@example.com" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="inv-days" className="block text-sm font-medium text-gray-700 mb-1">Days (1–30)</label>
              <input id="inv-days" type="number" min="1" max="30" defaultValue="7" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-2">Scopes</legend>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input id="scope-settings" type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Settings</span>
                </label>
                <label className="flex items-center">
                  <input id="scope-content" type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Content</span>
                </label>
                <label className="flex items-center">
                  <input id="scope-users" type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Users</span>
                </label>
              </div>
            </fieldset>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Invite Integrator
            </button>
            <div id="inv-msg" ref={msgRef} style={{ marginTop: '0.5rem' }} className="text-sm text-gray-600"></div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InviteIntegratorForm;