import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  hasModuleAccess, 
  hasFullAccess, 
  hasLimitedAccess, 
  getAvailableFeatures,
  hasFeatureAccess,
  getAccessibleModules,
  getRoleDisplayName
} from '@/lib/rolePermissions';

/**
 * Custom hook for role-based permissions
 * @returns {Object} Permission utilities and user role information
 */
export const useRolePermissions = () => {
  const { user } = useAuth();
  const userRole = user?.app_role || user?.role;

  return {
    // User role information
    userRole,
    roleDisplayName: getRoleDisplayName(userRole),
    
    // Permission checkers
    hasModuleAccess: (module) => hasModuleAccess(userRole, module),
    hasFullAccess: (module) => hasFullAccess(userRole, module),
    hasLimitedAccess: (module) => hasLimitedAccess(userRole, module),
    hasFeatureAccess: (module, feature) => hasFeatureAccess(userRole, module, feature),
    
    // Get available features for a module
    getAvailableFeatures: (module) => getAvailableFeatures(userRole, module),
    
    // Get all accessible modules for the user
    getAccessibleModules: () => getAccessibleModules(userRole),
    
    // Helper functions
    isHomeowner: userRole?.toLowerCase() === 'homeowner',
    isHomebuilder: userRole?.toLowerCase() === 'homebuilder',
    isSubcontractor: userRole?.toLowerCase() === 'subcontractor',
    
    // Check if user can access a specific route
    canAccessRoute: (route) => {
      const routeModuleMap = {
        '/dashboard/overview': 'overview',
        '/dashboard/projects': 'projects',
        '/dashboard/project-management': 'planner',
        '/dashboard/ask-brain': 'askBuilder',
        '/dashboard/construction-process': 'constructionMgt',
        '/dashboard/workflow-templates': 'constructionMgt',
        '/dashboard/automations': 'constructionMgt',
        '/dashboard/workers': 'workforce',
        '/dashboard/payroll': 'workforce',
        '/dashboard/suppliers': 'supplyChain',
        '/dashboard/inventory': 'supplyChain',
        '/dashboard/purchases': 'supplyChain',
        '/dashboard/grn': 'supplyChain',
        '/dashboard/gin': 'supplyChain',
        '/dashboard/stock-movements': 'supplyChain',
        '/dashboard/project-materials': 'supplyChain',
        '/dashboard/financial-ledger': 'financials',
        '/dashboard/balance-digests': 'financials',
        '/dashboard/reconciliation': 'financials',
        '/dashboard/reports': 'financials',
        '/dashboard/project-settings': 'configuration'
      };
      
      const module = routeModuleMap[route];
      return module ? hasModuleAccess(userRole, module) : true;
    }
  };
};

export default useRolePermissions;
