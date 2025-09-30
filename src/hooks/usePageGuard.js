import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { hasMinRole, hasScopeIfIntegrator } from '@/lib/rbac.js';

export const usePageGuard = ({ requireMinRole, requireScopeIfIntegrator = null, redirect = '/dashboard' }) => {
  const { loading: authLoading, membership } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!membership) {
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }

    const roleOk = hasMinRole(membership.role, requireMinRole);
    const scopeOk = requireScopeIfIntegrator ? hasScopeIfIntegrator(membership.role, membership.scopes, requireScopeIfIntegrator) : true;

    if (roleOk && scopeOk) {
      setIsAuthorized(true);
    } else {
      console.warn(`Permission denied. Role: ${membership.role}, Required: ${requireMinRole}. Scope check: ${scopeOk}. Redirecting.`);
      navigate(redirect, { replace: true });
    }
  }, [authLoading, membership, requireMinRole, requireScopeIfIntegrator, navigate, redirect, location]);

  return { loading: authLoading || !isAuthorized, membership };
};