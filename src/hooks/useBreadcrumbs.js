import { useLocation, useParams } from 'react-router-dom';
    import { useMemo } from 'react';

    const breadcrumbNameMap = {
      'dashboard': 'Dashboard',
      'overview': 'Overview',
      'projects': 'Projects',
      'tasks': 'Tasks',
      'workforce': 'Workforce',
      'financials': 'Financials',
      'supply-chain': 'Supply Chain',
      'alerts': 'Alerts',
      'project-management': 'Project Management',
      'ask-brain': 'Ask-Builder',
      'ai-log': 'AI Log',
      'workers': 'Workers',
      'payroll': 'Payroll',
      'approvals': 'Approvals',
      'calendar': 'Calendar',
      'construction-process': 'Construction Process',
      'workflow-templates': 'Workflow Templates',
      'automations': 'Automations',
      'inventory': 'Inventory',
      'suppliers': 'Suppliers',
      'purchases': 'Purchases',
      'grn': 'GRN',
      'gin': 'GIN',
      'stock-movements': 'Stock Movements',
      'project-materials': 'Project Materials',
      'financial-ledger': 'Financial Ledger',
      'balance-digests': 'Balance Digests',
      'reconciliation': 'Reconciliation',
      'reports': 'Reports',
      'project-settings': 'Project Settings',
      'team': 'Team Directory',
      'media-logs': 'Media Logs',
      'fx-rates': 'FX Rates',
      'budget': 'Budget',
      'sourcing': 'Sourcing',
      'media': 'Media',
      'milestones': 'Milestones',
      'communication': 'Communication',
      'contingency': 'Contingency',
      'loans': 'Loans',
      'kb': 'Knowledge Base',
      'monitoring': 'AI Monitoring',
      'materials': 'AI Materials',
      'costs': 'AI Costs',
      'design': 'AI Design',
      'compliance': 'AI Compliance',
      'comms': 'AI Comms',
      'admin': 'Admin',
      'trials-requests': 'Trial Requests',
      'trials': 'Trials & Demos',
    };

    const useBreadcrumbs = () => {
      const location = useLocation();
      const params = useParams();

      const breadcrumbs = useMemo(() => {
        const pathnames = location.pathname.split('/').filter((x) => x);

        if (pathnames.length === 0 || pathnames[0] !== 'dashboard') {
          return [];
        }

        let crumbs = [{ label: 'Dashboard', path: '/dashboard/overview' }];

        pathnames.slice(1).forEach((value, index) => {
          const to = `/${pathnames.slice(0, index + 2).join('/')}`;
          let label = breadcrumbNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

          if (pathnames[1] === 'projects' && params.id && value === params.id) {
            label = 'Project Details';
          }
          
          if (crumbs.length > 0 && crumbs[crumbs.length - 1].label.toLowerCase() === label.toLowerCase()) {
            return;
          }

          crumbs.push({ label, path: to });
        });

        return crumbs;
      }, [location.pathname, params]);

      return breadcrumbs;
    };

    export default useBreadcrumbs;