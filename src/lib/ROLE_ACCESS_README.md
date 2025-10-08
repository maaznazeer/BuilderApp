# Role-Based Access Control System

This document describes the role-based access control (RBAC) system implemented for the BuilderApp dashboard, based on the provided permissions table.

## User Roles

The system supports three main user roles:

1. **Homeowner** - Full access to all modules
2. **Homebuilder / Contractor** - Full access to all modules  
3. **Subcontractor** - Limited access to specific modules and features

## Permission Matrix

Based on the provided access table, here's how each role can access different modules:

| Module | Homeowner | Homebuilder/Contractor | Subcontractor |
|--------|-----------|----------------------|---------------|
| Overview | Full | Full | Limited (Workforce, Supply Chain, Alerts) |
| Projects | Full | Full | Limited (Workforce, Supply Chain, Alerts) |
| Planner | Full | Full | Limited (Calendar, Workload, Materials) |
| Ask Builder (AI) | Full | Full | Limited |
| Construction Mgt | Full | Full | No |
| Workforce | Full | Full | Limited (timesheets, Tasks & Work Orders) |
| Supply Chain | Full | Full | Limited (GRN, GIN, Stock Movements, Project Materials) |
| Financials | Full | Full | Limited |
| Configuration | Full | Full | No |
| Help/FAQ | Full | Full | Limited |

## Implementation Files

### Core Files

1. **`src/lib/rolePermissions.js`** - Main permissions configuration and utility functions
2. **`src/hooks/useRolePermissions.js`** - React hook for role-based permissions
3. **`src/components/RoleBasedRouteGuard.jsx`** - Route protection component
4. **`src/components/RoleAccessInfo.jsx`** - Component to display user access information
5. **`src/pages/RoleAccessDemoPage.jsx`** - Demo page for testing role access

### Updated Files

1. **`src/components/dashboard/dashboardConfig.js`** - Updated to filter navigation based on role permissions

## Usage Examples

### Basic Permission Checks

```javascript
import { useRolePermissions } from '@/hooks/useRolePermissions';

const MyComponent = () => {
  const { hasModuleAccess, hasFullAccess, hasLimitedAccess } = useRolePermissions();
  
  // Check if user can access a module
  if (hasModuleAccess('workforce')) {
    // Show workforce content
  }
  
  // Check if user has full access
  if (hasFullAccess('financials')) {
    // Show all financial features
  }
  
  // Check if user has limited access
  if (hasLimitedAccess('supplyChain')) {
    // Show limited supply chain features
  }
};
```

### Route Protection

```javascript
import RoleBasedRouteGuard from '@/components/RoleBasedRouteGuard';

const ProtectedPage = () => (
  <RoleBasedRouteGuard requiredModule="constructionMgt">
    <ConstructionManagementContent />
  </RoleBasedRouteGuard>
);
```

### Feature-Level Access

```javascript
const { hasFeatureAccess } = useRolePermissions();

// Check specific feature access
if (hasFeatureAccess('workforce', 'timesheets')) {
  // Show timesheet functionality
}
```

## Subcontractor Limited Access Details

For subcontractors with limited access, specific features are available:

### Overview Module
- Workforce information
- Supply Chain alerts
- General alerts

### Projects Module  
- Workforce assignments
- Supply Chain updates
- Project alerts

### Planner Module
- Calendar view
- Workload information
- Materials planning

### Workforce Module
- Timesheets
- Tasks & Work Orders
- (No payroll access)

### Supply Chain Module
- Goods Received Notes (GRN)
- Goods Issue Notes (GIN)
- Stock Movements
- Project Materials
- (No supplier management or inventory management)

## Testing

Run the test suite to verify role-based access:

```bash
npm test src/lib/__tests__/rolePermissions.test.js
```

## Demo Page

Visit `/role-access-demo` to test the role-based access system with different user roles.

## Key Features

1. **Dynamic Navigation** - Sidebar navigation automatically filters based on user role
2. **Route Protection** - Routes are protected based on role permissions
3. **Feature-Level Access** - Granular control over specific features within modules
4. **Visual Feedback** - Clear indicators of access levels and limitations
5. **Extensible** - Easy to add new roles or modify permissions

## Adding New Roles

To add a new role:

1. Add the role to `ROLE_PERMISSIONS` in `src/lib/rolePermissions.js`
2. Define the permission matrix for the new role
3. Add any specific limited access features to `SUBCONTRACTOR_LIMITED_ACCESS` if needed
4. Update the role display names in `getRoleDisplayName` function

## Security Considerations

- All permission checks are performed client-side for UI filtering
- Server-side validation should be implemented for API endpoints
- Role information should be validated on the backend
- Sensitive operations should always be protected server-side

## Future Enhancements

1. **Server-side validation** - Implement backend role validation
2. **Dynamic permissions** - Allow permissions to be modified at runtime
3. **Permission inheritance** - Support for role hierarchies
4. **Audit logging** - Track permission changes and access attempts
5. **Time-based permissions** - Temporary access grants
