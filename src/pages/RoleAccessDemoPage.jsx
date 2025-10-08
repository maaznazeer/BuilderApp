import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, Truck, DollarSign, Settings, HelpCircle, Calendar, Briefcase, BrainCircuit, HardHat, AlertTriangle } from 'lucide-react';
import RoleAccessInfo from '@/components/RoleAccessInfo';

const RoleAccessDemoPage = () => {
  const { user, updateUser } = useAuth();
  const { 
    userRole, 
    roleDisplayName, 
    hasModuleAccess, 
    hasFullAccess, 
    hasLimitedAccess,
    getAvailableFeatures,
    canAccessRoute 
  } = useRolePermissions();
  
  const [selectedRole, setSelectedRole] = useState(userRole || 'homeowner');
  const [testRoute, setTestRoute] = useState('/dashboard/overview');

  const roles = [
    { value: 'homeowner', label: 'Homeowner' },
    { value: 'homebuilder', label: 'Homebuilder / Contractor' },
    { value: 'subcontractor', label: 'Subcontractor' }
  ];

  const testRoutes = [
    '/dashboard/overview',
    '/dashboard/projects',
    '/dashboard/project-management',
    '/dashboard/ask-brain',
    '/dashboard/construction-process',
    '/dashboard/workers',
    '/dashboard/payroll',
    '/dashboard/suppliers',
    '/dashboard/inventory',
    '/dashboard/grn',
    '/dashboard/gin',
    '/dashboard/stock-movements',
    '/dashboard/project-materials',
    '/dashboard/financial-ledger',
    '/dashboard/project-settings'
  ];

  const handleRoleChange = async (newRole) => {
    setSelectedRole(newRole);
    // Update user role in the context
    if (updateUser) {
      await updateUser({ app_role: newRole });
    }
  };

  const modules = [
    { id: 'overview', name: 'Overview', icon: Shield },
    { id: 'projects', name: 'Projects', icon: Briefcase },
    { id: 'planner', name: 'Planner', icon: Calendar },
    { id: 'askBuilder', name: 'Ask Builder (AI)', icon: BrainCircuit },
    { id: 'constructionMgt', name: 'Construction Mgt', icon: HardHat },
    { id: 'workforce', name: 'Workforce', icon: Users },
    { id: 'supplyChain', name: 'Supply Chain', icon: Truck },
    { id: 'financials', name: 'Financials', icon: DollarSign },
    { id: 'configuration', name: 'Configuration', icon: Settings },
    { id: 'help', name: 'Help/FAQ', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Role-Based Access Control Demo</h1>
          <p className="text-gray-600">Test and visualize role-based permissions for different user types</p>
        </div>

        {/* Role Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Role Testing</CardTitle>
            <CardDescription>Switch between different user roles to see how access changes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Current Role</label>
                <Select value={selectedRole} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Test Route Access</label>
                <Select value={testRoute} onValueChange={setTestRoute}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a route" />
                  </SelectTrigger>
                  <SelectContent>
                    {testRoutes.map(route => (
                      <SelectItem key={route} value={route}>
                        {route}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Alert className={canAccessRoute(testRoute) ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {canAccessRoute(testRoute) ? (
                <Shield className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={canAccessRoute(testRoute) ? 'text-green-800' : 'text-red-800'}>
                {canAccessRoute(testRoute) 
                  ? `✓ Access granted to ${testRoute}` 
                  : `✗ Access denied to ${testRoute}`
                }
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Module Access Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Module Access Matrix</CardTitle>
            <CardDescription>Current access level for each module based on your role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map(module => {
                const Icon = module.icon;
                const hasAccess = hasModuleAccess(module.id);
                const isFullAccess = hasFullAccess(module.id);
                const isLimitedAccess = hasLimitedAccess(module.id);
                const availableFeatures = getAvailableFeatures(module.id);
                
                return (
                  <Card key={module.id} className={`${hasAccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">{module.name}</h3>
                          <div className="flex gap-2 mt-1">
                            {isFullAccess && <Badge variant="default">Full</Badge>}
                            {isLimitedAccess && <Badge variant="secondary">Limited</Badge>}
                            {!hasAccess && <Badge variant="destructive">No Access</Badge>}
                          </div>
                        </div>
                      </div>
                      
                      {isLimitedAccess && Array.isArray(availableFeatures) && (
                        <div className="text-xs text-gray-600">
                          <div className="font-medium mb-1">Available features:</div>
                          <div className="flex flex-wrap gap-1">
                            {availableFeatures.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Role Access Information */}
        <RoleAccessInfo />
      </div>
    </div>
  );
};

export default RoleAccessDemoPage;
