import { supabase } from '@/lib/customSupabaseClient';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import React, { useState, useEffect } from 'react';

const ROLE_RANK_MAP = {
    owner: 100,
    admin: 90,
    billing_admin: 80,
    manager: 70,
    editor: 60,
    integrator: 55,
    viewer: 50,
    auditor: 40,
    support: 35
};

export async function getSessionRole(orgSlug) {
    if (!orgSlug) {
        console.warn("getSessionRole was called without an organization slug. Falling back to default.");
        orgSlug = 'default';
    }

    try {
        const { data, error } = await supabase.rpc('get_profile_and_membership', { p_org_slug: orgSlug });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching session role:', error.message);
        return null;
    }
}

export function hasMinRole(role, minRole) {
    const userRank = ROLE_RANK_MAP[role] || 0;
    const minRank = ROLE_RANK_MAP[minRole] || 0;
    return userRank >= minRank;
}

export function hasScopeIfIntegrator(role, scopes, scopeKey) {
    if (role !== 'integrator') {
        return true; 
    }
    if (!scopes || !Array.isArray(scopes)) {
        return false;
    }
    return scopes.includes(scopeKey);
}

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-700">Checking permissions...</h2>
        </div>
    </div>
);

export const useRbac = ({ orgSlug, requireMinRole, requireScopeIfIntegrator }) => {
    const [authStatus, setAuthStatus] = useState({ loading: true, authorized: false, sessionData: null });
    const { user, loading: authContextLoading } = useAuth();
    
    useEffect(() => {
        if (authContextLoading) {
            return;
        }

        if (!user) {
            setAuthStatus({ loading: false, authorized: false, sessionData: null });
            return;
        }

        const checkPermissions = async () => {
            const sessionData = await getSessionRole(orgSlug);

            if (!sessionData || !sessionData.role) {
                setAuthStatus({ loading: false, authorized: false, sessionData: null });
                return;
            }

            const { role, scopes } = sessionData;
            let isAuthorized = true;

            if (requireMinRole && !hasMinRole(role, requireMinRole)) {
                console.warn(`Role check failed: User role '${role}' does not meet minimum '${requireMinRole}'.`);
                isAuthorized = false;
            }

            if (isAuthorized && requireScopeIfIntegrator && !hasScopeIfIntegrator(role, scopes, requireScopeIfIntegrator)) {
                console.warn(`Scope check failed for integrator: Missing scope '${requireScopeIfIntegrator}'.`);
                isAuthorized = false;
            }
            
            setAuthStatus({ loading: false, authorized: isAuthorized, sessionData });
        };

        checkPermissions();
    }, [user, authContextLoading, orgSlug, requireMinRole, requireScopeIfIntegrator]);

    return authStatus;
};

export const RbacRoute = ({ children, orgSlug, requireMinRole, requireScopeIfIntegrator, redirect = '/dashboard' }) => {
    const location = useLocation();
    const { user, loading: authContextLoading } = useAuth();
    const rbacStatus = useRbac({ orgSlug, requireMinRole, requireScopeIfIntegrator });

    if (authContextLoading || rbacStatus.loading) {
        return <LoadingFallback />;
    }

    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (!rbacStatus.authorized) {
        return <Navigate to={redirect} state={{ error: "You don't have permission to access this page." }} replace />;
    }
    
    return React.cloneElement(children, { sessionData: rbacStatus.sessionData });
};