// Role-based permissions configuration based on the provided access table
export const ROLE_PERMISSIONS = {
  homeowner: {
    overview: 'full',
    projects: 'full',
    planner: 'full',
    askBuilder: 'full',
    constructionMgt: 'full',
    workforce: 'full',
    supplyChain: 'full',
    financials: 'full',
    configuration: 'full',
    help: 'full'
  },
  homebuilder: {
    overview: 'full',
    projects: 'full',
    planner: 'full',
    askBuilder: 'full',
    constructionMgt: 'full',
    workforce: 'full',
    supplyChain: 'full',
    financials: 'full',
    configuration: 'full',
    help: 'full'
  },
  subcontractor: {
    overview: 'limited', // Workforce, Supply Chain, Alerts
    projects: 'limited', // Workforce, Supply Chain, Alerts
    planner: 'limited', // Calendar, Workload, Materials
    askBuilder: 'limited',
    constructionMgt: 'no',
    workforce: 'full', // timesheets, Tasks & Work Orders
    supplyChain: 'limited', // GRN, GIN, Stock Movements, Project Materials
    financials: 'no',
    configuration: 'no',
    help: 'limited'
  }
};

// Detailed module permissions for subcontractors
export const SUBCONTRACTOR_LIMITED_ACCESS = {
  overview: ['workforce', 'supply_chain', 'alerts'],
  projects: ['workforce', 'supply_chain', 'alerts'],
  planner: ['calendar', 'workload', 'materials'],
  workforce: ['timesheets', 'tasks', 'work_orders'],
  supplyChain: ['grn', 'gin', 'stock_movements', 'project_materials']
};

// Check if user has access to a specific module
export function hasModuleAccess(userRole, module) {
  const role = userRole?.toLowerCase();
  const permissions = ROLE_PERMISSIONS[role];
  
  if (!permissions) return false;
  
  const moduleAccess = permissions[module];
  return moduleAccess === 'full' || moduleAccess === 'limited';
}

// Check if user has full access to a module
export function hasFullAccess(userRole, module) {
  const role = userRole?.toLowerCase();
  const permissions = ROLE_PERMISSIONS[role];
  
  if (!permissions) return false;
  
  return permissions[module] === 'full';
}

// Check if user has limited access to a module
export function hasLimitedAccess(userRole, module) {
  const role = userRole?.toLowerCase();
  const permissions = ROLE_PERMISSIONS[role];
  
  if (!permissions) return false;
  
  return permissions[module] === 'limited';
}

// Get available features for a specific module based on user role
export function getAvailableFeatures(userRole, module) {
  const role = userRole?.toLowerCase();
  
  if (hasFullAccess(role, module)) {
    return 'all'; // Full access to all features
  }
  
  if (hasLimitedAccess(role, module)) {
    return SUBCONTRACTOR_LIMITED_ACCESS[module] || [];
  }
  
  return []; // No access
}

// Check if a specific feature is available for the user
export function hasFeatureAccess(userRole, module, feature) {
  const role = userRole?.toLowerCase();
  
  if (hasFullAccess(role, module)) {
    return true;
  }
  
  if (hasLimitedAccess(role, module)) {
    const availableFeatures = SUBCONTRACTOR_LIMITED_ACCESS[module] || [];
    return availableFeatures.includes(feature);
  }
  
  return false;
}

// Get user role display name
export function getRoleDisplayName(role) {
  const roleMap = {
    homeowner: 'Homeowner',
    homebuilder: 'Homebuilder / Contractor',
    subcontractor: 'Subcontractor'
  };
  
  return roleMap[role?.toLowerCase()] || 'Unknown';
}

// Get all modules accessible to a role
export function getAccessibleModules(userRole) {
  const role = userRole?.toLowerCase();
  const permissions = ROLE_PERMISSIONS[role];
  
  if (!permissions) return [];
  
  return Object.entries(permissions)
    .filter(([module, access]) => access !== 'no')
    .map(([module, access]) => ({ module, access }));
}
