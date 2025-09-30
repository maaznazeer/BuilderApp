import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSidebarNavItems } from '@/components/dashboard/dashboardConfig';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Breadcrumbs = ({ className }) => {
  const location = useLocation();
  const { profile } = useAuth();
  const navItems = getSidebarNavItems(profile);

  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs = [{ label: 'Dashboard', path: '/dashboard/overview', icon: Home }];

    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/overview') {
      return breadcrumbs;
    }

    let currentPath = '/dashboard';
    
    const allNavItems = navItems.flatMap(section => 
      section.items.flatMap(item => item.children ? item.children : item)
    );

    pathnames.slice(1).forEach((value) => {
      currentPath += `/${value}`;
      const navItem = allNavItems.find(item => {
        // Handle dynamic paths like /projects/:id
        const pattern = new RegExp(`^${item.href.replace(/:[^\s/]+/g, '([^/]+)')}$`);
        return pattern.test(currentPath);
      });

      if (navItem) {
        breadcrumbs.push({ label: navItem.title, path: currentPath });
      } else if (!isNaN(Number(value)) || value.length > 10) { 
        // A simple check for dynamic IDs (numeric or long strings like UUIDs)
        const previousItem = breadcrumbs[breadcrumbs.length - 1];
        if (previousItem) {
          const detailLabel = previousItem.label.endsWith('s') ? previousItem.label.slice(0, -1) : previousItem.label;
          breadcrumbs.push({ label: `${detailLabel} Details`, path: currentPath });
        }
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-1.5 text-sm text-muted-foreground", className)}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          <Link
            to={item.path}
            className={cn(
              "flex items-center gap-1.5 transition-colors hover:text-foreground",
              index === breadcrumbItems.length - 1 ? "font-medium text-foreground pointer-events-none" : ""
            )}
            aria-current={index === breadcrumbItems.length - 1 ? 'page' : undefined}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              {item.label}
            </span>
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;