import { 
  hasModuleAccess, 
  hasFullAccess, 
  hasLimitedAccess, 
  getAvailableFeatures,
  hasFeatureAccess,
  getAccessibleModules,
  getRoleDisplayName,
  ROLE_PERMISSIONS,
  SUBCONTRACTOR_LIMITED_ACCESS
} from '../rolePermissions';

describe('Role Permissions', () => {
  describe('hasModuleAccess', () => {
    test('homeowner should have access to all modules', () => {
      expect(hasModuleAccess('homeowner', 'overview')).toBe(true);
      expect(hasModuleAccess('homeowner', 'projects')).toBe(true);
      expect(hasModuleAccess('homeowner', 'constructionMgt')).toBe(true);
      expect(hasModuleAccess('homeowner', 'configuration')).toBe(true);
    });

    test('homebuilder should have access to all modules', () => {
      expect(hasModuleAccess('homebuilder', 'overview')).toBe(true);
      expect(hasModuleAccess('homebuilder', 'projects')).toBe(true);
      expect(hasModuleAccess('homebuilder', 'constructionMgt')).toBe(true);
      expect(hasModuleAccess('homebuilder', 'configuration')).toBe(true);
    });

    test('subcontractor should have limited/no access to certain modules', () => {
      expect(hasModuleAccess('subcontractor', 'overview')).toBe(true);
      expect(hasModuleAccess('subcontractor', 'projects')).toBe(true);
      expect(hasModuleAccess('subcontractor', 'constructionMgt')).toBe(false);
      expect(hasModuleAccess('subcontractor', 'configuration')).toBe(false);
    });
  });

  describe('hasFullAccess', () => {
    test('homeowner should have full access to all modules', () => {
      expect(hasFullAccess('homeowner', 'overview')).toBe(true);
      expect(hasFullAccess('homeowner', 'financials')).toBe(true);
    });

    test('subcontractor should not have full access to any module', () => {
      expect(hasFullAccess('subcontractor', 'overview')).toBe(false);
      expect(hasFullAccess('subcontractor', 'projects')).toBe(false);
    });
  });

  describe('hasLimitedAccess', () => {
    test('subcontractor should have limited access to most modules', () => {
      expect(hasLimitedAccess('subcontractor', 'overview')).toBe(true);
      expect(hasLimitedAccess('subcontractor', 'projects')).toBe(true);
      expect(hasLimitedAccess('subcontractor', 'workforce')).toBe(true);
    });

    test('homeowner should not have limited access (should be full)', () => {
      expect(hasLimitedAccess('homeowner', 'overview')).toBe(false);
      expect(hasLimitedAccess('homeowner', 'projects')).toBe(false);
    });
  });

  describe('getAvailableFeatures', () => {
    test('should return all for full access', () => {
      expect(getAvailableFeatures('homeowner', 'overview')).toBe('all');
      expect(getAvailableFeatures('homebuilder', 'projects')).toBe('all');
    });

    test('should return specific features for limited access', () => {
      const features = getAvailableFeatures('subcontractor', 'workforce');
      expect(Array.isArray(features)).toBe(true);
      expect(features).toContain('timesheets');
      expect(features).toContain('tasks');
      expect(features).toContain('work_orders');
    });
  });

  describe('hasFeatureAccess', () => {
    test('homeowner should have access to all features', () => {
      expect(hasFeatureAccess('homeowner', 'workforce', 'timesheets')).toBe(true);
      expect(hasFeatureAccess('homeowner', 'workforce', 'payroll')).toBe(true);
    });

    test('subcontractor should have limited feature access', () => {
      expect(hasFeatureAccess('subcontractor', 'workforce', 'timesheets')).toBe(true);
      expect(hasFeatureAccess('subcontractor', 'workforce', 'tasks')).toBe(true);
      expect(hasFeatureAccess('subcontractor', 'workforce', 'payroll')).toBe(false);
    });
  });

  describe('getAccessibleModules', () => {
    test('should return all modules for homeowner', () => {
      const modules = getAccessibleModules('homeowner');
      expect(modules).toHaveLength(10); // All modules
      expect(modules.every(m => m.access === 'full')).toBe(true);
    });

    test('should return limited modules for subcontractor', () => {
      const modules = getAccessibleModules('subcontractor');
      expect(modules.length).toBeLessThan(10);
      expect(modules.some(m => m.access === 'limited')).toBe(true);
      expect(modules.some(m => m.access === 'full')).toBe(false);
    });
  });

  describe('getRoleDisplayName', () => {
    test('should return correct display names', () => {
      expect(getRoleDisplayName('homeowner')).toBe('Homeowner');
      expect(getRoleDisplayName('homebuilder')).toBe('Homebuilder / Contractor');
      expect(getRoleDisplayName('subcontractor')).toBe('Subcontractor');
      expect(getRoleDisplayName('unknown')).toBe('Unknown');
    });
  });

  describe('Permission Matrix Validation', () => {
    test('should match the provided access table', () => {
      // Homeowner - Full access to all
      expect(ROLE_PERMISSIONS.homeowner.overview).toBe('full');
      expect(ROLE_PERMISSIONS.homeowner.projects).toBe('full');
      expect(ROLE_PERMISSIONS.homeowner.constructionMgt).toBe('full');
      expect(ROLE_PERMISSIONS.homeowner.configuration).toBe('full');

      // Homebuilder - Full access to all
      expect(ROLE_PERMISSIONS.homebuilder.overview).toBe('full');
      expect(ROLE_PERMISSIONS.homebuilder.projects).toBe('full');
      expect(ROLE_PERMISSIONS.homebuilder.constructionMgt).toBe('full');
      expect(ROLE_PERMISSIONS.homebuilder.configuration).toBe('full');

      // Subcontractor - Limited/No access
      expect(ROLE_PERMISSIONS.subcontractor.overview).toBe('limited');
      expect(ROLE_PERMISSIONS.subcontractor.constructionMgt).toBe('no');
      expect(ROLE_PERMISSIONS.subcontractor.configuration).toBe('no');
    });
  });
});
