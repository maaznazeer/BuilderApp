import {
        LayoutDashboard, Briefcase, Calendar, ClipboardCheck,
        Users, Truck, Warehouse, ShoppingCart, ArrowRightLeft,
        FileText, Settings, Bot, DollarSign, Banknote, BookOpen, Repeat, CreditCard, HardHat, Cog, Shield, Sparkles, BrainCircuit, HelpCircle
    } from 'lucide-react';
import { hasModuleAccess, hasFullAccess, hasLimitedAccess, getAvailableFeatures } from '@/lib/rolePermissions';
    
    export const dashboardConfig = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, permission: 'view_overview' },
        { id: 'projects', label: 'Projects', icon: Briefcase, permission: 'view_projects' },
        { id: 'project-management', label: 'Planner', icon: Calendar, permission: 'view_planner' },
        { id: 'ask-brain', label: 'Ask-Builder Brain', icon: BrainCircuit, permission: 'use_ai_assistant' },
        { id: 'construction-process', label: 'Construction Process', icon: ClipboardCheck, permission: 'view_construction_mgt' },
        { id: 'workflow-templates', label: 'Workflow Templates', icon: FileText, permission: 'manage_templates' },
        { id: 'automations', label: 'Automations', icon: Bot, permission: 'manage_automations' },
        { id: 'workers', label: 'Workers', icon: Users, permission: 'view_workforce' },
        { id: 'payroll', label: 'Payroll', icon: CreditCard, permission: 'manage_payroll' },
        { id: 'suppliers', label: 'Suppliers', icon: Truck, permission: 'view_supply_chain' },
        { id: 'inventory', label: 'Inventory', icon: Warehouse, permission: 'view_supply_chain' },
        { id: 'purchases', label: 'Material Purchases', icon: ShoppingCart, permission: 'view_supply_chain' },
        { id: 'grn', label: 'Goods Received Notes', icon: FileText, permission: 'view_supply_chain' },
        { id: 'gin', label: 'Goods Issue Notes', icon: FileText, permission: 'view_supply_chain' },
        { id: 'stock-movements', label: 'Stock Movements', icon: ArrowRightLeft, permission: 'view_supply_chain' },
        { id: 'project-materials', label: 'Project Materials', icon: ClipboardCheck, permission: 'view_supply_chain' },
        { id: 'financial-ledger', label: 'Financial Ledger', icon: BookOpen, permission: 'view_financials' },
        { id: 'balance-digests', label: 'Balance Digests', icon: Banknote, permission: 'view_financials' },
        { id: 'reconciliation', label: 'Reconciliation', icon: Repeat, permission: 'view_financials' },
        { id: 'reports', label: 'Reports', icon: FileText, permission: 'view_reports' },
        { id: 'project-settings', label: 'Project Settings', icon: Settings, permission: 'manage_project_settings' },
        { id: 'admin/trials-requests', label: 'Trial Requests', icon: Shield, permission: 'admin_access' },
        { id: 'admin/trials', label: 'Trials & Demos', icon: Sparkles, permission: 'admin_access' },
    ];
    
    
    export const getSidebarNavItems = (profile, onFaqOpen) => {
        const isAdmin = profile?.role === 'super_owner' || profile?.role === 'system_admin';
        const userRole = profile?.app_role || profile?.role;
        
        // Helper function to filter children based on role permissions
        const filterChildrenByRole = (children, module) => {
            if (!hasModuleAccess(userRole, module)) return [];
            
            if (hasFullAccess(userRole, module)) {
                return children;
            }
            
            if (hasLimitedAccess(userRole, module)) {
                const availableFeatures = getAvailableFeatures(userRole, module);
                return children.filter(child => {
                    if (availableFeatures === 'all') return true;
                    return availableFeatures.some(feature => {
                        // Convert feature name to match href format (underscores to hyphens)
                        const featureHyphen = feature.replace(/_/g, '-');
                        const featureSpace = feature.replace(/_/g, ' ');
                        return child.href?.includes(featureHyphen) || 
                               child.href?.includes(feature) ||
                               child.title?.toLowerCase().includes(featureSpace) ||
                               child.title?.toLowerCase().includes(feature);
                    });
                });
            }
            
            return [];
        };
    
        const navItems = [
            {
                items: [
                    hasModuleAccess(userRole, 'overview') && { 
                        href: '/dashboard/overview', 
                        title: 'Overview', 
                        icon: LayoutDashboard, 
                        color: 'text-sky-400' 
                    },
                    hasModuleAccess(userRole, 'projects') && { 
                        href: '/dashboard/projects', 
                        title: 'Projects', 
                        icon: Briefcase, 
                        color: 'text-violet-400' 
                    },
                    hasModuleAccess(userRole, 'planner') && { 
                        href: '/dashboard/project-management', 
                        title: 'Planner', 
                        icon: Calendar, 
                        color: 'text-emerald-400' 
                    },
                    // hasModuleAccess(userRole, 'askBuilder') && { 
                    //     href: '/dashboard/ask-brain', 
                    //     title: 'Ask-Builder Brain', 
                    //     icon: BrainCircuit, 
                    //     color: 'text-amber-400' 
                    // }
                ].filter(Boolean),
            },
            {
                items: [
                    hasModuleAccess(userRole, 'constructionMgt') && {
                        title: 'Construction Mgt',
                        icon: HardHat,
                        color: 'text-rose-400',
                        children: filterChildrenByRole([
                            { href: '/dashboard/construction-process', title: 'Construction Process', icon: ClipboardCheck, color: 'text-rose-400' },
                            { href: '/dashboard/workflow-templates', title: 'Workflow Templates', icon: FileText, color: 'text-orange-400' },
                            // { href: '/dashboard/automations', title: 'Automations', icon: Bot, color: 'text-yellow-400' }
                        ], 'constructionMgt')
                    },
                    hasModuleAccess(userRole, 'workforce') && {
                        title: 'Workforce',
                        icon: Users,
                        color: 'text-teal-400',
                        children: filterChildrenByRole([
                            { href: '/dashboard/workers', title: 'Workers', icon: Users, color: 'text-teal-400' },
                            { href: '/dashboard/payroll', title: 'Payroll', icon: CreditCard, color: 'text-green-400' },
                        ], 'workforce')
                    },
                    hasModuleAccess(userRole, 'supplyChain') && {
                        title: 'Supply Chain',
                        icon: Truck,
                        color: 'text-fuchsia-400',
                        children: filterChildrenByRole([
                            { href: '/dashboard/suppliers', title: 'Suppliers', icon: Truck, color: 'text-fuchsia-400' },
                            { href: '/dashboard/inventory', title: 'Inventory', icon: Warehouse, color: 'text-purple-400' },
                            { href: '/dashboard/purchases', title: 'Material Purchases', icon: ShoppingCart, color: 'text-pink-400' },
                            { href: '/dashboard/grn', title: 'Goods Received Notes', icon: FileText, color: 'text-red-400' },
                            { href: '/dashboard/gin', title: 'Goods Issue Notes', icon: FileText, color: 'text-red-400' },
                            { href: '/dashboard/stock-movements', title: 'Stock Movements', icon: ArrowRightLeft, color: 'text-indigo-400' },
                            { href: '/dashboard/project-materials', title: 'Project Materials', icon: ClipboardCheck, color: 'text-blue-400' }
                        ], 'supplyChain')
                    },
                    hasModuleAccess(userRole, 'financials') && {
                        title: 'Financials',
                        icon: DollarSign,
                        color: 'text-cyan-400',
                        children: filterChildrenByRole([
                            { href: '/dashboard/financial-ledger', title: 'Financial Ledger', icon: BookOpen, color: 'text-cyan-400' },
                            { href: '/dashboard/balance-digests', title: 'Balance Digests', icon: Banknote, color: 'text-lime-400' },
                            { href: '/dashboard/reconciliation', title: 'Reconciliation', icon: Repeat, color: 'text-green-400' },
                            { href: '/dashboard/reports', title: 'Reports', icon: FileText, color: 'text-gray-400' }
                        ], 'financials')
                    },
                    hasModuleAccess(userRole, 'configuration') && {
                        title: 'Configuration',
                        icon: Cog,
                        color: 'text-slate-400',
                        children: filterChildrenByRole([
                            { href: '/dashboard/project-settings', title: 'Project Settings', icon: Settings, color: 'text-slate-400' },
                        ], 'configuration')
                    },
                    hasModuleAccess(userRole, 'help') && {
                        title: 'Help / FAQ',
                        icon: HelpCircle,
                        color: 'text-blue-300',
                        isCustom: true,
                        onClick: onFaqOpen
                    },
                ].filter(Boolean)
            }
        ];
    
        if (isAdmin) {
            navItems.push({
                items: [
                    {
                        title: 'Admin',
                        icon: Shield,
                        color: 'text-red-500',
                        children: [
                            { href: '/admin/trials-requests', title: 'Trial Requests', icon: Shield, color: 'text-red-500' },
                            { href: '/admin/trials', title: 'Trials & Demos', icon: Sparkles, color: 'text-yellow-500' },
                        ]
                    }
                ]
            });
        }
    
        return navItems;
    };