import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { protectRoute } from '@/lib/rbac.js';

export const useRbac = ({ requireMinRole, requireScopeIfIntegrator = null, redirect = '/dashboard' }) => {
  const [authData, setAuthData] = useState({ loading: true, membership: null });
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const checkAccess = async () => {
      // For now, we'll use a default orgSlug. This can be parameterized later.
      const orgSlug = 'default';

      try {
        const membership = await protectRoute({ 
          orgSlug, 
          requireMinRole, 
          requireScopeIfIntegrator, 
          redirect 
        });

        if (isMounted) {
          if (membership) {
            setAuthData({ loading: false, membership });
          }
          // If protectRoute redirects, the component will unmount, so no state update is needed.
        }
      } catch (error) {
        console.error("RBAC check failed:", error);
        if (isMounted) {
          setAuthData({ loading: false, membership: null });
          window.location.href = redirect;
        }
      }
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [requireMinRole, requireScopeIfIntegrator, redirect, location.key]); // Re-run if location changes

  return authData;
};