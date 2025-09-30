import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/customSupabaseClient';

const SelectRolePage = () => {
  const { updateUser, user, signInWithOAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const next = params.get('next');
  const provider = params.get('provider');
  const pref = params.get('pref');
  const [role, setRole] = useState(pref || 'homeowner');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const enumMap = { homebuilder: 'Homebuilder', homeowner: 'Homeowner', subcontractor: 'Subcontractor' };
      const appRoleEnum = enumMap[role] || 'Homeowner';

      if (next === 'oauth' && provider) {
        // Pre-auth flow: just stash choice and go to OAuth
        localStorage.setItem('pendingOAuthRole', role);
        localStorage.setItem('pendingOAuthSource', 'signup');
        await signInWithOAuth(provider);
        return;
      }

      if (user) {
        await updateUser({ app_role: appRoleEnum, role: 'member' });
        navigate('/dashboard');
        return;
      }

      navigate('/login');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold">Choose your role</h1>
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
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Saving...' : 'Continue'}
        </Button>
      </form>
    </div>
  );
};

export default SelectRolePage;


