import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

/**
 * Role-based route guard component
 * Protects routes based on user role permissions
 */
const RoleBasedRouteGuard = ({ children, requiredModule, requiredFeature, fallbackPath = '/dashboard/overview' }) => {
  const { hasModuleAccess, hasFeatureAccess, userRole, roleDisplayName } = useRolePermissions();
  const location = useLocation();

  // Check if user has access to the required module
  if (requiredModule && !hasModuleAccess(requiredModule)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <Alert className="border-red-200 bg-red-50">
            <Shield className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="font-semibold mb-2">Access Denied</div>
              <p>
                As a {roleDisplayName}, you don't have permission to access this section. 
                Please contact your administrator if you believe this is an error.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Check if user has access to the specific feature
  if (requiredFeature && !hasFeatureAccess(requiredModule, requiredFeature)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="font-semibold mb-2">Limited Access</div>
              <p>
                As a {roleDisplayName}, you have limited access to this section. 
                Some features may not be available to you.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleBasedRouteGuard;
