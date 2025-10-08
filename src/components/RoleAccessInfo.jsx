import React, { useState } from 'react';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Shield, Users, Truck, DollarSign, Settings, HelpCircle, Calendar, Briefcase, BrainCircuit, HardHat } from 'lucide-react';

const moduleIcons = {
  overview: Shield,
  projects: Briefcase,
  planner: Calendar,
  askBuilder: BrainCircuit,
  constructionMgt: HardHat,
  workforce: Users,
  supplyChain: Truck,
  financials: DollarSign,
  configuration: Settings,
  help: HelpCircle
};

const RoleAccessInfo = () => {
  const { 
    userRole, 
    roleDisplayName, 
    getAccessibleModules, 
    hasFullAccess, 
    hasLimitedAccess,
    getAvailableFeatures 
  } = useRolePermissions();
  
  const [expandedModules, setExpandedModules] = useState({});

  const accessibleModules = getAccessibleModules();

  const toggleModule = (module) => {
    setExpandedModules(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };

  const getAccessBadgeVariant = (access) => {
    switch (access) {
      case 'full': return 'default';
      case 'limited': return 'secondary';
      default: return 'outline';
    }
  };

  const getAccessColor = (access) => {
    switch (access) {
      case 'full': return 'text-green-600';
      case 'limited': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role Access Information
        </CardTitle>
        <CardDescription>
          Your current role: <Badge variant="outline">{roleDisplayName}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accessibleModules.map(({ module, access }) => {
            const Icon = moduleIcons[module];
            const isExpanded = expandedModules[module];
            const availableFeatures = getAvailableFeatures(module);
            
            return (
              <Collapsible key={module} open={isExpanded} onOpenChange={() => toggleModule(module)}>
                <Card className="hover:shadow-md transition-shadow">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <CardTitle className="text-sm capitalize">
                            {module.replace(/([A-Z])/g, ' $1').trim()}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getAccessBadgeVariant(access)}>
                            {access}
                          </Badge>
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className={`text-sm font-medium ${getAccessColor(access)}`}>
                          Access Level: {access === 'full' ? 'Full Access' : 'Limited Access'}
                        </div>
                        
                        {access === 'limited' && Array.isArray(availableFeatures) && availableFeatures.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-600 mb-1">Available Features:</div>
                            <div className="flex flex-wrap gap-1">
                              {availableFeatures.map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {access === 'full' && (
                          <div className="text-xs text-green-600">
                            ✓ All features available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Role Summary</h4>
          <p className="text-sm text-blue-700">
            As a <strong>{roleDisplayName}</strong>, you have access to {accessibleModules.length} modules. 
            {accessibleModules.filter(m => m.access === 'full').length > 0 && (
              <span> You have full access to {accessibleModules.filter(m => m.access === 'full').length} modules.</span>
            )}
            {accessibleModules.filter(m => m.access === 'limited').length > 0 && (
              <span> You have limited access to {accessibleModules.filter(m => m.access === 'limited').length} modules.</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleAccessInfo;
