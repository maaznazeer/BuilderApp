import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldAlert } from 'lucide-react';
import { hasMinRole } from '@/lib/rbac';

const AuthGuard = ({ children, roles }) => {
  const { profile, loading, initializationError } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-lg font-semibold text-gray-700">Verifying session...</p>
      </div>
    );
  }

  if (initializationError) {
    return <Navigate to="/login" state={{ from: location, error: 'Session invalid. Please log in again.' }} replace />;
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = profile.app_role || 'homeowner';
  const hasPermission = roles.some(requiredRole => hasMinRole(userRole, requiredRole));

  if (!hasPermission) {
    return (
      <Navigate 
        to="/pricing" 
        state={{ 
          from: location, 
          unauthorized: true, 
          featureName: "AI Toolkit"
        }} 
        replace 
      />
    );
  }
  
  return children;
};

export default AuthGuard;